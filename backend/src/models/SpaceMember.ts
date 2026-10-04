import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export type SpaceMemberRole =
  | "owner"
  | "admin"
  | "member";

export interface ISpaceMember
  extends Document {
  spaceId: string;
  userId: string;
  role: SpaceMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

const spaceMemberSchema =
  new Schema<ISpaceMember>(
    {
      spaceId: {
        type: String,
        required: true,
        index: true,
      },

      userId: {
        type: String,
        required: true,
        index: true,
      },

      role: {
        type: String,
        enum: [
          "owner",
          "admin",
          "member",
        ],
        default: "member",
      },
    },
    {
      timestamps: true,
    },
  );

/*
 * A user can belong to the same
 * Space only once.
 */
spaceMemberSchema.index(
  {
    spaceId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

/*
 * Useful when loading all Spaces
 * joined by a particular user.
 */
spaceMemberSchema.index({
  userId: 1,
  createdAt: -1,
});

/*
 * Useful when loading the members
 * of a Space.
 */
spaceMemberSchema.index({
  spaceId: 1,
  role: 1,
  createdAt: -1,
});

export const SpaceMemberModel:
  Model<ISpaceMember> =
    (mongoose.models
      .SpaceMember as Model<ISpaceMember>) ||
    mongoose.model<ISpaceMember>(
      "SpaceMember",
      spaceMemberSchema,
    );