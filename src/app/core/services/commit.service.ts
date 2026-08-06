import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommitResponse } from '../models/commit.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CommitService {
  private http = inject(HttpClient);

  list(projectId: number): Observable<CommitResponse[]> {
    return this.http.get<CommitResponse[]>(`${API}/projects/${projectId}/commits`);
  }
}
