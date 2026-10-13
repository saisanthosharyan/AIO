
import mongoose, {
  type Document,
  type Model,
} from "mongoose";

export interface CommentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  parentCommentId: mongoose.Types.ObjectId | null;
  content: string;
  isDeleted: boolean;
  deletedAt: Date | null;
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

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
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

commentSchema.index({
  parentCommentId: 1,
  createdAt: 1,
});

export const CommentModel: Model<CommentDocument> =
  mongoose.model<CommentDocument>(
    "Comment",
    commentSchema,
  );
