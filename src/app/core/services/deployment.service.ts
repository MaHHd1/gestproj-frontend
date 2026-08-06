import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeploymentResponse } from '../models/deployment.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DeploymentService {
  private http = inject(HttpClient);

  list(projectId: number): Observable<DeploymentResponse[]> {
    return this.http.get<DeploymentResponse[]>(`${API}/projects/${projectId}/deployments`);
  }
}
