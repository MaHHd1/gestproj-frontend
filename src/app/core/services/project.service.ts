import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProjectResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectStatisticsResponse
} from '../models/project.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  list(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${API}/projects`);
  }

  get(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${API}/projects/${id}`);
  }

  getStatistics(id: number): Observable<ProjectStatisticsResponse> {
    return this.http.get<ProjectStatisticsResponse>(`${API}/projects/${id}/statistics`);
  }

  create(body: ProjectCreateRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`${API}/projects`, {
      name: body.name,
      description: body.description,
      repoOwner: body.repoOwner?.trim() || null,
      repoName: body.repoName?.trim() || null
    });
  }

  update(id: number, body: ProjectUpdateRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${API}/projects/${id}`, {
      name: body.name,
      description: body.description,
      repoOwner: body.repoOwner?.trim() || null,
      repoName: body.repoName?.trim() || null
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/projects/${id}`);
  }
}
