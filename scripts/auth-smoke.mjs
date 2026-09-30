const base = process.env.SMOKE_BASE ?? "http://localhost:3003";

const dash = await fetch(`${base}/dashboard`, { redirect: "manual" });
console.log("unauth dashboard", dash.status, dash.headers.get("location"));

const home = await fetch(`${base}/`);
const html = await home.text();
console.log("cta signup", html.includes('href="/signup"'));
console.log("cta login", html.includes('href="/login"'));
console.log("no direct dash cta", !html.includes('href="/dashboard"'));

const signupPage = await fetch(`${base}/signup`);
const signupHtml = await signupPage.text();
console.log("signup page", signupPage.status, signupHtml.includes("Create your account"));

const email = `owner${Date.now()}@echo.test`;
const created = await fetch(`${base}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jordan Lee",
    email,
    password: "securepass",
    confirmPassword: "securepass",
    next: "/dashboard",
  }),
});
const createdBody = await created.json();
const cookie = created.headers.get("set-cookie");
console.log(
  "signup",
  created.status,
  createdBody,
  Boolean(cookie && cookie.includes("echo_session"))
);

const sessionCookie = cookie?.split(";")[0] ?? "";
const authed = await fetch(`${base}/dashboard`, {
  headers: { cookie: sessionCookie },
  redirect: "manual",
});
console.log("authed dashboard", authed.status, authed.headers.get("location"), sessionCookie.slice(0, 40));

const loginGate = await fetch(`${base}/login`, {
  headers: { cookie: sessionCookie },
  redirect: "manual",
});
console.log("logged-in login page", loginGate.status, loginGate.headers.get("location"));

const bad = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: "wrongpass" }),
});
console.log("bad login", bad.status, await bad.json());
