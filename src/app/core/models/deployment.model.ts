export type DeploymentStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING' | 'PENDING';

export interface DeploymentResponse {
  id: number;
  status: DeploymentStatus;
  commitHash: string;
  commitMessage: string;
  triggeredBy: string;
  startedAt: string;
  finishedAt: string | null;
  projectId: number;
  workflowName: string | null;
  workflowRunId: string | null;
  workflowUrl: string | null;
  deploymentTarget: string | null;
  dockerStatus: string | null;
  dockerDetails: string | null;
}

export interface DeploymentTriggerResponse {
  projectId: number;
  repository: string;
  workflowName: string;
  ref: string;
  message: string;
}
