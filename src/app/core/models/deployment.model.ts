export type DeploymentStatus = 'SUCCESS' | 'FAILURE';

export interface DeploymentResponse {
  id: number;
  status: DeploymentStatus;
  commitHash: string;
  commitMessage: string;
  triggeredBy: string;
  startedAt: string;
  finishedAt: string | null;
}
