import type { Post } from "../../../packages/types/src/post";
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

  const headers = new Headers(
    options.headers,
  );

  headers.set("Content-Type", "application/json");

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "API request failed",
    );
  }

  return data;
}

export interface PostsResponse {
  success: boolean;
  count: number;
  posts: Post[];
}

export async function getPosts(): Promise<Post[]> {
  const response =
    await request<PostsResponse>(
      "/api/posts",
    );

  return response.posts;
}

export async function likePost(
  postId: string,
) {
  return request<{
    success: boolean;
    message: string;
    likesCount: number;
  }>(`/api/posts/${postId}/like`, {
    method: "POST",
  });
}

export async function unlikePost(
  postId: string,
) {
  return request<{
    success: boolean;
    message: string;
    likesCount: number;
  }>(`/api/posts/${postId}/like`, {
    method: "DELETE",
  });
}

export async function bookmarkPost(
  postId: string,
) {
  return request<{
    success: boolean;
    message: string;
    bookmarksCount: number;
  }>(`/api/bookmarks/${postId}`, {
    method: "POST",
  });
}

export async function unbookmarkPost(
  postId: string,
) {
  return request<{
    success: boolean;
    message: string;
    bookmarksCount: number;
  }>(`/api/bookmarks/${postId}`, {
    method: "DELETE",
  });
}

export async function getComments(
  postId: string,
) {
  return request<{
    success: boolean;
    count: number;
    comments: Post["comments"];
  }>(`/api/posts/${postId}/comments`);
}