import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeploymentResponse, DeploymentTriggerResponse } from '../models/deployment.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DeploymentService {
  private http = inject(HttpClient);

  list(projectId: number): Observable<DeploymentResponse[]> {
    return this.http.get<DeploymentResponse[]>(`${API}/projects/${projectId}/deployments`);
  }

  trigger(projectId: number): Observable<DeploymentTriggerResponse> {
    return this.http.post<DeploymentTriggerResponse>(`${API}/projects/${projectId}/deployments/trigger`, {});
  }
}
