import type { UserRole } from "@/types/next-auth";

export function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveInitialRole(email?: string | null): UserRole {
  if (!email) return "user";
  return parseAdminEmails().has(email.toLowerCase()) ? "admin" : "user";
}
