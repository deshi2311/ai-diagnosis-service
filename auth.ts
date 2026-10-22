import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import authConfig from "@/auth.config";
import mongoClient from "@/lib/mongodb";
import { resolveInitialRole } from "@/lib/admin/roles";
import { trackAnalyticsEvent } from "@/lib/analytics/track";
import { readAnonymousSessionId } from "@/lib/analytics/session";
import type { UserRole } from "@/types/next-auth";

async function loadRole(userId: string, email?: string | null): Promise<UserRole> {
  const users = mongoClient.db().collection("users");
  const _id = new ObjectId(userId);
  const doc = await users.findOne({ _id }, { projection: { role: 1, email: 1 } });
  if (doc?.role === "admin" || doc?.role === "user") {
    return doc.role;
  }
  const role = resolveInitialRole(email ?? (doc?.email as string | undefined));
  await users.updateOne({ _id }, { $set: { role, updatedAt: new Date() } });
  return role;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(mongoClient),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        if (user.id) {
          token.role = await loadRole(user.id, user.email);
        }
      } else if (token.id && !token.role) {
        token.role = await loadRole(String(token.id), token.email as string | undefined);
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image;
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      try {
        const now = new Date();
        const role = resolveInitialRole(user.email);
        await mongoClient
          .db()
          .collection("users")
          .updateOne(
            { _id: new ObjectId(user.id) },
            { $set: { createdAt: now, updatedAt: now, role } },
          );
      } catch (error) {
        console.error("Failed to stamp user timestamps", error);
      }
    },
    async signIn({ user }) {
      try {
        const sid = await readAnonymousSessionId();
        if (!sid || !user.id) return;
        await trackAnalyticsEvent({
          event: "login_completed",
          anonymousSessionId: sid,
          userId: user.id,
          dedupeKey: `login_completed:${sid}:${user.id}`,
          meta: { source: "nextauth_signin" },
        });
      } catch (error) {
        console.error("analytics login_completed failed", error);
      }
    },
  },
});
