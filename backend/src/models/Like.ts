import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export interface LikeDocument extends Document {
  userId: string;
  postId: mongoose.Types.ObjectId;
}

const likeSchema = new Schema<LikeDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index(
  { userId: 1, postId: 1 },
  { unique: true },
);

export const LikeModel: Model<LikeDocument> =
  (mongoose.models.Like as Model<LikeDocument>) ||
  mongoose.model<LikeDocument>(
    "Like",
    likeSchema,
  );