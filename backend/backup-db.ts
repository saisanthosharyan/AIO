import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";

import { UserModel } from "./src/models/User.js";
import { PostModel } from "./src/models/Post.js";
import { CommentModel } from "./src/models/Comment.js";
import { LikeModel } from "./src/models/Like.js";
import { BookmarkModel } from "./src/models/Bookmark.js";
import { FollowModel } from "./src/models/Follow.js";
import { SpaceModel } from "./src/models/Space.js";
import { SpaceMemberModel } from "./src/models/SpaceMember.js";
import { NotificationModel } from "./src/models/Notification.js";
import { ConversationModel } from "./src/models/Conversation.js";
import { MessageModel } from "./src/models/Message.js";

async function backup() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing.");
    }

    const backupDir = path.resolve("../database-backups");
    await fs.mkdir(backupDir, { recursive: true });

    await mongoose.connect(mongoUri);

    const collections = {
      users: UserModel,
      posts: PostModel,
      comments: CommentModel,
      likes: LikeModel,
      bookmarks: BookmarkModel,
      follows: FollowModel,
      spaces: SpaceModel,
      spaceMembers: SpaceMemberModel,
      notifications: NotificationModel,
      conversations: ConversationModel,
      messages: MessageModel,
    };

    console.log("\n========== AIO BACKUP ==========");

    for (const [name, model] of Object.entries(collections)) {
      const records = await model.find({}).lean();
      const filePath = path.join(backupDir, `${name}.json`);

      await fs.writeFile(
        filePath,
        JSON.stringify(records, null, 2),
        "utf8"
      );

      console.log(`${name}: ${records.length} records exported`);
    }

    console.log("\nBackup export completed.");
    console.log("Location:", backupDir);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

backup();
