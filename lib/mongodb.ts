import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/ai-diagnosis";

const client = new MongoClient(uri);

declare global {
  var _mongoClient: MongoClient | undefined;
}

const mongoClient = global._mongoClient ?? client;

if (process.env.NODE_ENV !== "production") {
  global._mongoClient = mongoClient;
}

export default mongoClient;
