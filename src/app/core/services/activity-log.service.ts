import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLogResponse } from '../models/activity-log.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private http = inject(HttpClient);

  list(projectId: number): Observable<ActivityLogResponse[]> {
    return this.http.get<ActivityLogResponse[]>(`${API}/projects/${projectId}/activity-logs`);
  }
}
