export type PostType =
  | "thought"
  | "image"
  | "space";

export interface Post {
  _id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  type: PostType;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}