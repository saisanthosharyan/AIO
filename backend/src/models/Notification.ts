import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export type NotificationType =
  | "follow"
  | "like"
  | "comment";

export interface INotification
  extends Document {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema =
  new Schema<INotification>(
    {
      recipientId: {
        type: String,
        required: true,
        index: true,
      },

      actorId: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        enum: [
          "follow",
          "like",
          "comment",
        ],
        required: true,
      },

      postId: {
        type: String,
      },

      commentId: {
        type: String,
      },

      read: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    },
  );

notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipientId: 1,
  read: 1,
});

export const NotificationModel =
  (mongoose.models
    .Notification as Model<INotification>) ||
  mongoose.model<INotification>(
    "Notification",
    notificationSchema,
  );