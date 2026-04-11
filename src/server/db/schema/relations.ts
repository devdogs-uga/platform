import { defineRelations } from "drizzle-orm";
import * as tables from "./tables";

const relations = defineRelations(tables, (r) => ({
  authUsers: {
    profile: r.one.profiles({
      from: r.authUsers.id,
      to: r.profiles.userId,
      optional: false,
    }),
    identities: r.many.authIdentities({
      from: r.authUsers.id,
      to: r.authIdentities.userId,
    }),
    githubIdentity: r.one.authIdentities({
      from: r.authUsers.id,
      to: r.authIdentities.userId,
      where: { provider: "github" },
    }),
    discordIdentity: r.one.authIdentities({
      from: r.authUsers.id,
      to: r.authIdentities.userId,
      where: { provider: "discord" },
    }),
    leaderboardProfile: r.one.leaderboardProfiles({
      from: r.authUsers.id.through(r.authIdentities.userId),
      to: r.leaderboardProfiles.githubId.through(
        r.authIdentities.providerUserId,
      ),
    }),
  },
  authIdentities: {
    user: r.one.authUsers({
      from: r.authIdentities.userId,
      to: r.authUsers.id,
      optional: false,
    }),
  },
  profiles: {
    authUser: r.one.authUsers({
      from: r.profiles.userId,
      to: r.authUsers.id,
      optional: false,
    }),
    links: r.many.profileLinks({
      from: r.profiles.userId,
      to: r.profileLinks.userId,
    }),
    oauthClient: r.one.oauthClients({
      from: r.profiles.userId,
      to: r.oauthClients.userId,
      optional: true,
    }),
  },
  profileLinks: {
    profile: r.one.profiles({
      from: r.profileLinks.userId,
      to: r.profiles.userId,
      optional: false,
    }),
  },
  oauthClients: {
    profile: r.one.profiles({
      from: r.oauthClients.userId,
      to: r.profiles.userId,
      optional: false,
    }),
  },
  leaderboardProfiles: {
    points: r.many.points({
      from: r.leaderboardProfiles.githubId,
      to: r.points.leaderboardProfileId,
    }),
  },
}));

export default relations;
