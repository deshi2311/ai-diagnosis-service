import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import mongoClient from "@/lib/mongodb";
import { connectMongo } from "@/lib/mongoose";
import type { UserRole } from "@/types/next-auth";

export type AdminUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
};

export async function getUserRoleFromDb(userId: string): Promise<UserRole> {
  const doc = await mongoClient
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(userId) }, { projection: { role: 1 } });
  return doc?.role === "admin" ? "admin" : "user";
}

/** 管理API/ページ用。JWTのroleは信用せずDBを見る */
export async function requireAdmin(): Promise<
  { ok: true; user: AdminUser } | { ok: false; response: Response }
> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        ok: false,
        response: Response.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }
    await connectMongo();
    const role = await getUserRoleFromDb(userId);
    if (role !== "admin") {
      return {
        ok: false,
        response: Response.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
    return {
      ok: true,
      user: {
        id: userId,
        email: session.user?.email,
        name: session.user?.name,
        role,
      },
    };
  } catch (error) {
    console.error("requireAdmin failed", error);
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

export async function requireAdminPage(): Promise<AdminUser | null> {
  const gate = await requireAdmin();
  if (!gate.ok) return null;
  return gate.user;
}
