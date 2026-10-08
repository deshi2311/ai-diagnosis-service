import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import mongoClient from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type UserDoc = {
  _id: ObjectId;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

async function findUser(userId?: string, email?: string | null) {
  const users = mongoClient.db().collection<UserDoc>("users");

  if (userId && ObjectId.isValid(userId)) {
    const byId = await users.findOne({ _id: new ObjectId(userId) });
    if (byId) return byId;
  }
  if (email) {
    return users.findOne({ email });
  }
  return null;
}

function toProfile(doc: UserDoc | null, fallback: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  return {
    id: doc?._id?.toString() ?? fallback.id,
    name: doc?.name ?? fallback.name ?? "",
    email: doc?.email ?? fallback.email ?? "",
    image: doc?.image ?? fallback.image ?? "",
    createdAt: doc?.createdAt ?? null,
    updatedAt: doc?.updatedAt ?? null,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email && !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doc = await findUser(session.user.id, session.user.email);
    return NextResponse.json(
      toProfile(doc, {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }),
    );
  } catch (error) {
    console.error("GET /api/user/profile", error);
    return NextResponse.json(
      toProfile(null, {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }),
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email && !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 50) {
    return NextResponse.json(
      { error: "名前は1〜50文字で入力してください" },
      { status: 400 },
    );
  }

  try {
    const users = mongoClient.db().collection<UserDoc>("users");
    const now = new Date();
    const filter =
      session.user.id && ObjectId.isValid(session.user.id)
        ? { _id: new ObjectId(session.user.id) }
        : { email: session.user.email ?? "" };

    const result = await users.findOneAndUpdate(
      filter,
      { $set: { name, updatedAt: now } },
      { returnDocument: "after" },
    );

    const doc = result;
    return NextResponse.json(
      toProfile(doc, {
        id: session.user.id,
        name,
        email: session.user.email,
        image: session.user.image,
      }),
    );
  } catch (error) {
    console.error("PUT /api/user/profile", error);
    return NextResponse.json(
      { error: "プロフィールの更新に失敗しました" },
      { status: 500 },
    );
  }
}
