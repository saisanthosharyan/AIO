import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.demo", override: true });

await mongoose.connect(process.env.MONGODB_URI!);

const db = mongoose.connection.db!;

console.log("\nDatabase:", db.databaseName);

for (const name of await db.listCollections().toArray()) {
  console.log(`${name.name}: ${await db.collection(name.name).countDocuments()} records`);
}

await mongoose.disconnect();
