"use server";

import { count, eq } from "drizzle-orm";
import ogs from "open-graph-scraper";
import * as z from "zod";
import * as zfd from "zod-form-data";
import { authenticate, expectSession } from "../auth";
import { db } from "../db";
import { profileLinks } from "../db/schema/tables";

export type AddLinkResult = {
  link?: typeof profileLinks.$inferSelect;
  error?: string;
};

const schema = zfd.formData({
  url: zfd.text(z.url()),
});

export default async function addProfileLink(
  formData: FormData,
): Promise<AddLinkResult> {
  const userId = await expectSession().catch(() =>
    authenticate("google", "/settings/profile"),
  );

  const parsed = await schema.safeParseAsync(formData);
  if (!parsed.success) return { error: "Invalid URL." };

  const { url } = parsed.data;
  const { protocol, hostname } = new URL(url);

  if (protocol !== "http:" && protocol !== "https:") {
    return { error: "Only http and https URLs are supported." };
  }

  return db.transaction(async (tx) => {
    const [{ linkCount }] = await tx
      .select({ linkCount: count() })
      .from(profileLinks)
      .where(eq(profileLinks.userId, userId));

    if ((linkCount ?? 0) >= 5) {
      return { error: "You can only add up to 5 links." };
    }

    // OG title fetching must remain server-side. Browsers block cross-origin
    // HTML fetches (CORS) unless the target sets Access-Control-Allow-Origin,
    // which almost no site does on its HTML pages.
    let title: string | null = null;
    try {
      const { result } = await ogs({ url, timeout: 5000 });
      title = result.ogTitle ?? result.dcTitle ?? null;
    } catch {
      // fall through to hostname fallback
    }

    const [inserted] = await tx
      .insert(profileLinks)
      .values({
        userId,
        url,
        title: title ?? hostname.charAt(0).toUpperCase() + hostname.slice(1),
      })
      .returning();

    if (!inserted) return { error: "Failed to save link." };

    return { link: inserted };
  });
}
