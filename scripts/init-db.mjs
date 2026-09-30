import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(process.cwd(), name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const host = process.env.DB_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? 3306);
const user = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "";
const database = process.env.DB_NAME ?? "echoreceptionist";
const sslFlag = (process.env.DB_SSL ?? "").toLowerCase().trim();
const ssl =
  sslFlag === "true" || sslFlag === "1" || sslFlag === "require"
    ? { rejectUnauthorized: true, minVersion: "TLSv1.2" }
    : undefined;
const schema = path.join(process.cwd(), "sql", "echo-receptionist.sql");

const admin = await mysql.createConnection({
  host,
  port,
  user,
  password,
  ssl,
  multipleStatements: true,
});
try {
  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/exists|access|denied|privilege/i.test(message)) throw error;
  console.warn(`CREATE DATABASE skipped: ${message}`);
}
await admin.query(`USE \`${database}\``);
await admin.query(readFileSync(schema, "utf8"));

const [tables] = await admin.query(
  "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
  [database]
);

console.log(`MySQL ready: ${user}@${host}:${port}/${database} ssl=${Boolean(ssl)}`);
console.log(
  "Tables:",
  Array.isArray(tables) ? tables.map((row) => row.name || row.TABLE_NAME).join(", ") : ""
);
await admin.end();
