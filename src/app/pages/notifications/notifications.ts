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
          <h1 class="text-2xl font-bold text-white">Notifications</h1>
          <p class="text-slate-400 text-sm mt-1">Project, invitation, member, and deployment updates</p>
        </div>
        <button
          (click)="markAllAsRead()"
          [disabled]="saving() || unreadCount() === 0"
          class="bg-slate-950 hover:bg-slate-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Mark all as read
        </button>
      </div>

      @if (loading()) {
        <div class="text-slate-500">Loading notifications...</div>
      } @else if (notifications().length === 0) {
        <div class="gp-empty-state text-slate-500">
          <div class="gp-empty-icon" aria-hidden="true">✦</div>
          <p class="font-medium text-slate-700">No notifications yet</p>
          <p class="mt-1 text-sm">Updates from your projects will appear here.</p>
        </div>
      } @else {
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-slate-500">{{ unreadCount() }} unread</p>
          <button (click)="showUnreadOnly.set(!showUnreadOnly())" class="text-sm font-medium text-slate-900 hover:underline">
            {{ showUnreadOnly() ? 'Show all' : 'Show unread only' }}
          </button>
        </div>
        <div class="space-y-3">
          @for (notification of visibleNotifications(); track notification.id) {
            <div
              class="border rounded-xl p-4 transition-colors"
              [class.border-slate-500]="!notification.read"
              [class.border-slate-700]="notification.read"
              [class.bg-slate-800]="!notification.read"
              [class.bg-[#161b22]]="notification.read"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="flex items-center gap-2 font-semibold text-white">@if (!notification.read) { <span class="h-2 w-2 rounded-full bg-white" aria-label="Unread"></span> }{{ notification.title }}</p>
                  <p class="text-sm text-slate-300 mt-1">{{ notification.message }}</p>
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
                      class="text-xs border border-slate-600 text-slate-200 hover:bg-slate-800 px-2 py-1 rounded"
                    >
                      Mark read
                    </button>
                  }
                </div>
              </div>
            </div>
          }
          @if (visibleNotifications().length === 0) {
            <div class="rounded-xl border border-slate-700 bg-[#161b22] p-6 text-sm text-slate-400">No unread notifications.</div>
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
  showUnreadOnly = signal(false);

  ngOnInit(): void {
    this.load();
  }

  unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  visibleNotifications(): NotificationResponse[] {
    return this.showUnreadOnly() ? this.notifications().filter(notification => !notification.read) : this.notifications();
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
