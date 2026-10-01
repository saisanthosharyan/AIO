import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema =
  new Schema<IMessage>(
    {
      conversationId: {
        type: String,
        required: true,
        index: true,
      },

      senderId: {
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

      readBy: {
        type: [String],
        default: [],
      },
    },
    {
      timestamps: true,
    },
  );

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

export const MessageModel: Model<IMessage> =
  (mongoose.models
    .Message as Model<IMessage>) ||
  mongoose.model<IMessage>(
    "Message",
    messageSchema,
  );
