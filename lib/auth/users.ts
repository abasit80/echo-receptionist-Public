import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { exec, queryAll, queryOne } from "@/lib/db/mysql";
import { DEMO_ORG_ID } from "@/lib/data/demo";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

function mapUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function migrateJsonUsers() {
  const file = path.join(process.cwd(), ".data", "users.json");
  if (!existsSync(file)) return;
  const count = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM users");
  if (Number(count?.n ?? 0) > 0) return;

  try {
    const users = JSON.parse(readFileSync(file, "utf8")) as StoredUser[];
    for (const user of users) {
      await exec(
        "INSERT IGNORE INTO users (id, org_id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [user.id, DEMO_ORG_ID, user.email, user.name, user.passwordHash, user.createdAt]
      );
    }
  } catch {
    // Ignore corrupt JSON.
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const current = Buffer.from(hash, "hex");
  return current.length === next.length && timingSafeEqual(current, next);
}

export async function findUserByEmail(email: string) {
  await migrateJsonUsers();
  const row = await queryOne<UserRow>(
    "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?",
    [email.toLowerCase()]
  );
  return row ? mapUser(row) : null;
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const email = input.email.toLowerCase().trim();
  if (await findUserByEmail(email)) {
    throw new Error("An account with this email already exists.");
  }

  const user: StoredUser = {
    id: createHash("sha256").update(`${email}:${Date.now()}`).digest("hex").slice(0, 16),
    email,
    name: input.name.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  await exec(
    "INSERT INTO users (id, org_id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [user.id, DEMO_ORG_ID, user.email, user.name, user.passwordHash, user.createdAt]
  );

  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return user;
}

export async function listUsers() {
  await migrateJsonUsers();
  const rows = await queryAll<UserRow>(
    "SELECT id, email, name, password_hash, created_at FROM users"
  );
  return rows.map(mapUser);
}
