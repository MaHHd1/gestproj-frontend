export type ProjectMemberRole = 'OWNER' | 'MEMBER';
export type ProjectMemberStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

export interface ProjectMemberResponse {
  id: number;
  projectId: number;
  userId: number;
  username: string;
  role: ProjectMemberRole;
  status: ProjectMemberStatus;
  roleTitle: string;
  roleDescription: string;
  canViewProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canInviteMember: boolean;
  canManageMembers: boolean;
}

export interface ProjectMemberUpdateRequest {
  role: ProjectMemberRole;
  status: ProjectMemberStatus;
  roleTitle: string;
  roleDescription: string;
  canViewProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canInviteMember: boolean;
  canManageMembers: boolean;
}
