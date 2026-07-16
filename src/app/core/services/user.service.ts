import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API}/users/${id}`);
  }

  search(query: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${API}/users/search`, { params: { query } });
  }
}
