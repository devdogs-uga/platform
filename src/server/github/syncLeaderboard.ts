import { sql } from "drizzle-orm";
import { env } from "~/env";
import isInRange from "~/lib/isBetween";
import { requestInit } from ".";
import { db } from "../db";
import { githubProfiles } from "../db/schema";
import paginate from "./paginate";
import * as schema from "./schema";

function getProjectFields({ number }: { number: number }) {
  return fetch(
    `https://api.github.com/orgs/${env.GITHUB_ORG}/projectsV2/${number}/fields`,
    requestInit,
  )
    .then((res) => res.json())
    .then((obj) => schema.fieldsResults.parseAsync(obj))
    .then((fields) => ({ number, fields }));
}

interface Points {
  2023: number;
  2024: number;
  2025: number;
}

type Leaderboard = Map<number, schema.UserResult & { points: Points }>;

async function calculatePoints({
  number,
  fields,
}: schema.ProjectResult & {
  fields: schema.FieldsResult;
}) {
  const map: Leaderboard = new Map();
  const pagination = paginate(
    fetch(
      `https://api.github.com/orgs/${env.GITHUB_ORG}/projectsV2/${number}/items?${new URLSearchParams(
        [
          ["per_page", "100"],
          [
            "q",
            Object.keys(fields)
              .map((name) => "has:" + name.toLowerCase().replaceAll(" ", "-"))
              .concat("is:issue", "is:closed")
              .join(" "),
          ],
          ...Object.values(fields).map((field) => [
            "fields[]",
            field.id.toString(),
          ]),
        ],
      )}`,
      requestInit,
    ),
  );

  for await (const response of pagination) {
    const issues = await response
      .json()
      .then((obj) => schema.issueResults.parseAsync(obj));

    for (const { content, fields } of issues) {
      const points =
        ((fields["Time Estimate (Minutes)"] / 60) *
          ((fields.Quality / 3) * 50 +
            (fields.Priority / 3) * 25 +
            (fields.Complexity / 3) * 25)) /
        content.assignees.length;

      for (const assignee of content.assignees) {
        const existingEntry = map.get(assignee.id);

        map.set(assignee.id, {
          ...assignee,
          points: {
            2023:
              (existingEntry?.points[2023] ?? 0) +
              (isInRange([null, env.AY2023_POINTS_CUTOFF], content.closed_at)
                ? points
                : 0),
            2024:
              (existingEntry?.points[2024] ?? 0) +
              (isInRange(
                [env.AY2023_POINTS_CUTOFF, env.AY2024_POINTS_CUTOFF],
                content.closed_at,
              )
                ? points
                : 0),
            2025:
              (existingEntry?.points[2025] ?? 0) +
              (isInRange(
                [env.AY2024_POINTS_CUTOFF, env.AY2025_POINTS_CUTOFF],
                content.closed_at,
              )
                ? points
                : 0),
          },
        });
      }
    }
  }

  return map;
}

function aggregate(projects: Leaderboard[]) {
  const leaderboard: Leaderboard = new Map();

  for (const project of projects) {
    for (const [id, user] of project) {
      const exitingPoints = leaderboard.get(id)?.points;
      leaderboard.set(id, {
        ...user,
        points: {
          2023: (exitingPoints?.[2023] ?? 0) + user.points[2023],
          2024: (exitingPoints?.[2024] ?? 0) + user.points[2024],
          2025: (exitingPoints?.[2025] ?? 0) + user.points[2025],
        },
      });
    }
  }

  return [...leaderboard.values()];
}

export default function syncLeaderboard() {
  return fetch(
    `https://api.github.com/orgs/${env.GITHUB_ORG}/projectsV2`,
    requestInit,
  )
    .then((res) => res.json())
    .then((obj) => schema.projectResults.parseAsync(obj))
    .then((projects) => Promise.allSettled(projects.map(getProjectFields)))
    .then((results) =>
      Promise.allSettled(
        results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
          .map((project) => calculatePoints(project)),
      ),
    )
    .then((results) =>
      db
        .insert(githubProfiles)
        .values(
          aggregate(
            results
              .filter((result) => result.status === "fulfilled")
              .map((result) => result.value),
          ).map(({ avatar_url, points, ...user }) => ({
            ...user,
            avatarUrl: avatar_url ?? null,
            pointsAY2023: points[2023],
            pointsAY2024: points[2024],
            pointsAY2025: points[2025],
          })),
        )
        .onDuplicateKeyUpdate({
          set: {
            login: sql`values(${githubProfiles.login})`,
            avatarUrl: sql`values(${githubProfiles.avatarUrl})`,
            pointsAY2023: sql`values(${githubProfiles.pointsAY2023})`,
            pointsAY2024: sql`values(${githubProfiles.pointsAY2024})`,
            pointsAY2025: sql`values(${githubProfiles.pointsAY2025})`,
          },
        }),
    );
}
