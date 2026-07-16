export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerUsername: string;
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
}

export interface ProjectUpdateRequest {
  name: string;
  description: string;
}

export interface ProjectStatisticsResponse {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  lateTasks: number;
  completionPercentage: number;
}
