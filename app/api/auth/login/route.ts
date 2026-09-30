import { NextResponse } from "next/server";
import { loginAccount, loginSchema } from "@/lib/auth/service";
import {
  SESSION_COOKIE,
  safeNextPath,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid login details." },
      { status: 400 }
    );
  }

  try {
    const user = await loginAccount(parsed.data);
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
      { error: error instanceof Error ? error.message : "Unable to sign in." },
      { status: 401 }
    );
  }
}
