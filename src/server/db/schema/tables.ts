import { createId } from "@paralleldrive/cuid2";
import { sql, type SQL } from "drizzle-orm";
import {
  mysqlTable,
  uniqueIndex,
  type AnyMySqlColumn,
} from "drizzle-orm/mysql-core";

function lower(email: AnyMySqlColumn): SQL {
  return sql`(lower(${email}))`;
}

export const SERVER_ONLY_DO_NOT_LEAK_authorizations = mysqlTable(
  "authorization",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
    accessToken: d.text().notNull(),
    accessTokenExpires: d.timestamp(),
    refreshToken: d.text(),
  }),
);

export const users = mysqlTable("user", (d) => ({
  id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  ugaMyId: d.varchar({ length: 255 }).notNull(),
  legalName: d.varchar({ length: 255 }).notNull(),
  viewedSettings: d.boolean().notNull().default(false),
  createdAt: d.timestamp().defaultNow().notNull(),
  githubId: d
    .int()
    .references(() => githubProfiles.id, { onDelete: "set null" }),
  discordId: d
    .varchar({ length: 255 })
    .references(() => discordProfiles.id, { onDelete: "set null" }),
}));

export const publicProfiles = mysqlTable("public_profile", (d) => ({
  id: d
    .varchar({ length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: d.varchar({ length: 255 }).notNull(),
  email: d.varchar({ length: 255 }),
  image: d.text(),
  githubUsername: d.varchar({ length: 255 }),
  discordUsername: d.varchar({ length: 255 }),
  linkedinUsername: d.varchar({ length: 255 }),
  instagramUsername: d.varchar({ length: 255 }),
  portfolioUrl: d.text(),
}));

export const githubProfiles = mysqlTable(
  "github_profile",
  (d) => ({
    id: d.int().primaryKey(),
    login: d.varchar({ length: 255 }).notNull(),
    avatarUrl: d.text(),
    // pointsPreviousYears: d.int().notNull().default(0),
    // pointsThisYear: d.int().notNull().default(0),
    currentStreak: d.int().notNull().default(0),
    longestStreak: d.int().notNull().default(0),
    points: d.int().notNull().default(0),
    ranking: d.int(),
    authorizationId: d
      .varchar({ length: 255 })
      .references(() => SERVER_ONLY_DO_NOT_LEAK_authorizations.id),
  }),
  (t) => [uniqueIndex("login_idx").on(lower(t.login))],
);

export const discordProfiles = mysqlTable(
  "discord_profile",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey(),
    username: d.varchar({ length: 255 }).notNull(),
    avatar: d.varchar({ length: 255 }).notNull(),
    authorizationId: d
      .varchar({ length: 255 })
      .references(() => SERVER_ONLY_DO_NOT_LEAK_authorizations.id),
  }),
  (t) => [uniqueIndex("username_idx").on(lower(t.username))],
);

export const sessions = mysqlTable("session", (d) => ({
  token: d
    .varchar({ length: 255 })
    .primaryKey()
    .$defaultFn(() =>
      Buffer.from(crypto.getRandomValues(new Uint8Array(128))).toString(
        "base64",
      ),
    ),
  userAgent: d.text(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: d.timestamp().defaultNow().notNull(),
}));

export const oauthStates = mysqlTable("oauth_states", (d) => ({
  token: d
    .varchar({ length: 255 })
    .primaryKey()
    .$defaultFn(() =>
      Buffer.from(crypto.getRandomValues(new Uint8Array(128))).toString(
        "base64",
      ),
    ),
  realm: d.mysqlEnum(["uga", "discord", "github"]).notNull(),
  callbackPath: d.text().notNull().default("/"),
  createdAt: d.timestamp().defaultNow().notNull(),
}));
