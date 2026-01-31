import { graphql } from "@octokit/graphql";
import { addWeeks, compareAsc, isAfter, parseISO } from "date-fns";
import { sql } from "drizzle-orm";
import { env } from "~/env";
import { db } from "../db";
import { githubProfiles, points as pointsTable } from "../db/schema/tables";
import {
  type ClosedIssuesResult,
  type ProjectFields,
  ClosedIssues,
} from "./queries";

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

interface ClosedIssue {
  assignee: ClosedIssuesResult["search"]["nodes"][number]["assignees"]["nodes"][number];
  basePoints: number;
  closedAt: Date;
}

async function getClosedIssues() {
  const results: ClosedIssue[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { search }: ClosedIssuesResult = await graphql(ClosedIssues, {
      cursor,
      searchQuery: `org:${env.GITHUB_ORG} type:issue is:closed`,
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
      },
    });

    for (const { assignees, projectItems, closedAt } of search.nodes) {
      const basePoints =
        calculateBasePoints(projectItems.nodes[0]) / assignees.nodes.length;

      for (const assignee of assignees.nodes) {
        results.push({
          basePoints,
          assignee,
          closedAt: parseISO(closedAt),
        });
      }
    }

    cursor = search.pageInfo.endCursor;
    hasNextPage = search.pageInfo.hasNextPage;
  }

  return results;
}

export default async function syncLeaderboard() {
  const closedIssues = await getClosedIssues();
  const profiles = new Map<
    number,
    Required<typeof githubProfiles.$inferInsert>
  >();

  closedIssues.sort((a, b) => compareAsc(a.closedAt, b.closedAt));

  for (const { assignee } of closedIssues) {
    profiles.set(assignee.databaseId, {
      id: assignee.databaseId,
      login: assignee.login,
      avatarUrl: assignee.avatarUrl,
      allTimePoints: 0,
      allTimeRanking: null,
      currentYearPoints: 0,
      currentYearRanking: null,
      accessTokenId: null,
    });
  }

  const points = new Map<number, Required<typeof pointsTable.$inferInsert>>();
  let year = env.DEVDOGS_EPOCH.getUTCFullYear();

  await db.transaction(async (tx) => {
    for (const { assignee, closedAt, basePoints } of closedIssues) {
      if (closedAt.getUTCFullYear() > year) {
        await tx
          .insert(pointsTable)
          .values([...points.values()])
          .onDuplicateKeyUpdate({
            set: {
              academyPoints: sql`values(${pointsTable.academyPoints})`,
              longestStreakLength: sql`values(${pointsTable.longestStreakLength})`,
              projectPoints: sql`values(${pointsTable.projectPoints})`,
              streakBonusPoints: sql`values(${pointsTable.streakBonusPoints})`,
              streakStart: sql`values(${pointsTable.streakStart})`,
              streakLength: sql`values(${pointsTable.streakLength})`,
            },
          });

        year = closedAt.getUTCFullYear();
        points.clear();
      }

      const pointsEntry = points.get(assignee.databaseId);
      const profile = profiles.get(assignee.databaseId)!;

      profile.allTimePoints += basePoints;

      if (year === new Date().getUTCFullYear()) {
        profile.currentYearPoints += basePoints;
      }

      if (!pointsEntry) {
        points.set(assignee.databaseId, {
          year,
          githubProfileId: assignee.databaseId,
          academyPoints: 0,
          streakStart: closedAt,
          streakLength: 1,
          longestStreakLength: 1,
          projectPoints: basePoints,
          streakBonusPoints: 0,
        });
        continue;
      }

      pointsEntry.projectPoints += basePoints;

      const streakRenewalStart = addWeeks(
        pointsEntry.streakStart,
        pointsEntry.streakLength,
      );

      const streakRenewalCutoff = addWeeks(
        pointsEntry.streakStart,
        pointsEntry.streakLength + 1,
      );

      if (isAfter(closedAt, streakRenewalCutoff)) {
        pointsEntry.streakStart = closedAt;
        pointsEntry.streakLength = 1;
        continue;
      }

      if (isAfter(closedAt, streakRenewalStart)) {
        pointsEntry.streakLength++;
      }

      pointsEntry.longestStreakLength = Math.max(
        pointsEntry.streakLength,
        pointsEntry.longestStreakLength,
      );

      const bonusPoints = (basePoints * pointsEntry.streakLength) / 10;
      pointsEntry.streakBonusPoints += bonusPoints;
      profile.allTimePoints += bonusPoints;

      if (year === new Date().getUTCFullYear()) {
        profile.currentYearPoints += bonusPoints;
      }
    }

    await tx
      .insert(pointsTable)
      .values([...points.values()])
      .onDuplicateKeyUpdate({
        set: {
          academyPoints: sql`values(${pointsTable.academyPoints})`,
          longestStreakLength: sql`values(${pointsTable.longestStreakLength})`,
          projectPoints: sql`values(${pointsTable.projectPoints})`,
          streakBonusPoints: sql`values(${pointsTable.streakBonusPoints})`,
          streakLength: sql`values(${pointsTable.streakLength})`,
          streakStart: sql`values(${pointsTable.streakStart})`,
        },
      });

    const profileValues = [...profiles.values()];
    profileValues.sort((a, b) => b.currentYearPoints - a.currentYearPoints);

    for (let i = 0; i < profileValues.length; i++) {
      profileValues[i]!.currentYearRanking = i + 1;
    }

    profileValues.sort((a, b) => b.allTimePoints - a.allTimePoints);

    for (let i = 0; i < profileValues.length; i++) {
      profileValues[i]!.allTimeRanking = i + 1;
    }

    await tx
      .insert(githubProfiles)
      .values(profileValues)
      .onDuplicateKeyUpdate({
        set: {
          login: sql`values(${githubProfiles.login})`,
          allTimePoints: sql`values(${githubProfiles.allTimePoints})`,
          allTimeRanking: sql`values(${githubProfiles.allTimeRanking})`,
          avatarUrl: sql`values(${githubProfiles.avatarUrl})`,
          currentYearPoints: sql`values(${githubProfiles.currentYearPoints})`,
          currentYearRanking: sql`values(${githubProfiles.currentYearRanking})`,
        },
      });
  });
}
