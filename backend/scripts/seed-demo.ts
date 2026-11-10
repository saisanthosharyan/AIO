import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { UserModel } from "../src/models/User.js";

dotenv.config({ path: ".env.demo", override: true });

async function seedDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const db = mongoose.connection.db;

    if (!db || db.databaseName !== "aio_demo") {
      throw new Error("Safety check failed: database must be aio_demo");
    }

    const mainUser = await UserModel.findOne({ username: "sai" });

    if (!mainUser || await UserModel.countDocuments() !== 1) {
      throw new Error("Expected exactly one existing main account: @sai");
    }

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      if (collection.name !== "users") {
        const count = await db.collection(collection.name).countDocuments();

        if (count > 0) {
          throw new Error(
            `Safety check failed: ${collection.name} is not empty`
          );
        }
      }
    }

    const profiles = [
      {
        username: "maya.design",
        email: "maya.design@example.com",
        displayName: "Maya Sharma",
        bio: "Product designer exploring thoughtful interfaces, creativity and everyday inspiration.",
      },
      {
        username: "arjun.codes",
        email: "arjun.codes@example.com",
        displayName: "Arjun Rao",
        bio: "Developer building useful things with code. Sharing experiments and lessons along the way.",
      },
      {
        username: "riya.reads",
        email: "riya.reads@example.com",
        displayName: "Riya Kapoor",
        bio: "Books, ideas, storytelling and conversations that make you think.",
      },
      {
        username: "dev.mehta",
        email: "dev.mehta@example.com",
        displayName: "Dev Mehta",
        bio: "Technology enthusiast interested in startups, open source and building in public.",
      },
      {
        username: "zoya.creates",
        email: "zoya.creates@example.com",
        displayName: "Zoya Khan",
        bio: "Digital creator sharing design inspiration, photography and creative projects.",
      },
    ];

    for (const profile of profiles) {
      const password = randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(password, 10);

      await UserModel.create({
        ...profile,
        password: passwordHash,
        verified: false,
        followersCount: 0,
        followingCount: 0,
      });

      console.log(`Created profile: @${profile.username}`);
    }

    console.log("\nDemo profiles created successfully.");
    console.log("Main account @sai was not modified.");
    console.log("Database:", db.databaseName);
  } catch (error) {
    console.error("Demo user seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoUsers();
