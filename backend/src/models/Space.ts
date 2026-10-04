import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export type SpacePrivacy =
  | "public"
  | "private";

export interface ISpace extends Document {
  creatorId: string;
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;
  coverUrl?: string;
  privacy: SpacePrivacy;
  membersCount: number;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const spaceSchema = new Schema<ISpace>(
  {
    creatorId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    avatarUrl: {
      type: String,
    },

    coverUrl: {
      type: String,
    },

    privacy: {
      type: String,
      enum: [
        "public",
        "private",
      ],
      default: "public",
    },

    membersCount: {
      type: Number,
      default: 1,
      min: 0,
    },

    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

spaceSchema.index({
  creatorId: 1,
  createdAt: -1,
});

spaceSchema.index({
  membersCount: -1,
  createdAt: -1,
});

export const SpaceModel: Model<ISpace> =
  (mongoose.models.Space as Model<ISpace>) ||
  mongoose.model<ISpace>(
    "Space",
    spaceSchema,
  );