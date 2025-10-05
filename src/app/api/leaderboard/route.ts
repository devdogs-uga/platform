import type { NextRequest } from "next/server";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const targetFields = [
  "Priority",
  "Time Estimate (Minutes)",
  "Quality",
  "Complexity",
];
// points = ((data.time_estimate / 60) * ((data.quality/3)*(50) + (data.priority/3)*(25) + (data.complexity/3)*(25))) || null;

export async function GET(request: NextRequest) {
  const fieldIds = await octokit
    .request("GET /orgs/{org}/projectsV2/{project_number}/fields", {
      org: "DevDogs-UGA",
      project_number: 3,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((fields) =>
      fields.data
        .filter((field) => targetFields.includes(field.name))
        .map((field) => ["fields[]", field.id.toString()]),
    );

  // const items = await octokit.rest.projects.listItemsForOrg({ org: "DevDogs-UGA", project_number: 3, fields: ["test"] })
  const leaderboard = new Map<string, number>();
  const results = await octokit
    .paginate(
      `https://api.github.com/orgs/${"DevDogs-UGA"}/projectsV2/${3}/items?${new URLSearchParams(fieldIds).toString()}`,
      {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    )
    .then((results) =>
      results.data
        .filter(
          (item) =>
            item.content_type === "Issue" && item.content.state === "closed",
        )
        .reduce((map, item) => {}),
    );

  for await (const { data: item } of results) {
    if (item.content_type === "Issue" && item.content.state === "closed") {
      const points =
        ((item.fields[1].value ?? 15 / 60) *
          ((parseInt(item.fields[2].value?.name.raw ?? 0) / 3) * 50 +
            (parseInt(item.fields[0].value?.name.raw ?? 0) / 3) * 25 +
            (parseInt(item.fields[3].value?.name.raw ?? 0) / 3) * 25)) /
        item.content.assignees.length;
        
      item.content.assignees.forEach(({ login }) => {
        leaderboard.set(login, (leaderboard.get(login) ?? 0) + points);
      });

      return leaderboard;
    }
  }

  // const items = await fetch(
  //   `https://api.github.com/orgs/${"DevDogs-UGA"}/projectsV2/${3}/items?${new URLSearchParams(fieldIds).toString()}`,
  //   {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  //       Accept: "application/vnd.github+json",
  //       "X-GitHub-Api-Version": "2022-11-28",
  //     },
  //   },
  // ).then(res => res.json()).then((results: unknown[]) => results.filter(item => item.content_type === "Issue" && item.));

  return Response.json(Object.fromEntries(leaderboard.entries()));
}
