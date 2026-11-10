import dotenv from "dotenv";
import mongoose from "mongoose";

import { UserModel } from "../src/models/User.js";
import { PostModel } from "../src/models/Post.js";
import { CommentModel } from "../src/models/Comment.js";
import { LikeModel } from "../src/models/Like.js";
import { BookmarkModel } from "../src/models/Bookmark.js";
import { FollowModel } from "../src/models/Follow.js";
import { SpaceModel } from "../src/models/Space.js";
import { SpaceMemberModel } from "../src/models/SpaceMember.js";
import { NotificationModel } from "../src/models/Notification.js";
import { ConversationModel } from "../src/models/Conversation.js";
import { MessageModel } from "../src/models/Message.js";

dotenv.config({ path: ".env.demo", override: true });

async function seedDemoContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const db = mongoose.connection.db!;

    if (db.databaseName !== "aio_demo") {
      throw new Error("SAFETY ERROR: Database must be aio_demo");
    }

    const users = await UserModel.find({}).lean();

    const expected = [
      "arjun.codes",
      "dev.mehta",
      "maya.design",
      "riya.reads",
      "sai",
      "zoya.creates",
    ];

    const actual = users.map(u => u.username).sort();

    if (
      users.length !== 6 ||
      expected.some((name, i) => actual[i] !== name)
    ) {
      throw new Error("Safety check failed: unexpected demo users");
    }

    for (const collection of await db.listCollections().toArray()) {
      if (collection.name === "users") continue;

      const count = await db.collection(collection.name).countDocuments();

      if (count !== 0) {
        throw new Error(
          `Safety check failed: ${collection.name} contains ${count} records`
        );
      }
    }

    const userMap = new Map(users.map(u => [u.username, u]));

    function user(username: string) {
      const found = userMap.get(username);
      if (!found) throw new Error(`Missing user: ${username}`);
      return found;
    }

    console.log("Safety checks passed. Database:", db.databaseName);

    // 1. Create three spaces.

    const spaceSpecs = [
      {
        slug: "design-circle",
        name: "Design Circle",
        description: "A place for thoughtful design, creative experiments and interface inspiration.",
        creator: "maya.design",
        members: ["maya.design", "sai", "zoya.creates"],
      },
      {
        slug: "developers-hub",
        name: "Developers Hub",
        description: "Share coding projects, development tips and lessons from building software.",
        creator: "arjun.codes",
        members: ["arjun.codes", "sai", "dev.mehta"],
      },
      {
        slug: "readers-corner",
        name: "Readers' Corner",
        description: "Books, ideas, reading lists and conversations worth having.",
        creator: "riya.reads",
        members: ["riya.reads", "sai", "zoya.creates"],
      },
    ];

    const spaces = await SpaceModel.create(
      spaceSpecs.map(s => ({
        name: s.name,
        slug: s.slug,
        description: s.description,
        creatorId: user(s.creator)._id.toString(),
        privacy: "public",
        membersCount: s.members.length,
        postsCount: 0,
      }))
    );

    const spaceMap = new Map(spaces.map(s => [s.slug, s]));

    const memberships = spaceSpecs.flatMap(s =>
      s.members.map((username, index) => ({
        spaceId: spaceMap.get(s.slug)!._id.toString(),
        userId: user(username)._id.toString(),
        role: index === 0 ? "owner" as const : "member" as const,
      }))
    );

    await SpaceMemberModel.create(memberships);

    console.log("Created 3 spaces and their memberships.");

    // 2. Create 18 posts.

    const postSpecs = [
      {
        author: "sai",
        content: "Building something meaningful takes patience. Small improvements every day eventually become something bigger.",
      },
      {
        author: "maya.design",
        content: "Good design is not about adding more elements. It is about making the important things easier to understand.",
      },
      {
        author: "arjun.codes",
        content: "Today's reminder: readable code is a gift to your future self.",
      },
      {
        author: "riya.reads",
        content: "A good book does not just give you information. Sometimes it gives you a completely different perspective.",
      },
      {
        author: "dev.mehta",
        content: "What is one small developer tool that has genuinely improved your workflow?",
      },
      {
        author: "zoya.creates",
        content: "Creativity gets better when you allow yourself to experiment without worrying about perfection.",
      },
      {
        author: "maya.design",
        space: "design-circle",
        content: "Design Circle discussion: What makes a social app feel welcoming instead of overwhelming?",
      },
      {
        author: "sai",
        space: "developers-hub",
        content: "Sharing my latest full-stack experiments. What are you currently building?",
      },
      {
        author: "riya.reads",
        space: "readers-corner",
        content: "This week's reading challenge: discover a book outside your usual genre.",
      },
      {
        author: "arjun.codes",
        content: "Learning a framework is easier when you build something real instead of only watching tutorials.",
      },
      {
        author: "sai",
        content: "If you could master one technical skill this year, what would it be?",
      },
      {
        author: "zoya.creates",
        space: "design-circle",
        content: "A little reminder to save your creative ideas, even the unfinished ones. They may become something special.",
      },
      {
        author: "dev.mehta",
        space: "developers-hub",
        content: "Let's talk about debugging. What is the most useful debugging habit you have developed?",
      },
      {
        author: "maya.design",
        content: "Whitespace is not wasted space. It gives content room to breathe.",
      },
      {
        author: "riya.reads",
        content: "What is a book you wish you could read again for the first time?",
      },
      {
        author: "arjun.codes",
        space: "developers-hub",
        content: "Build in public. Share the mistakes, not just the finished product.",
      },
      {
        author: "zoya.creates",
        content: "Collect moments, ideas and inspiration. Creativity is everywhere when you pay attention.",
      },
      {
        author: "sai",
        content: "A platform becomes interesting when people have something genuine to share. Let's make AIO a place for that.",
      },
    ];

    const posts = await PostModel.create(
      postSpecs.map(p => ({
        authorId: user(p.author)._id.toString(),
        content: p.content,
        type: p.space ? "space" as const : "thought" as const,
        ...(p.space
          ? { spaceId: spaceMap.get(p.space)!._id.toString() }
          : {}),
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
      }))
    );

    console.log(`Created ${posts.length} posts.`);

    // 3. Create unique likes.

    const likeDocs: {
      userId: string;
      postId: mongoose.Types.ObjectId;
    }[] = [];

    const likeCounts = new Map<string, number>();

    for (let i = 0; i < posts.length; i++) {
      let added = 0;

      for (let offset = 1; offset < 6 && added < 3; offset++) {
        const username = expected[(i + offset) % expected.length];

        if (user(username)._id.toString() === posts[i].authorId) {
          continue;
        }

        likeDocs.push({
          userId: user(username)._id.toString(),
          postId: posts[i]._id,
        });

        likeCounts.set(
          posts[i]._id.toString(),
          (likeCounts.get(posts[i]._id.toString()) ?? 0) + 1
        );

        added++;
      }
    }

    await LikeModel.create(likeDocs);

    // 4. Create comments and threaded replies.

    const commentSpecs = [
      [0, "maya.design", "Love this perspective. Consistency really makes a difference."],
      [0, "arjun.codes", "Completely agree. Progress adds up."],
      [1, "sai", "Simplicity is harder than it looks."],
      [1, "zoya.creates", "Especially when designing for different screen sizes!"],
      [2, "dev.mehta", "Readable code saves so much time during maintenance."],
      [2, "sai", "Definitely. Naming things well is underrated."],
      [3, "maya.design", "Books can change the way we approach everyday problems."],
      [4, "arjun.codes", "A good terminal and editor setup make a huge difference."],
      [5, "riya.reads", "Experimentation is where interesting ideas begin."],
      [6, "sai", "Thoughtful layouts and clear navigation are my priorities."],
      [6, "zoya.creates", "And a consistent visual language!"],
      [7, "arjun.codes", "Looking forward to seeing what you build."],
      [7, "dev.mehta", "Testing and deployment are part of the fun too."],
      [8, "sai", "Great idea. Adding this to my reading list."],
      [9, "maya.design", "Learning by building makes concepts stick."],
      [10, "dev.mehta", "I'd choose system design and architecture."],
      [10, "arjun.codes", "TypeScript and backend engineering for me."],
      [11, "maya.design", "Keep creating. Not every idea needs to be perfect."],
      [12, "sai", "Logging and reproducing the issue first always helps."],
      [13, "zoya.creates", "Absolutely. Space can be just as important as content."],
      [14, "sai", "The books that stay with us are special."],
      [15, "dev.mehta", "Sharing failures is how everyone learns faster."],
      [16, "riya.reads", "Inspiration really can come from everyday things."],
      [17, "maya.design", "Looking forward to seeing AIO grow!"],
    ] as const;

    const comments: any[] = [];

    for (let i = 0; i < commentSpecs.length; i++) {
      const [postIndex, author, content] = commentSpecs[i];

      const comment = await CommentModel.create({
        userId: user(author)._id,
        postId: posts[postIndex]._id,
        parentCommentId: null,
        content,
        isDeleted: false,
      });

      comments.push(comment);
    }

    // Add six genuine threaded replies.

    const replySpecs = [
      [0, "sai", "Absolutely. Staying consistent matters."],
      [2, "maya.design", "Clear communication is a design principle too."],
      [4, "sai", "I am working on improving that habit."],
      [9, "maya.design", "Clarity makes a big difference."],
      [15, "arjun.codes", "Exactly. Learning from mistakes is essential."],
      [17, "sai", "Thank you! More improvements are coming."],
    ] as const;

    for (const [parentIndex, author, content] of replySpecs) {
      const parent = comments[parentIndex];

      const reply = await CommentModel.create({
        userId: user(author)._id,
        postId: parent.postId,
        parentCommentId: parent._id,
        content,
        isDeleted: false,
      });

      comments.push(reply);
    }

    const commentCounts = new Map<string, number>();

    for (const comment of comments) {
      const key = comment.postId.toString();
      commentCounts.set(key, (commentCounts.get(key) ?? 0) + 1);
    }

    console.log(`Created ${comments.length} comments and replies.`);

    // 5. Create bookmarks.

    const bookmarkSpecs = [
      [0, "maya.design"],
      [1, "sai"],
      [2, "dev.mehta"],
      [3, "sai"],
      [6, "zoya.creates"],
      [7, "arjun.codes"],
      [10, "riya.reads"],
      [13, "sai"],
      [17, "maya.design"],
    ] as const;

    const bookmarkDocs = bookmarkSpecs.map(([postIndex, username]) => ({
      userId: user(username)._id,
      postId: posts[postIndex]._id,
    }));

    await BookmarkModel.create(bookmarkDocs);

    const bookmarkCounts = new Map<string, number>();

    for (const item of bookmarkDocs) {
      const key = item.postId.toString();
      bookmarkCounts.set(key, (bookmarkCounts.get(key) ?? 0) + 1);
    }

    // 6. Create follow relationships.

    const followSpecs = [
      ["sai", "maya.design"],
      ["sai", "arjun.codes"],
      ["sai", "riya.reads"],
      ["maya.design", "sai"],
      ["maya.design", "zoya.creates"],
      ["arjun.codes", "sai"],
      ["arjun.codes", "dev.mehta"],
      ["riya.reads", "sai"],
      ["dev.mehta", "arjun.codes"],
      ["zoya.creates", "maya.design"],
    ] as const;

    await FollowModel.create(
      followSpecs.map(([follower, following]) => ({
        followerId: user(follower)._id.toString(),
        followingId: user(following)._id.toString(),
      }))
    );

    const followingCounts = new Map<string, number>();
    const followersCounts = new Map<string, number>();

    for (const [follower, following] of followSpecs) {
      const followerId = user(follower)._id.toString();
      const followingId = user(following)._id.toString();

      followingCounts.set(
        followerId,
        (followingCounts.get(followerId) ?? 0) + 1
      );

      followersCounts.set(
        followingId,
        (followersCounts.get(followingId) ?? 0) + 1
      );
    }

    // 7. Synchronize post counters.

    for (const post of posts) {
      const id = post._id.toString();

      await PostModel.updateOne(
        { _id: post._id },
        {
          $set: {
            likesCount: likeCounts.get(id) ?? 0,
            commentsCount: commentCounts.get(id) ?? 0,
            bookmarksCount: bookmarkCounts.get(id) ?? 0,
          },
        }
      );
    }

    // 8. Synchronize user counters.

    for (const username of expected) {
      const id = user(username)._id;

      await UserModel.updateOne(
        { _id: id },
        {
          $set: {
            followersCount: followersCounts.get(id.toString()) ?? 0,
            followingCount: followingCounts.get(id.toString()) ?? 0,
          },
        }
      );
    }

    // 9. Synchronize space post counts.

    for (const spec of spaceSpecs) {
      const space = spaceMap.get(spec.slug)!;

      await SpaceModel.updateOne(
        { _id: space._id },
        {
          $set: {
            postsCount: posts.filter(
              p => p.spaceId === space._id.toString()
            ).length,
          },
        }
      );
    }

    // 10. Create notifications for actual interactions.

    const notificationDocs: {
      recipientId: string;
      actorId: string;
      type: "follow" | "like" | "comment";
      postId?: string;
      commentId?: string;
      read: boolean;
    }[] = [];

    for (const [follower, following] of followSpecs) {
      notificationDocs.push({
        recipientId: user(following)._id.toString(),
        actorId: user(follower)._id.toString(),
        type: "follow",
        read: false,
      });
    }

    for (const like of likeDocs.slice(0, 15)) {
      const post = posts.find(
        p => p._id.toString() === like.postId.toString()
      )!;

      notificationDocs.push({
        recipientId: post.authorId,
        actorId: like.userId,
        type: "like",
        postId: post._id.toString(),
        read: false,
      });
    }

    for (const comment of comments.slice(0, 15)) {
      const post = posts.find(
        p => p._id.toString() === comment.postId.toString()
      )!;

      notificationDocs.push({
        recipientId: post.authorId,
        actorId: comment.userId.toString(),
        type: "comment",
        postId: post._id.toString(),
        commentId: comment._id.toString(),
        read: false,
      });
    }

    await NotificationModel.create(notificationDocs);

    // 11. Create three direct conversations with message histories.

    const conversations = [
      {
        participants: ["sai", "maya.design"],
        messages: [
          ["maya.design", "Hey! I saw your recent post. Great work!"],
          ["sai", "Thank you! I've been working on improving the platform."],
          ["maya.design", "The Design Circle is a nice idea."],
          ["sai", "Glad you like it. More features are coming!"],
        ],
      },
      {
        participants: ["sai", "arjun.codes"],
        messages: [
          ["arjun.codes", "What are you building these days?"],
          ["sai", "Working on AIO, an all-in-one social platform."],
          ["arjun.codes", "Sounds interesting. What stack are you using?"],
          ["sai", "Next.js, Express, TypeScript and MongoDB."],
        ],
      },
      {
        participants: ["sai", "riya.reads"],
        messages: [
          ["riya.reads", "Welcome to Readers' Corner!"],
          ["sai", "Thanks! Looking forward to the discussions."],
          ["riya.reads", "Do you have a favourite genre?"],
          ["sai", "Mostly technology and personal development."],
        ],
      },
    ];

    for (const spec of conversations) {
      const participantIds = spec.participants.map(
        name => user(name)._id.toString()
      );

      const conversation = await ConversationModel.create({
        participantIds,
      });

      const messages = await MessageModel.create(
        spec.messages.map(([sender, content]) => ({
          conversationId: conversation._id.toString(),
          senderId: user(sender)._id.toString(),
          content,
          readBy: [user(sender)._id.toString()],
        }))
      );

      const lastMessage = messages[messages.length - 1];

      conversation.lastMessageId = lastMessage._id.toString();
      conversation.lastMessageText = lastMessage.content;
      conversation.lastMessageSenderId = lastMessage.senderId;
      conversation.lastMessageAt = lastMessage.createdAt;

      await conversation.save();
    }

    console.log("\n================================");
    console.log("DEMO CONTENT CREATED SUCCESSFULLY");
    console.log("================================");
    console.log("Database: aio_demo");
    console.log("Users: 6 (existing accounts preserved)");
    console.log("Posts:", posts.length);
    console.log("Likes:", likeDocs.length);
    console.log("Comments and replies:", comments.length);
    console.log("Bookmarks:", bookmarkDocs.length);
    console.log("Follows:", followSpecs.length);
    console.log("Spaces:", spaces.length);
    console.log("Space memberships:", memberships.length);
    console.log("Notifications:", notificationDocs.length);
    console.log("Conversations:", conversations.length);
    console.log("Messages:", conversations.length * 4);
    console.log("\nOriginal database was not accessed.");

  } catch (error) {
    console.error("\nDEMO SEED FAILED:", error);
    console.error(
      "Do not rerun blindly. Inspect the aio_demo database before retrying."
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoContent();
