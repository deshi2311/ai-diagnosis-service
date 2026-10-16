import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/ai-diagnosis";

declare global {
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URI);
  }

  return global._mongoosePromise;
}
