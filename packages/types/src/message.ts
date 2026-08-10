export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "poll"
  | "system";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  editedAt?: string;
}