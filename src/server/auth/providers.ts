import z from "zod";
import { env } from "~/env";
import * as schema from "~/server/db/schema/tables";
import type { MySqlTable } from "drizzle-orm/mysql-core";
import type { tokenResultSchema } from "./schema";

interface OAuthProvider<
  Table extends Extract<(typeof schema)[keyof typeof schema], MySqlTable>,
> {
  /**
   * Sent in consent and token requests as `client_id`.
   */
  clientId: string;
  /**
   * Sent in token requests as `client_secret`.
   */
  clientSecret: string;
  /**
   * Defines the base URL and additional search parameters (e.g., `scope`) for redirecting a user to begin the OAuth flow.
   */
  consentRequest: {
    url: string;
    params: Record<string, string>;
  };
  /**
   * Defines the URL for requesting `access_token` (and, optionally, `refresh_token`) once a `code` has been provided.
   */
  tokensRequest: {
    url: string;
  };
  /**
   * Defines the URL and response schema for requesting a user's profile information using `access_token`.
   */
  profileRequest: {
    url: string;
    validator: z.ZodType<
      Omit<Table["$inferInsert"], keyof z.output<typeof tokenResultSchema>>
    >;
  };
  /**
   * Where to store a user's profile information.
   */
  table: Table;
  /**
   * Which column to store the foreign-key relation between a user and the table where their profile information is stored.
   */
  userRelationColumnName?: keyof (typeof schema)["users"]["$inferSelect"];
}

/**
 * Helper function for defining compliant OAuth configurations.
 * @param configuration The OAuth configuration.
 * @returns `configuration`
 */
function OAuthProvider<
  const T extends Extract<(typeof schema)[keyof typeof schema], MySqlTable>,
  const C extends OAuthProvider<T>,
>(configuration: C) {
  return configuration;
}

export const uga = OAuthProvider({
  name: "uga",
  clientId: env.AUTH_GOOGLE_ID,
  clientSecret: env.AUTH_GOOGLE_SECRET,
  consentRequest: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      scope:
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      access_type: "online",
      include_granted_scopes: "true",
      hd: "uga.edu",
    },
  },
  tokensRequest: {
    url: "https://oauth2.googleapis.com/token",
  },
  profileRequest: {
    url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    validator: z
      .object({
        email: z.string(),
        name: z.string(),
        picture: z.string().nullish(),
      })
      .transform((obj) => ({
        ugaMyId: obj.email.split("@")[0]!,
        legalName: obj.name,
        //image: obj.picture,
      })),
  },
  table: schema.users,
});

export const discord = OAuthProvider({
  name: "discord",
  clientId: env.DISCORD_CLIENT_ID,
  clientSecret: env.DISCORD_CLIENT_SECRET,
  consentRequest: {
    url: "https://discord.com/api/oauth2/authorize",
    params: {
      scope: "identify guilds.join",
    },
  },
  tokensRequest: {
    url: "https://discord.com/api/oauth2/token",
  },
  profileRequest: {
    url: "https://discord.com/api/users/@me",
    validator: z.object({
      id: z.string(),
      username: z.string(),
      avatar: z.string(),
    }),
  },
  table: schema.discordProfiles,
  userRelationColumnName: "discordId",
});

export const github = OAuthProvider({
  name: "github",
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  consentRequest: {
    url: "https://github.com/login/oauth/authorize",
    params: {
      scope: "read:org user:email",
    },
  },
  tokensRequest: {
    url: "https://github.com/login/oauth/access_token",
  },
  profileRequest: {
    url: "https://api.github.com/user",
    validator: z.object({
      id: z.int(),
      login: z.string(),
      avatar_url: z.string(),
    }),
  },
  table: schema.githubProfiles,
  userRelationColumnName: "githubId",
});
