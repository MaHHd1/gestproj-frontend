export interface ActivityLogResponse {
  id: number;
  projectId: number;
  userId: number;
  username: string;
  action: string;
  createdAt: string;
}
