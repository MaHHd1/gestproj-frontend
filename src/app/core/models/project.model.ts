export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerUsername: string;
  repoOwner?: string | null;
  repoName?: string | null;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
  repoOwner?: string | null;
  repoName?: string | null;
}

export interface ProjectUpdateRequest {
  name: string;
  description: string;
  repoOwner?: string | null;
  repoName?: string | null;
}

export interface ProjectStatisticsResponse {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  lateTasks: number;
  completionPercentage: number;
}
