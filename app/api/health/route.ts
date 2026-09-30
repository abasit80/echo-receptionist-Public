import { NextResponse } from "next/server";
import { countRows } from "@/lib/db/mysql";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      engine: "mysql",
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME ?? "echoreceptionist",
      ssl: ["true", "1", "require"].includes((process.env.DB_SSL ?? "").toLowerCase()),
      counts: {
        organizations: await countRows("organizations"),
        users: await countRows("users"),
        calls: await countRows("calls"),
        leads: await countRows("leads"),
        integrations: await countRows("integrations"),
        vapi_configurations: await countRows("vapi_configurations"),
        appointments: await countRows("appointments"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        engine: "mysql",
        error: error instanceof Error ? error.message : "MySQL connection failed",
      },
      { status: 500 }
    );
  }
}
