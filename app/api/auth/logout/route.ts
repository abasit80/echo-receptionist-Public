import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session-core";

function clearSession(response: NextResponse) {
  const expired = {
    ...sessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  };
  response.cookies.set(SESSION_COOKIE, "", expired);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function POST(request: Request) {
  const loginUrl = new URL("/login", request.url);
  return clearSession(NextResponse.redirect(loginUrl, { status: 303 }));
}

export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);
  return clearSession(NextResponse.redirect(loginUrl, { status: 303 }));
}
