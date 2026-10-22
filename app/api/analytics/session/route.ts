import { NextResponse } from "next/server";
import {
  ensureAnonymousSessionId,
  rotateAnonymousSessionId,
} from "@/lib/analytics/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let rotate = false;
  try {
    const body = await request.json();
    rotate = body?.rotate === true;
  } catch {
    rotate = false;
  }
  const id = rotate
    ? await rotateAnonymousSessionId()
    : await ensureAnonymousSessionId();
  return NextResponse.json({ ok: true, anonymousSessionId: id });
}
