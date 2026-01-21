import { graphql } from "@octokit/graphql";
import { addDays, format, isBefore } from "date-fns";
import { sql } from "drizzle-orm";
import { env } from "~/env";
import { db } from "~/server/db";
import { githubProfiles } from "~/server/db/schema/tables";

const query = `
query ClosedOrgIssuesInDateRange(
  $search: String!
  $cursor: String
) {
  search(
    query: $search,
    type: ISSUE,
    first: 50,
    after: $cursor
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ... on Issue {
        assignees(first: 10) {
          nodes {
						databaseId
            login
						avatarUrl
          }
        }

        projectItems(first: 1) {
          nodes {
						quality: fieldValueByName(name: "Quality") {
							... on ProjectV2ItemFieldSingleSelectValue {
								name
							}
						}
						
						priority: fieldValueByName(name: "Priority") {
							... on ProjectV2ItemFieldSingleSelectValue {
								name
							}
						}
						
						complexity: fieldValueByName(name: "Complexity") {
							... on ProjectV2ItemFieldSingleSelectValue {
								name
							}
						}
					}
        }
      }
    }
  }
}`;

interface ProjectFields {
  quality: { name: string } | null;
  priority: { name: string } | null;
  complexity: { name: string } | null;
}

interface QueryResponse {
  search: {
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
    nodes: {
      assignees: {
        nodes: {
          databaseId: number;
          login: string;
          avatarUrl: string;
        }[];
      };
      projectItems: {
        nodes: [ProjectFields] | [];
      };
    }[];
  };
}

function tryParseInt(value: string | undefined) {
  if (!value) {
    return 1;
  }

  const parseResult = parseInt(value);

  if (isNaN(parseResult)) {
    return 1;
  }

  return parseResult;
}

function calculateBasePoints(fields: ProjectFields | undefined) {
  const quality = tryParseInt(fields?.quality?.name) / 3;
  const priority = tryParseInt(fields?.priority?.name) / 4;
  const complexity = tryParseInt(fields?.complexity?.name) / 3;
  return quality * (priority + complexity) * 120;
}

async function* getCompletedIssues(startDate: Date) {
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { search }: QueryResponse = await graphql(query, {
      cursor,
      search: `org:${env.GITHUB_ORG} type:issue is:closed closed:${format(startDate, "yyyy-MM-dd")}..${format(addDays(startDate, 6), "yyyy-MM-dd")}`,
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
      },
    });

    for (const { assignees, projectItems } of search.nodes) {
      const basePoints =
        calculateBasePoints(projectItems.nodes[0]) / assignees.nodes.length;

      for (const assignee of assignees.nodes) {
        yield { basePoints, assignee };
      }
    }

    cursor = search.pageInfo.endCursor;
    hasNextPage = search.pageInfo.hasNextPage;
  }
}

export default async function syncLeaderboard() {
  const now = Date.now();
  const updates = new Map<number, typeof githubProfiles.$inferInsert>();
  let streaks = new Map<number, number>();
  let startDate = env.DEVDOGS_EPOCH;

  // eslint-disable-next-line drizzle/enforce-update-with-where
  await db.update(githubProfiles).set({ points: 0 });

  while (isBefore(startDate, now)) {
    const newStreaks = new Map<number, number>();

    for await (const { basePoints, assignee } of getCompletedIssues(
      startDate,
    )) {
      const currentStreak = 1 + (streaks.get(assignee.databaseId) ?? 0);
      newStreaks.set(assignee.databaseId, currentStreak);

      const longestStreak = Math.max(
        currentStreak,
        updates.get(assignee.databaseId)?.longestStreak ?? 0,
      );

      const points =
        Math.floor(basePoints * (1 + currentStreak / 10)) +
        (updates.get(assignee.databaseId)?.points ?? 0);

      updates.set(assignee.databaseId, {
        id: assignee.databaseId,
        login: assignee.login,
        avatarUrl: assignee.avatarUrl,
        currentStreak: !isBefore(addDays(startDate, 7), now)
          ? currentStreak
          : 0,
        longestStreak,
        points,
      });
    }

    streaks = newStreaks;
    startDate = addDays(startDate, 7);
  }

  if (updates.size > 0) {
    await db
      .insert(githubProfiles)
      .values(
        [...updates.values()]
          .toSorted((a, b) => (b.points ?? 0) - (a.points ?? 0))
          .map((profile, i) => ({ ...profile, ranking: i + 1 })),
      )
      .onDuplicateKeyUpdate({
        set: {
          longestStreak: sql`values(${githubProfiles.longestStreak})`,
          currentStreak: sql`values(${githubProfiles.currentStreak})`,
          points: sql`values(${githubProfiles.points})`,
          ranking: sql`values(${githubProfiles.ranking})`,
        },
      });
  }
}
