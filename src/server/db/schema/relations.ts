import { defineRelations } from "drizzle-orm";
import * as tables from "./tables";

const relations = defineRelations(tables, (r) => ({
  users: {
    publicProfile: r.one.publicProfiles({
      from: r.users.id,
      to: r.publicProfiles.id,
      optional: false,
    }),
    github: r.one.githubProfiles({
      from: r.users.githubId,
      to: r.githubProfiles.id,
    }),
    discord: r.one.discordProfiles({
      from: r.users.discordId,
      to: r.discordProfiles.id,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  publicProfiles: {
    user: r.one.users({
      from: r.publicProfiles.id,
      to: r.users.id,
      optional: false,
    }),
  },
  githubProfiles: {
    user: r.one.users({
      from: r.githubProfiles.id,
      to: r.users.discordId,
    }),
    SERVER_ONLY_DO_NOT_LEAK_authorization:
      r.one.SERVER_ONLY_DO_NOT_LEAK_accessTokens({
        from: r.githubProfiles.accessTokenId,
        to: r.SERVER_ONLY_DO_NOT_LEAK_accessTokens.id,
        optional: false,
      }),
  },
  discordProfiles: {
    user: r.one.users({
      from: r.discordProfiles.id,
      to: r.users.discordId,
      optional: false,
    }),
    SERVER_ONLY_DO_NOT_LEAK_authorization:
      r.one.SERVER_ONLY_DO_NOT_LEAK_accessTokens({
        from: r.discordProfiles.accessTokenId,
        to: r.SERVER_ONLY_DO_NOT_LEAK_accessTokens.id,
        optional: false,
      }),
  },
  authorizationCodes: {
    client: r.one.users({
      from: r.authorizationCodes.clientId,
      to: r.users.id,
      optional: false,
    }),
    user: r.one.users({
      from: r.authorizationCodes.userId,
      to: r.users.id,
    }),
  },
}));

export default relations;
