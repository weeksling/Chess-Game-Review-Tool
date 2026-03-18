import { NextResponse } from "next/server";
import { ensureTable } from "@/lib/storage";

export async function POST() {
  try {
    await ensureTable();
    return NextResponse.json({ success: true, message: "Table created" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
