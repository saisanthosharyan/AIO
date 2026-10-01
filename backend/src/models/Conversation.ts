import mongoose, {
  Schema,
  type Document,
  type Model,
} from "mongoose";

export interface IConversation extends Document {
  participantIds: string[];
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema =
  new Schema<IConversation>(
    {
      participantIds: {
        type: [String],
        required: true,
        validate: {
          validator: (
            value: string[],
          ) => value.length >= 2,
          message:
            "A conversation requires at least two participants",
        },
      },

      lastMessageId: {
        type: String,
      },

      lastMessageText: {
        type: String,
        maxlength: 500,
      },

      lastMessageSenderId: {
        type: String,
      },

      lastMessageAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

conversationSchema.index({
  participantIds: 1,
});

conversationSchema.index({
  lastMessageAt: -1,
});

export const ConversationModel: Model<IConversation> =
  (mongoose.models
    .Conversation as Model<IConversation>) ||
  mongoose.model<IConversation>(
    "Conversation",
    conversationSchema,
  );
