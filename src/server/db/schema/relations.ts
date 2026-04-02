import { defineRelations } from "drizzle-orm";
import * as tables from "./tables";

const relations = defineRelations(tables, (r) => ({
  users: {
    publicProfile: r.one.publicProfiles({
      from: r.users.id,
      to: r.publicProfiles.userId,
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
    oauthKey: r.one.oauthKeys({
      from: r.users.id,
      to: r.oauthKeys.clientId,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),
    publicProfile: r.one.publicProfiles({
      from: r.sessions.userId,
      to: r.publicProfiles.userId,
      optional: false,
    }),
    oauthKey: r.one.oauthKeys({
      from: r.sessions.userId,
      to: r.oauthKeys.userId,
    }),
  },
  oauthKeys: {
    client: r.one.users({
      from: r.oauthKeys.clientId,
      to: r.users.id,
    }),
  },
  publicProfiles: {
    user: r.one.users({
      from: r.publicProfiles.userId,
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
    points: r.many.points({
      from: r.githubProfiles.id,
      to: r.points.githubProfileId,
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
    client: r.one.oauthKeys({
      from: r.authorizationCodes.clientId,
      to: r.oauthKeys.clientId,
    }),
    user: r.one.users({
      from: r.authorizationCodes.userId,
      to: r.users.id,
    }),
  },
}));

export default relations;
