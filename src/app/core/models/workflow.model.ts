export interface WorkflowRunResponse {
  id: number;
  name: string | null;
  status: string | null;
  conclusion: string | null;
  commitHash: string | null;
  commitMessage: string | null;
  author: string | null;
  branch: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  htmlUrl: string | null;
}

export interface WorkflowJobResponse {
  id: number;
  name: string | null;
  status: string | null;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  htmlUrl: string | null;
}
