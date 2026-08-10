export interface Space {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  avatarUrl?: string;
  membersCount: number;
  isPublic: boolean;
  createdAt: string;
}