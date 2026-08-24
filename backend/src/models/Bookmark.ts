import mongoose from "mongoose";

export interface BookmarkDocument
  extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new mongoose.Schema<BookmarkDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

bookmarkSchema.index(
  { userId: 1, postId: 1 },
  { unique: true },
);

export const BookmarkModel =
  mongoose.model<BookmarkDocument>(
    "Bookmark",
    bookmarkSchema,
  );