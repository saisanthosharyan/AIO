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
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: CommentAuthor | null;
}