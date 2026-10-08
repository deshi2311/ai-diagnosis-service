import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import authConfig from "@/auth.config";
import mongoClient from "@/lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(mongoClient),
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      try {
        const now = new Date();
        await mongoClient
          .db()
          .collection("users")
          .updateOne(
            { _id: new ObjectId(user.id) },
            { $set: { createdAt: now, updatedAt: now } },
          );
      } catch (error) {
        console.error("Failed to stamp user timestamps", error);
      }
    },
  },
});
