import { encode } from "@auth/core/jwt";
import { AUTH_SECRET } from "$env/static/private";

/**
 * Auth.js picks its session cookie name from the address the request came in on:
 * "__Secure-authjs.session-token" on https, "authjs.session-token" on plain http (npm run dev).
 * The token's salt must be that same name, so both are decided from the request, never fixed.
 */
export const sessionCookieName = (url: URL) =>
  url.protocol === "https:"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/** Makes the same kind of token Auth.js puts in its cookie, so the app can send it as "Authorization: Bearer". */
export async function issueMobileToken(
  user: { id: string; email: string; name?: string | null },
  url: URL,
) {
  return encode({
    token: {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
    },
    secret: AUTH_SECRET,
    salt: sessionCookieName(url),
    maxAge: THIRTY_DAYS,
  });
}
