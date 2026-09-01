import type {
  Comment,
  Post,
  PostType,
} from "../../../packages/types/src/post";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("aio_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  const contentType =
    response.headers.get("content-type") ?? "";

  let data: unknown = null;

  if (
    contentType.includes("application/json")
  ) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = text
      ? { message: text }
      : null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "API request failed";

    throw new Error(message);
  }

  return data as T;
}

/* -------------------------------------------------------------------------- */
/* Backend → Frontend normalization                                           */
/* -------------------------------------------------------------------------- */

interface BackendPost {
  _id?: string;
  id?: string;
  authorId?: string;
  content?: string;
  imageUrl?: string;
  type?: PostType;

  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;

  isLiked?: boolean;
  isBookmarked?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

function normalizeImageUrl(
  imageUrl?: string,
): string | undefined {
  if (typeof imageUrl !== "string") {
    return undefined;
  }

  const trimmedUrl = imageUrl.trim();

  if (!trimmedUrl) {
    return undefined;
  }

  if (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("data:") ||
    trimmedUrl.startsWith("blob:")
  ) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith("/")) {
    return `${API_URL}${trimmedUrl}`;
  }

  return `${API_URL}/${trimmedUrl}`;
}

function normalizePost(
  post: BackendPost,
): Post {
  const id =
    typeof post.id === "string" &&
    post.id.length > 0
      ? post.id
      : typeof post._id === "string"
        ? post._id
        : "";

  return {
    id,

    authorId:
      typeof post.authorId === "string"
        ? post.authorId
        : "",

    content:
      typeof post.content === "string"
        ? post.content
        : "",

    imageUrl: normalizeImageUrl(
      post.imageUrl,
    ),

    type:
      post.type === "image" ||
      post.type === "space" ||
      post.type === "thought"
        ? post.type
        : "thought",

    likesCount:
      typeof post.likesCount === "number"
        ? post.likesCount
        : 0,

    commentsCount:
      typeof post.commentsCount === "number"
        ? post.commentsCount
        : 0,

    bookmarksCount:
      typeof post.bookmarksCount === "number"
        ? post.bookmarksCount
        : 0,

    isLiked:
      typeof post.isLiked === "boolean"
        ? post.isLiked
        : false,

    isBookmarked:
      typeof post.isBookmarked === "boolean"
        ? post.isBookmarked
        : false,

    createdAt:
      typeof post.createdAt === "string"
        ? post.createdAt
        : new Date().toISOString(),

    updatedAt:
      typeof post.updatedAt === "string"
        ? post.updatedAt
        : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Posts                                                                      */
/* -------------------------------------------------------------------------- */

export interface PostsResponse {
  success: boolean;
  count: number;
  posts: BackendPost[];
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  post: Post;
}

export interface UpdatePostResponse {
  success: boolean;
  message: string;
  post: Post;
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
  post: Post;
}

export async function getPosts(): Promise<Post[]> {
  const response =
    await request<PostsResponse>(
      "/api/posts",
    );

  return response.posts.map(
    normalizePost,
  );
}

export async function createPost(
  content: string,
  imageUrl?: string,
  type:
    | "thought"
    | "image"
    | "space" = "thought",
): Promise<CreatePostResponse> {
  const response =
    await request<{
      success: boolean;
      message: string;
      post: BackendPost;
    }>("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        content,
        ...(imageUrl
          ? { imageUrl }
          : {}),
        type,
      }),
    });

  return {
    success: response.success,
    message: response.message,
    post: normalizePost(
      response.post,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Image Uploads                                                              */
/* -------------------------------------------------------------------------- */

export interface UploadImageResponse {
  success: boolean;
  message: string;
  imageUrl: string;
}

export async function uploadImage(
  image: string,
): Promise<UploadImageResponse> {
  const response =
    await request<UploadImageResponse>(
      "/api/uploads",
      {
        method: "POST",
        body: JSON.stringify({
          image,
        }),
      },
    );

  return {
    success: response.success,
    message: response.message,
    imageUrl:
      normalizeImageUrl(
        response.imageUrl,
      ) ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/* Update / Delete Posts                                                      */
/* -------------------------------------------------------------------------- */

export async function updatePost(
  postId: string,
  data: {
    content?: string;
    imageUrl?: string;
    type?:
      | "thought"
      | "image"
      | "space";
  },
): Promise<UpdatePostResponse> {
  const response =
    await request<{
      success: boolean;
      message: string;
      post: BackendPost;
    }>(
      `/api/posts/${postId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );

  return {
    success: response.success,
    message: response.message,
    post: normalizePost(
      response.post,
    ),
  };
}

export async function deletePost(
  postId: string,
): Promise<DeletePostResponse> {
  const response =
    await request<{
      success: boolean;
      message: string;
      post: BackendPost;
    }>(
      `/api/posts/${postId}`,
      {
        method: "DELETE",
      },
    );

  return {
    success: response.success,
    message: response.message,
    post: normalizePost(
      response.post,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Likes                                                                      */
/* -------------------------------------------------------------------------- */

export interface LikeResponse {
  success: boolean;
  message: string;
  likesCount: number;
}

export async function likePost(
  postId: string,
): Promise<LikeResponse> {
  return request<LikeResponse>(
    `/api/posts/${postId}/like`,
    {
      method: "POST",
    },
  );
}

export async function unlikePost(
  postId: string,
): Promise<LikeResponse> {
  return request<LikeResponse>(
    `/api/posts/${postId}/like`,
    {
      method: "DELETE",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Bookmarks                                                                  */
/* -------------------------------------------------------------------------- */

export interface BookmarkResponse {
  success: boolean;
  message: string;
  bookmarksCount: number;
}

export async function bookmarkPost(
  postId: string,
): Promise<BookmarkResponse> {
  return request<BookmarkResponse>(
    `/api/bookmarks/${postId}`,
    {
      method: "POST",
    },
  );
}

export async function unbookmarkPost(
  postId: string,
): Promise<BookmarkResponse> {
  return request<BookmarkResponse>(
    `/api/bookmarks/${postId}`,
    {
      method: "DELETE",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Comments                                                                   */
/* -------------------------------------------------------------------------- */

interface BackendComment {
  _id?: string;
  id?: string;
  userId?: string;
  postId?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeComment(
  comment: BackendComment,
): Comment {
  const id =
    typeof comment.id === "string" &&
    comment.id.length > 0
      ? comment.id
      : typeof comment._id === "string"
        ? comment._id
        : "";

  return {
    id,

    userId:
      typeof comment.userId === "string"
        ? comment.userId
        : "",

    postId:
      typeof comment.postId === "string"
        ? comment.postId
        : "",

    content:
      typeof comment.content === "string"
        ? comment.content
        : "",

    createdAt:
      typeof comment.createdAt === "string"
        ? comment.createdAt
        : new Date().toISOString(),

    updatedAt:
      typeof comment.updatedAt === "string"
        ? comment.updatedAt
        : undefined,
  };
}

export interface CommentsResponse {
  success: boolean;
  count: number;
  comments: BackendComment[];
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
  commentsCount: number;
}

export interface DeleteCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
  commentsCount: number;
}

export async function getComments(
  postId: string,
): Promise<Comment[]> {
  const response =
    await request<CommentsResponse>(
      `/api/posts/${postId}/comments`,
    );

  return response.comments.map(
    normalizeComment,
  );
}

export async function createComment(
  postId: string,
  content: string,
): Promise<CreateCommentResponse> {
  const response =
    await request<{
      success: boolean;
      message: string;
      comment: BackendComment;
      commentsCount: number;
    }>(
      `/api/posts/${postId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({
          content,
        }),
      },
    );

  return {
    success: response.success,
    message: response.message,
    comment: normalizeComment(
      response.comment,
    ),
    commentsCount:
      response.commentsCount,
  };
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<DeleteCommentResponse> {
  const response =
    await request<{
      success: boolean;
      message: string;
      comment: BackendComment;
      commentsCount: number;
    }>(
      `/api/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
      },
    );

  return {
    success: response.success,
    message: response.message,
    comment: normalizeComment(
      response.comment,
    ),
    commentsCount:
      response.commentsCount,
  };
}