export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}