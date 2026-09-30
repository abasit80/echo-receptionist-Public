import { NextResponse } from "next/server";
import { registerAccount, signupSchema } from "@/lib/auth/service";
import {
  SESSION_COOKIE,
  safeNextPath,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid signup details." },
      { status: 400 }
    );
  }

  try {
    const user = await registerAccount(parsed.data);
    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    const response = NextResponse.json({
      ok: true,
      next: safeNextPath(body?.next),
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
}
