export type NotificationType =
  | 'INVITATION_SENT'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REJECTED'
  | 'MEMBER_UPDATED'
  | 'MEMBER_STATUS_CHANGED'
  | 'DEPLOYMENT_FAILED'
  | 'DEPLOYMENT_SUCCEEDED';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  projectId: number | null;
  invitationId: number | null;
  invitationToken: string | null;
  projectMemberId: number | null;
}
