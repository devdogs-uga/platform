import * as z from "zod";
import { db } from "../db";
import { addSeconds } from "date-fns";
import { oauthStates } from "../db/schema/tables";
import { eq } from "drizzle-orm";

const authorizationCode = z.object({
  code: z.string(),
  state: z
    .string()
    .transform(
      async (stateToken) =>
        await db.transaction(async (tx) => {
          const state = await tx.query.oauthStates.findFirst({
            where: {
              token: {
                eq: stateToken,
              },
            },
          });

          await tx.delete(oauthStates).where(eq(oauthStates.token, stateToken));

          return state;
        }),
    )
    .nonoptional(),
});

const completeOAuthFlow = z.object({
  authorization: z
    .string()
    .transform(
      async (authorizationCode) =>
        await db.query.authorizationCodes.findFirst({
          where: { code: { eq: authorizationCode } },
        }),
    )
    .nonoptional(),
});

const beginOAuthFlow = z.object({
  redirect_uri: z.url({
    // Only accept internal/private/local IP addresses
    hostname:
      /(^localhost$)|(^0\.0\.0\.0$)|(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/i,
  }),
  client_id: z.string(),
  state: z.string().optional(),
});

export const searchParamsSchema = z
  .instanceof(URLSearchParams)
  .transform((sp) => Object.fromEntries(sp.entries()))
  .pipe(z.union([authorizationCode, beginOAuthFlow, completeOAuthFlow]));

export const tokenResultSchema = z
  .object({
    access_token: z.string(),
    token_type: z.string().toLowerCase().pipe(z.literal("bearer")),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
  })
  .transform((obj) => ({
    accessToken: obj.access_token,
    accessTokenExpires: obj.expires_in
      ? addSeconds(Date.now(), obj.expires_in)
      : undefined,
    refreshToken: obj.refresh_token,
  }));
