import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-8 max-w-4xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Notifications</h1>
          <p class="text-slate-500 text-sm mt-1">Invitation and member activity updates</p>
        </div>
        <button
          (click)="markAllAsRead()"
          [disabled]="saving() || unreadCount() === 0"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Mark all as read
        </button>
      </div>

      @if (loading()) {
        <div class="text-slate-500">Loading notifications...</div>
      } @else if (notifications().length === 0) {
        <div class="bg-white border border-slate-200 rounded-xl p-6 text-slate-500 text-sm">
          No notifications yet.
        </div>
      } @else {
        <div class="space-y-3">
          @for (notification of notifications(); track notification.id) {
            <div
              class="bg-white border rounded-xl p-4 transition-colors"
              [class.border-indigo-300]="!notification.read"
              [class.border-slate-200]="notification.read"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-semibold text-slate-800">{{ notification.title }}</p>
                  <p class="text-sm text-slate-600 mt-1">{{ notification.message }}</p>
                  <p class="text-xs text-slate-400 mt-2">{{ formatDate(notification.createdAt) }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  @if (notification.invitationToken && notification.type === 'INVITATION_SENT') {
                    <a
                      [routerLink]="['/invites', notification.invitationToken]"
                      class="text-xs text-indigo-600 hover:underline"
                    >
                      Review invitation
                    </a>
                  } @else if (notification.projectId) {
                    <a
                      [routerLink]="['/projects', notification.projectId]"
                      class="text-xs text-indigo-600 hover:underline"
                    >
                      Open project
                    </a>
                  }
                  @if (!notification.read) {
                    <button
                      (click)="markRead(notification.id)"
                      [disabled]="saving()"
                      class="text-xs border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded"
                    >
                      Mark read
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<NotificationResponse[]>([]);
  loading = signal(true);
  saving = signal(false);

  ngOnInit(): void {
    this.load();
  }

  unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  markRead(id: number): void {
    this.saving.set(true);
    this.notificationService.markRead(id).subscribe({
      next: updated => {
        this.notifications.update(list =>
          list.map(item => (item.id === updated.id ? updated : item))
        );
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  markAllAsRead(): void {
    this.saving.set(true);
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(item => ({ ...item, read: true })));
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  private load(): void {
    this.loading.set(true);
    this.notificationService.list().subscribe({
      next: data => {
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
