import { readFileSync } from "fs";
import path from "path";
import mysql from "mysql2/promise";

const globalStore = globalThis as typeof globalThis & {
  echoMysql?: mysql.Pool;
  echoMysqlReady?: Promise<mysql.Pool>;
};

function sslEnabled() {
  const flag = (process.env.DB_SSL ?? "").toLowerCase().trim();
  return flag === "true" || flag === "1" || flag === "require";
}

function sslOption(): mysql.SslOptions | undefined {
  if (!sslEnabled()) return undefined;
  return { rejectUnauthorized: true, minVersion: "TLSv1.2" };
}

function config() {
  return {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "echoreceptionist",
    ssl: sslOption(),
  };
}

async function createPool() {
  const { host, port, user, password, database, ssl } = config();
  const base = {
    host,
    port,
    user,
    password,
    ssl,
    multipleStatements: true,
  };

  const admin = await mysql.createConnection(base);
  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/exists|access|denied|privilege/i.test(message)) {
      await admin.end();
      throw error;
    }
  }
  await admin.end();

  const pool = mysql.createPool({
    ...base,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    dateStrings: true,
  });

  const schema = readFileSync(path.join(process.cwd(), "sql", "echo-receptionist.sql"), "utf8");
  await pool.query(schema);
  return pool;
}

export async function getPool() {
  if (globalStore.echoMysql) return globalStore.echoMysql;
  if (!globalStore.echoMysqlReady) {
    globalStore.echoMysqlReady = createPool().then((pool) => {
      globalStore.echoMysql = pool;
      return pool;
    });
  }
  return globalStore.echoMysqlReady;
}

type QueryParams = Array<string | number | boolean | null | Date | Buffer>;

export async function queryAll<T>(sql: string, params: QueryParams = []) {
  const [rows] = await getPool().then((pool) => pool.execute(sql, params));
  return rows as T[];
}

export async function queryOne<T>(sql: string, params: QueryParams = []) {
  const rows = await queryAll<T>(sql, params);
  return rows[0];
}

export async function exec(sql: string, params: QueryParams = []) {
  await getPool().then((pool) => pool.execute(sql, params));
}

export async function countRows(table: string) {
  const allowed = new Set([
    "organizations",
    "users",
    "calls",
    "leads",
    "integrations",
    "vapi_configurations",
    "appointments",
  ]);
  if (!allowed.has(table)) throw new Error("Unknown table");
  const row = await queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return Number(row?.n ?? 0);
}
