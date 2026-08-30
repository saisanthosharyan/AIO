export type PostType =
  | "thought"
  | "image"
  | "space";

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  type: PostType;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}