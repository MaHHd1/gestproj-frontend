import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkflowJobResponse, WorkflowRunResponse } from '../models/workflow.model';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  runs(projectId: number): Observable<WorkflowRunResponse[]> {
    return this.http.get<WorkflowRunResponse[]>(`${this.api}/projects/${projectId}/workflows/runs`);
  }

  jobs(projectId: number, runId: number): Observable<WorkflowJobResponse[]> {
    return this.http.get<WorkflowJobResponse[]>(`${this.api}/projects/${projectId}/workflows/runs/${runId}/jobs`);
  }

  logs(projectId: number, runId: number, jobId: number): Observable<string> {
    return this.http.get(`${this.api}/projects/${projectId}/workflows/runs/${runId}/jobs/${jobId}/logs`, { responseType: 'text' });
  }
}
