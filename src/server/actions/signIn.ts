"use server";

import { notFound } from "next/navigation";
import * as z from "zod";
import { authenticate } from "../auth";
import { getCallbackPath } from "../utilts";

const realmSchema = z.literal(["uga", "discord", "github"]);

/**
 * Begins the authentication flow for a user.
 * @param formData Allows two fields.
 * - `realm` is the authentication provider. Defaults to `"uga"`.
 * - `callbackPath` is the path to redirect the user to after the action completes. Defaults to the value of the `referer` header if present or `/` if not.
 */
export default async function signIn(formData: FormData) {
  const callbackPath = await getCallbackPath("/", formData);
  const realm = await realmSchema
    .parseAsync(formData.get("realm"))
    .catch(() => "uga" as const);

  await authenticate(realm, callbackPath);

  console.error("Redirect failed.");
  notFound();
}
