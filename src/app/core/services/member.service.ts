import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectMemberResponse, ProjectMemberUpdateRequest } from '../models/member.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class MemberService {
  private http = inject(HttpClient);

  list(projectId: number): Observable<ProjectMemberResponse[]> {
    return this.http.get<ProjectMemberResponse[]>(`${API}/projects/${projectId}/members`);
  }

  update(projectId: number, memberId: number, body: ProjectMemberUpdateRequest): Observable<ProjectMemberResponse> {
    return this.http.put<ProjectMemberResponse>(`${API}/projects/${projectId}/members/${memberId}`, body);
  }

  remove(projectId: number, userId: number): Observable<void> {
    // The member endpoint identifies the person by their user id, not the
    // project-membership record id returned by the list endpoint.
    return this.http.delete<void>(`${API}/projects/${projectId}/members/${userId}`);
  }
}
