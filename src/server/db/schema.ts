import { createId } from "@paralleldrive/cuid2";
import { sql, type SQL } from "drizzle-orm";
import {
  mysqlTable,
  uniqueIndex,
  type AnyMySqlColumn,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm/relations";

export function lower(email: AnyMySqlColumn): SQL {
  return sql`(lower(${email}))`;
}

export const users = mysqlTable(
  "user",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey().$defaultFn(createId),
    email: d.varchar({ length: 255 }).notNull(),
    name: d.varchar({ length: 255 }).notNull(),
    image: d.varchar({ length: 255 }),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().onUpdateNow(),
    githubId: d
      .int()
      .references(() => githubProfiles.id, { onDelete: "set null" }),
    discordId: d
      .varchar({ length: 255 })
      .references(() => discordProfiles.id, { onDelete: "set null" }),
  }),
  (t) => [uniqueIndex("email_idx").on(lower(t.email))],
);

export const userRelations = relations(users, ({ one }) => ({
  github: one(githubProfiles, {
    fields: [users.githubId],
    references: [githubProfiles.id],
  }),
  discord: one(discordProfiles, {
    fields: [users.discordId],
    references: [discordProfiles.id],
  }),
}));

export const githubProfiles = mysqlTable(
  "github_profile",
  (d) => ({
    id: d.int().primaryKey(),
    login: d.varchar({ length: 255 }).notNull(),
    avatarUrl: d.text(),
    pointsAY2023: d.int().notNull().default(0),
    pointsAY2024: d.int().notNull().default(0),
    pointsAY2025: d.int().notNull().default(0),
    accessToken: d.varchar({ length: 255 }),
    accessTokenExpires: d.timestamp(),
    refreshToken: d.varchar({ length: 255 }),
  }),
  (t) => [uniqueIndex("login_idx").on(lower(t.login))],
);

export const githubProfileRelations = relations(githubProfiles, ({ one }) => ({
  user: one(users),
}));

export const discordProfiles = mysqlTable(
  "discord_profile",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey(),
    username: d.varchar({ length: 255 }).notNull(),
    avatar: d.varchar({ length: 255 }).notNull(),
    accessToken: d.varchar({ length: 255 }),
    accessTokenExpires: d.timestamp(),
    refreshToken: d.varchar({ length: 255 }),
  }),
  (t) => [uniqueIndex("username_idx").on(lower(t.username))],
);

export const discordProfileRelations = relations(
  discordProfiles,
  ({ one }) => ({
    user: one(users),
  }),
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

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
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
