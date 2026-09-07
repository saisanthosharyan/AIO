import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export interface IFollow extends Document {
  followerId: string;
  followingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: {
      type: String,
      required: true,
      index: true,
    },

    followingId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// A user can follow another user only once.
followSchema.index(
  {
    followerId: 1,
    followingId: 1,
  },
  {
    unique: true,
  },
);

// Prevent following yourself.
followSchema.index({
  followingId: 1,
  createdAt: -1,
});

export const FollowModel: Model<IFollow> =
  (mongoose.models.Follow as Model<IFollow>) ||
  mongoose.model<IFollow>("Follow", followSchema);