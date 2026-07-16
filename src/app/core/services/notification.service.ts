import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationResponse } from '../models/notification.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  list(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${API}/notifications`);
  }

  unread(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${API}/notifications/unread`);
  }

  markRead(id: number): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${API}/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${API}/notifications/read-all`, {});
  }
}
