import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Reached only with a valid session cookie — middleware.ts gates every path
// except /login, /api/login and /api/sync.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  const status = body?.status;

  if (typeof id !== "string" || !["new", "saved", "applied"].includes(status)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db.from("jobs").update({ status }).eq("id", id);
  if (error) {
    console.error("[status] update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
