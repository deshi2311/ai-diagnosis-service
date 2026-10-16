import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongoose";

export async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  await connectMongo();
  return { userId };
}
