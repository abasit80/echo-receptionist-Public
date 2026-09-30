const base = process.env.SMOKE_BASE ?? "http://localhost:3000";
const email = `calls${Date.now()}@echo.test`;

const signup = await fetch(`${base}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Call Tester",
    email,
    password: "securepass",
    confirmPassword: "securepass",
  }),
});
const cookie = signup.headers.get("set-cookie")?.split(";")[0] ?? "";
const headers = { cookie, "Content-Type": "application/json" };

const list = await fetch(`${base}/api/calls`, { headers });
const before = await list.json();
const sim = await fetch(`${base}/api/calls/simulate`, { method: "POST", headers });
const after = await fetch(`${base}/api/calls`, { headers });
const rows = await after.json();

console.log("signup", signup.status);
console.log("list", list.status, Array.isArray(before) ? before.length : before);
console.log("simulate", sim.status, (await sim.json()).call?.caller_name);
console.log("after", rows[0]?.status, rows[0]?.caller_name);
