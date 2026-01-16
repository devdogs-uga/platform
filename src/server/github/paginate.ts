import { requestInit } from ".";

const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;

/**
 * Paginate through resources in a fetch call to the GitHub API.
 * @param fetchCall The initial fetch call to the GitHub API.
 * @returns Async generator of Responses.
 */
export default async function* paginate(fetchCall: Promise<Response>) {
  let next: Promise<Response> | null = fetchCall;

  while (next !== null) {
    const response: Response = await next;
    const nextUrl = response.headers.get("link")?.match(nextPattern)?.[0];
    yield response;

    if (!nextUrl) {
      return;
    }

    const url = new URL(response.url);

    url.searchParams.set(
      "after",
      new URLSearchParams(nextUrl).get("after") ?? "",
    );

    next = fetch(url, requestInit);
  }
}
