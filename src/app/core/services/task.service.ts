import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskResponse, TaskCreateRequest, TaskUpdateRequest } from '../models/task.model';
import { Page } from '../models/page.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedToMe?: boolean;
  overdue?: boolean;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);

  list(projectId: number, filters: TaskFilters = {}): Observable<Page<TaskResponse>> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.assignedToMe) params = params.set('assignedToMe', 'true');
    if (filters.overdue) params = params.set('overdue', 'true');
    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 20).toString());
    return this.http.get<Page<TaskResponse>>(`${API}/projects/${projectId}/tasks`, { params });
  }

  get(taskId: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${API}/tasks/${taskId}`);
  }

  create(projectId: number, body: TaskCreateRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${API}/projects/${projectId}/tasks`, body);
  }

  update(taskId: number, body: TaskUpdateRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${API}/tasks/${taskId}`, body);
  }

  delete(taskId: number): Observable<void> {
    return this.http.delete<void>(`${API}/tasks/${taskId}`);
  }
}
