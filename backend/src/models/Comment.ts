import mongoose, {
  type Document,
  type Model,
} from "mongoose";

export interface CommentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<CommentDocument>(
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

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({
  postId: 1,
  createdAt: -1,
});

export const CommentModel: Model<CommentDocument> =
  mongoose.model<CommentDocument>(
    "Comment",
    commentSchema,
  );