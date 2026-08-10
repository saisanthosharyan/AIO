export type PostVisibility =
  | "private"
  | "friends"
  | "followers"
  | "space"
  | "public";

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  visibility: PostVisibility;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
}