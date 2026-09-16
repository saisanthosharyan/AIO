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

  author?: {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    verified?: boolean;
  } | null;

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
    author:
  post.author &&
  typeof post.author === "object"
    ? {
        id:
          typeof post.author.id === "string"
            ? post.author.id
            : typeof post.author._id === "string"
              ? post.author._id
              : "",
        username:
          typeof post.author.username === "string"
            ? post.author.username
            : "",
        displayName:
          typeof post.author.displayName === "string"
            ? post.author.displayName
            : "",
        avatarUrl:
          typeof post.author.avatarUrl === "string"
            ? post.author.avatarUrl
            : undefined,
        verified:
          typeof post.author.verified === "boolean"
            ? post.author.verified
            : false,
      }
    : null,
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
export async function getPost(
  postId: string,
): Promise<Post> {
  const response =
    await request<{
      success: boolean;
      post: BackendPost;
    }>(
      `/api/posts/${postId}`,
    );

  return normalizePost(response.post);
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
  author?: {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    verified?: boolean;
  } | null;
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

  const authorId =
    typeof comment.author?.id === "string"
      ? comment.author.id
      : typeof comment.author?._id === "string"
        ? comment.author._id
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

    author:
      comment.author &&
      typeof comment.author === "object"
      ? {
          id: authorId,
          username:
            typeof comment.author.username === "string"
              ? comment.author.username
              : "",
          displayName:
            typeof comment.author.displayName === "string"
              ? comment.author.displayName
              : "",
          avatarUrl:
            typeof comment.author.avatarUrl === "string"
              ? comment.author.avatarUrl
              : undefined,
          verified:
            typeof comment.author.verified === "boolean"
              ? comment.author.verified
              : false,
        }
      : null,
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
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  createdAt?: string;
  updatedAt?: string;
  isFollowing?: boolean;
}

interface UserResponse {
  success: boolean;
  message?: string;
  user: UserProfile;
}

interface UsersResponse {
  success: boolean;
  message?: string;
  count: number;
  followers?: UserProfile[];
  following?: UserProfile[];
}

interface FollowResponse {
  success: boolean;
  message?: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await request<UserResponse>("/api/users/me");

  if (!response.success || !response.user) {
    throw new Error(
      response.message || "Failed to fetch current user.",
    );
  }

  return response.user;
}

export async function getUserProfile(
  username: string,
): Promise<UserProfile> {
  const response = await request<UserResponse>(
    `/api/users/${encodeURIComponent(username)}`,
  );

  if (!response.success || !response.user) {
    throw new Error(
      response.message || "Failed to fetch user profile.",
    );
  }

  return response.user;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function updateProfile(
  data: UpdateProfileData,
): Promise<UserProfile> {
  const response = await request<UserResponse>(
    "/api/users/me",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  if (!response.success || !response.user) {
    throw new Error(
      response.message || "Failed to update profile.",
    );
  }

  return response.user;
}

export async function followUser(
  userId: string,
): Promise<FollowResponse> {
  const response = await request<FollowResponse>(
    `/api/users/${encodeURIComponent(userId)}/follow`,
    {
      method: "POST",
    },
  );

  if (!response.success) {
    throw new Error(
      response.message || "Failed to follow user.",
    );
  }

  return response;
}

export async function unfollowUser(
  userId: string,
): Promise<FollowResponse> {
  const response = await request<FollowResponse>(
    `/api/users/${encodeURIComponent(userId)}/follow`,
    {
      method: "DELETE",
    },
  );

  if (!response.success) {
    throw new Error(
      response.message || "Failed to unfollow user.",
    );
  }

  return response;
}

export async function getFollowers(
  userId: string,
): Promise<UserProfile[]> {
  const response = await request<UsersResponse>(
    `/api/users/${encodeURIComponent(userId)}/followers`,
  );

  if (!response.success) {
    throw new Error(
      response.message || "Failed to fetch followers.",
    );
  }

  return response.followers ?? [];
}

export async function getFollowing(
  userId: string,
): Promise<UserProfile[]> {
  const response = await request<UsersResponse>(
    `/api/users/${encodeURIComponent(userId)}/following`,
  );

  if (!response.success) {
    throw new Error(
      response.message || "Failed to fetch following.",
    );
  }

  return response.following ?? [];
}
export interface SearchUsersResponse {
  success: boolean;
  count: number;
  users: UserProfile[];
}

export async function searchUsers(
  query: string,
): Promise<UserProfile[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const response =
    await request<SearchUsersResponse>(
      `/api/users/search?q=${encodeURIComponent(
        trimmedQuery,
      )}`,
    );

  if (!response.success) {
    throw new Error(
      "Failed to search users.",
    );
  }

  return response.users ?? [];
}
export interface SearchPostsResponse {
  success: boolean;
  count: number;
  posts: BackendPost[];
}

export async function searchPosts(
  query: string,
): Promise<Post[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const response =
    await request<SearchPostsResponse>(
      `/api/posts/search?q=${encodeURIComponent(
        trimmedQuery,
      )}`,
    );

  if (!response.success) {
    throw new Error(
      "Failed to search posts.",
    );
  }

  return response.posts.map(
    normalizePost,
  );
}
export type NotificationType =
  | "follow"
  | "like"
  | "comment";

export interface NotificationActor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  actor: NotificationActor | null;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  notifications: NotificationItem[];
}

export interface UnreadNotificationCountResponse {
  success: boolean;
  unreadCount: number;
}

export async function getNotifications(): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const response =
    await request<NotificationsResponse>(
      "/api/notifications",
    );

  if (!response.success) {
    throw new Error(
      "Failed to fetch notifications.",
    );
  }

  return {
    notifications:
      response.notifications ?? [],
    unreadCount:
      response.unreadCount ?? 0,
  };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response =
    await request<UnreadNotificationCountResponse>(
      "/api/notifications/unread-count",
    );

  if (!response.success) {
    throw new Error(
      "Failed to fetch unread notification count.",
    );
  }

  return response.unreadCount ?? 0;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const response =
    await request<{
      success: boolean;
      message?: string;
    }>(
      `/api/notifications/${encodeURIComponent(
        notificationId,
      )}/read`,
      {
        method: "PATCH",
      },
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to mark notification as read.",
    );
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const response =
    await request<{
      success: boolean;
      message?: string;
    }>(
      "/api/notifications/read-all",
      {
        method: "PATCH",
      },
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to mark all notifications as read.",
    );
  }
}