import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  verifySessionToken,
  type AuthSession,
} from "@/lib/auth/session-core";

export * from "@/lib/auth/session-core";

export async function getSession(): Promise<AuthSession | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
