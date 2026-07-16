import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectInvitationResponse, ProjectInvitationCreateRequest } from '../models/invitation.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);

  list(projectId: number): Observable<ProjectInvitationResponse[]> {
    return this.http.get<ProjectInvitationResponse[]>(`${API}/projects/${projectId}/invites`);
  }

  create(projectId: number, body: ProjectInvitationCreateRequest): Observable<ProjectInvitationResponse> {
    return this.http.post<ProjectInvitationResponse>(`${API}/projects/${projectId}/invites`, body);
  }

  getByToken(token: string): Observable<ProjectInvitationResponse> {
    return this.http.get<ProjectInvitationResponse>(`${API}/invites/${token}`);
  }

  accept(token: string): Observable<ProjectInvitationResponse> {
    return this.http.post<ProjectInvitationResponse>(`${API}/invites/${token}/accept`, {});
  }

  reject(token: string): Observable<ProjectInvitationResponse> {
    return this.http.post<ProjectInvitationResponse>(`${API}/invites/${token}/reject`, {});
  }
}
