import dotenv from "dotenv";
import mongoose from "mongoose";
import { UserModel } from "../src/models/User.js";

dotenv.config({ path: ".env.demo", override: true });

await mongoose.connect(process.env.MONGODB_URI!);

try {
  const db = mongoose.connection.db!;

  if (db.databaseName !== "aio_demo") {
    throw new Error("Wrong database!");
  }

  const users = await UserModel.find({})
    .select("_id username displayName")
    .sort({ username: 1 })
    .lean();

  console.table(users.map(user => ({
    username: user.username,
    displayName: user.displayName,
    id: user._id.toString(),
  })));
} finally {
  await mongoose.disconnect();
}
