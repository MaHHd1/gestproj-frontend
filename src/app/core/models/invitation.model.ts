import { ProjectMemberRole } from './member.model';

export type ProjectInvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface ProjectInvitationResponse {
  id: number;
  projectId: number;
  invitedById: number;
  invitedEmail: string;
  token: string;
  status: ProjectInvitationStatus;
  expiresAt: string;
  proposedRole: ProjectMemberRole;
  roleTitle: string;
  roleDescription: string;
  canViewProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canInviteMember: boolean;
  canManageMembers: boolean;
}

export interface ProjectInvitationCreateRequest {
  invitedEmail: string;
  proposedRole: ProjectMemberRole;
  roleTitle: string;
  roleDescription: string;
  canViewProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canInviteMember: boolean;
  canManageMembers: boolean;
}
