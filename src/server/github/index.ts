import { env } from "~/env";

export const requestInit = {
  method: "GET",
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "X-Github-Api-Version": "2022-11-28",
  },
} satisfies RequestInit;
