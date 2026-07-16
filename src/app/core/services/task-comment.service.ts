import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskCommentResponse, TaskCommentCreateRequest } from '../models/task.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class TaskCommentService {
  private http = inject(HttpClient);

  list(taskId: number): Observable<TaskCommentResponse[]> {
    return this.http.get<TaskCommentResponse[]>(`${API}/tasks/${taskId}/comments`);
  }

  create(taskId: number, body: TaskCommentCreateRequest): Observable<TaskCommentResponse> {
    return this.http.post<TaskCommentResponse>(`${API}/tasks/${taskId}/comments`, body);
  }

  delete(taskId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${API}/tasks/${taskId}/comments/${commentId}`);
  }
}
