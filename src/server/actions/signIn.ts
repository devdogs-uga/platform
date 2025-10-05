"use server";

import { redirect } from "next/navigation";
import { googleOAuth2 } from "../auth";

export default async function signIn() {
  redirect(
    googleOAuth2.generateAuthUrl({
      access_type: "online",
      hd: "uga.edu",
      include_granted_scopes: true,
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    }),
  );
}
