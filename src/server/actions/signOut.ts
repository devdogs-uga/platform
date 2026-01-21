"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../db";
import { sessions } from "../db/schema/tables";
import { getCallbackPath } from "../utilts";

export default async function signOut(formData: FormData) {
  const jar = await cookies();
  const token = jar.get("session")?.value;

  if (token) {
    jar.delete("session");
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  redirect(await getCallbackPath("/", formData));
}
