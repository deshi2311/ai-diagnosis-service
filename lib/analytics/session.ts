import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { ANALYTICS_COOKIE } from "@/lib/analytics/constants";

const SID_RE = /^[a-f0-9]{32}$/;

export function createAnonymousSessionId() {
  return randomBytes(16).toString("hex");
}

export function isValidAnonymousSessionId(value: unknown): value is string {
  return typeof value === "string" && SID_RE.test(value);
}

export async function readAnonymousSessionId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(ANALYTICS_COOKIE)?.value;
  return isValidAnonymousSessionId(value) ? value : null;
}

export async function ensureAnonymousSessionId(): Promise<string> {
  const existing = await readAnonymousSessionId();
  if (existing) return existing;
  const id = createAnonymousSessionId();
  const jar = await cookies();
  jar.set(ANALYTICS_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

export async function rotateAnonymousSessionId(): Promise<string> {
  const id = createAnonymousSessionId();
  const jar = await cookies();
  jar.set(ANALYTICS_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}
