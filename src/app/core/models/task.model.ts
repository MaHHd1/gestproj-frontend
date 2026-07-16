export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';
export type TaskPriority = 'BASSE' | 'MOYENNE' | 'HAUTE';

export interface TaskResponse {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  late: boolean;
  assignedTo: number | null;
  assignedToUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedTo: number | null;
}

export interface TaskUpdateRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedTo: number | null;
}

export interface TaskCommentResponse {
  id: number;
  taskId: number;
  userId: number;
  username: string;
  userEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCommentCreateRequest {
  content: string;
}
