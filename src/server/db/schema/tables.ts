import {
  and,
  eq,
  getTableName,
  sql,
  type ColumnType,
  type SQL
} from "drizzle-orm";
import {
  pgPolicy,
  pgSchema,
  pgTable,
  primaryKey,
  uniqueIndex,
  type ExtraConfigColumn,
  type PgColumnBaseConfig,
} from "drizzle-orm/pg-core";
import { authUid, authenticatedRole, } from "drizzle-orm/supabase";
import { env } from "~/env";

export function lower(
  col: ExtraConfigColumn<PgColumnBaseConfig<ColumnType>>,
): SQL {
  return sql`lower(${col})`;
}

// ---------------------------------------------------------------------------
// Supabase auth schema — read-only references for cross-schema FK constraints
// and relational queries. drizzle-kit is configured with schemaFilter: ["public"]
// so it will not attempt to create or migrate anything in the auth schema.
//
// Shape validated against Supabase GoTrue v2 (postgres-migrations ≥ 20221208132122).
// Run `drizzle-kit pull --config drizzle.auth.config.ts` in CI to detect drift.
// ---------------------------------------------------------------------------
const authSchema = pgSchema("auth");

/**
 * Typed shape for the `raw_user_meta_data` JSONB column in `auth.users`.
 * Populated from the Google OAuth user-info response on first sign-in.
 */
export type UserMetaData = {
  /** Google display name. */
  full_name?: string;
  /** Fallback display name field. */
  name?: string;
  /** Avatar URL from the OAuth provider. */
  avatar_url?: string;
};

const authUsers = authSchema.table("users", (d) => ({
  id: d.uuid().primaryKey(),
  email: d.text().notNull(),
  rawUserMetaData: d.jsonb("raw_user_meta_data").$type<UserMetaData>(),
}));

/**
 * Typed shape for the `identity_data` JSONB column in `auth.identities`.
 * The GoTrue server populates this from the OAuth provider's user-info
 * response. Field names vary by provider; all fields are optional.
 * `sub` and `user_name` are present for GitHub and Discord.
 *
 * Note: `@supabase/auth-js` types `identity_data` as `{ [key: string]: any }`,
 * so there is no upstream type to import — this definition is maintained here.
 */
export type IdentityData = {
  /** Provider user ID — mirrors `provider_user_id`. */
  sub?: string;
  /** Provider username/handle (GitHub login, Discord username, etc.). */
  user_name?: string;
  /** Display name. */
  name?: string;
  avatar_url?: string;
  email?: string;
};

/**
 * Read-only reference to `auth.identities`.
 * Each row represents one OAuth provider linked to a Supabase user.
 * `providerUserId` is the provider's own numeric/string ID for the account
 * (e.g. the GitHub numeric user ID, or the Discord snowflake ID).
 * `identityData` is the raw JSON returned by the provider — field names vary
 * per provider but typically include `user_name`/`name`/`avatar_url`.
 */
// const authIdentities = authSchema.table("identities", (d) => ({
//   id: d.uuid().primaryKey(),
//   userId: d.uuid("user_id").notNull(),
//   provider: d.text().notNull(),
//   providerUserId: d.text("provider_id").notNull(),
//   identityData: d.jsonb("identity_data").$type<IdentityData>(),
// }));

// ---------------------------------------------------------------------------
// Supabase storage schema — read-only reference for attaching RLS policies
// to storage.objects via pgPolicy(...).link(). drizzle-kit emits standalone
// CREATE POLICY statements; it does not attempt to manage the table itself.
// ---------------------------------------------------------------------------
const storageSchema = pgSchema("storage");

const storageObjects = storageSchema.table("objects", (d) => ({
  id: d.uuid().primaryKey(),
  bucketId: d.text("bucket_id"),
  name: d.text(),
  owner: d.uuid(),
}));

/**
 * Authenticated users may upload, replace, or delete their own avatar.
 * Each avatar is stored at the path equal to the user's ID inside the
 * public avatars bucket — one file per user, no subfolders.
 */
const avatarBucketCheck = and(
  eq(storageObjects.bucketId, sql.raw(env.NEXT_PUBLIC_AVATARS_BUCKET)),
  eq(storageObjects.name, sql`${authUid}::text`),
);

export const avatarInsertPolicy = pgPolicy("avatars_insert_own", {
  as: "permissive",
  for: "insert",
  to: authenticatedRole,
  withCheck: avatarBucketCheck,
}).link(storageObjects);

export const avatarUpdatePolicy = pgPolicy("avatars_update_own", {
  as: "permissive",
  for: "update",
  to: authenticatedRole,
  using: avatarBucketCheck,
  withCheck: avatarBucketCheck,
}).link(storageObjects);

export const avatarDeletePolicy = pgPolicy("avatars_delete_own", {
  as: "permissive",
  for: "delete",
  to: authenticatedRole,
  using: avatarBucketCheck,
}).link(storageObjects);

// ---------------------------------------------------------------------------
// Row-Level Security — policy factories
//
// Each factory derives the policy name from the column's parent table name so
// policies are consistently named and don't need to be repeated verbatim.
//
// `col.table` is populated before the extras builder is invoked, so
// getTableConfig(getColumnTable(col)).name is safe to call from within an extras array.
// ---------------------------------------------------------------------------

/** Restricts SELECT to the row owner. */
function restrictSelectToUser(
  col: ExtraConfigColumn<PgColumnBaseConfig<ColumnType>>,
) {
  // @ts-expect-error `table` doesn't exist on the type for `col`, even though it's there in runtime
  const policyName = `${getTableName(col.table)}_${col.name}_user_select_own`;
  return pgPolicy(policyName, {
    as: "permissive",
    for: "select",
    to: authenticatedRole,
    using: sql`${authUid} = ${col}`,
  });
}

/** Restricts INSERT to rows where the userId matches the session. */
function restrictInsertToUser(
  col: ExtraConfigColumn<PgColumnBaseConfig<ColumnType>>,
) {
  // @ts-expect-error `table` doesn't exist on the type for `col`, even though it's there in runtime
  const policyName = `${getTableName(col.table)}_${col.name}_user_insert_own`;
  return pgPolicy(policyName, {
    as: "permissive",
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`${authUid} = ${col}`,
  });
}

/** Restricts UPDATE to the row owner. */
function restrictUpdateToUser(
  col: ExtraConfigColumn<PgColumnBaseConfig<ColumnType>>,
) {
  // @ts-expect-error `table` doesn't exist on the type for `col`, even though it's there in runtime
  const policyName = `${getTableName(col.table)}_${col.name}_user_update_own`;
  return pgPolicy(policyName, {
    as: "permissive",
    for: "update",
    to: authenticatedRole,
    using: sql`${authUid} = ${col}`,
    withCheck: sql`${authUid} = ${col}`,
  });
}

/** Restricts DELETE to the row owner. */
function restrictDeleteToUser(
  col: ExtraConfigColumn<PgColumnBaseConfig<ColumnType>>,
) {
  // @ts-expect-error `table` doesn't exist on the type for `col`, even though it's there in runtime
  const policyName = `${getTableName(col.table)}_${col.name}_user_delete_own`;
  return pgPolicy(policyName, {
    as: "permissive",
    for: "delete",
    to: authenticatedRole,
    using: sql`${authUid} = ${col}`,
  });
}

/**
 * Blocks all client access (anon + authenticated). service_role bypasses RLS
 * and is unaffected. Used for tables that are only read/written by the backend.
 *
 * Has no column references, so the same instance can be included in multiple
 * tables' extras arrays — drizzle-kit emits a separate CREATE POLICY for each.
 */
const serviceRoleOnly = pgPolicy("backend_only", {
  as: "restrictive",
  for: "all",
  to: "public",
  using: sql`false`,
  withCheck: sql`false`,
});

/**
 * Merged profile table — replaces the former `public_profile` and `onboarding`
 * tables.
 *
 * `preferredName` is stored here (not in `auth.users`) because Supabase
 * re-merges OAuth provider data on every sign-in, which would overwrite any
 * preferred name stored in `raw_user_meta_data`. A `custom_access_token` hook
 * (see `supabase/hooks/custom_access_token.sql`) injects `preferredName` into
 * the OIDC `name` claim so OAuth clients always see the up-to-date value.
 *
 * Email is read directly from `auth.users.email`.
 */
export const profiles = pgTable(
  "profile",
  (d) => ({
    userId: d
      .uuid()
      .primaryKey()
      .references(() => authUsers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    preferredName: d.varchar({ length: 255 }).notNull(),
    showGithub: d.boolean().notNull().default(false),
    showDiscord: d.boolean().notNull().default(false),
    viewedSettings: d.boolean().notNull().default(false),
  }),
  // Authenticated users may only read and update their own profile row.
  // INSERT is handled server-side on first sign-in; DELETE cascades from auth.users.
  (table) => [
    restrictSelectToUser(table.userId),
    restrictUpdateToUser(table.userId),
  ],
);

export const profileLinks = pgTable(
  "profileLinks",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => profiles.userId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    url: d.text().notNull(),
    title: d.varchar({ length: 64 }).notNull(),
    createdAt: d.timestamp().defaultNow(),
  }),
  // Full CRUD for authenticated users on their own links.
  (table) => [
    restrictSelectToUser(table.userId),
    restrictInsertToUser(table.userId),
    restrictUpdateToUser(table.userId),
    restrictDeleteToUser(table.userId),
  ],
);

/**
 * Supabase OAuth client ID for a user's registered OAuth application.
 * Managed exclusively by the backend via supabaseAdmin (service_role).
 * The secret is never stored here; it is returned once by the admin API.
 */
export const oauthClients = pgTable(
  "oauthClients",
  (d) => ({
    userId: d
      .uuid()
      .primaryKey()
      .references(() => profiles.userId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    clientId: d.varchar({ length: 255 }).notNull().unique(),
  }),
  () => [serviceRoleOnly],
);

/**
 * One row per GitHub contributor to the DevDogs organisation.
 * Populated and updated by `syncLeaderboard`. The primary key is the GitHub
 * numeric user ID stored as `varchar` so it can be joined directly against
 * `auth.identities.provider_user_id` without a cast.
 */
export const leaderboardProfiles = pgTable(
  "leaderboardProfiles",
  (d) => ({
    githubId: d.varchar({ length: 255 }).primaryKey(),
    githubLogin: d.varchar({ length: 255 }).unique().notNull(),
    avatarUrl: d.text(),
    allTimePoints: d.integer().notNull().default(0),
    allTimeRanking: d.integer(),
    currentYearPoints: d.integer().notNull().default(0),
    currentYearRanking: d.integer(),
  }),
  (t) => [uniqueIndex("login_idx").on(lower(t.githubLogin)), serviceRoleOnly],
);

export const points = pgTable(
  "points",
  (d) => ({
    leaderboardProfileId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => leaderboardProfiles.githubId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    year: d.integer().notNull(),
    streakStart: d
      .date({ mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    streakLength: d.integer().notNull().default(0),
    longestStreakLength: d.integer().notNull().default(0),
    projectPoints: d.integer().notNull().default(0),
    streakBonusPoints: d.integer().notNull().default(0),
    academyPoints: d.integer().notNull().default(0),
    points: d
      .integer()
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`${points.projectPoints} + ${points.streakBonusPoints} + ${points.academyPoints}`,
      ),
  }),
  (t) => [
    primaryKey({ columns: [t.leaderboardProfileId, t.year] }),
    serviceRoleOnly,
  ],
);
