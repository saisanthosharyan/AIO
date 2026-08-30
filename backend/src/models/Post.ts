import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export interface IPost extends Document {
  authorId: string;
  content: string;
  imageUrl?: string;
  type: "thought" | "image" | "space";
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: String,
      required: true,
      index: true,
    },

    content: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    imageUrl: {
      type: String,
    },

    type: {
      type: String,
      enum: ["thought", "image", "space"],
      default: "thought",
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    bookmarksCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const PostModel: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) ||
  mongoose.model<IPost>("Post", postSchema);