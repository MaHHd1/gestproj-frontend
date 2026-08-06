import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#0d1117] text-slate-200">
      <header class="sticky top-0 z-20 border-b border-black/20 bg-[#24292f] shadow-sm">
        <div class="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <a routerLink="/dashboard" class="mr-4 flex items-center gap-2 text-xl font-bold tracking-tight text-white"><span class="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 text-sm">⌘</span>GestProj</a>
          <nav class="order-3 flex w-full gap-1 overflow-x-auto pb-2 sm:order-none sm:w-auto sm:flex-1 sm:pb-0">
            <a routerLink="/dashboard" routerLinkActive="bg-white/15 text-white" [routerLinkActiveOptions]="{ exact: true }" class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">Projects</a>
            <a routerLink="/notifications" routerLinkActive="bg-white/15 text-white" class="relative rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">Notifications @if (unreadCount() > 0) { <span class="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span> }</a>
            <a routerLink="/profile" routerLinkActive="bg-white/15 text-white" class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">Profile</a>
          </nav>
          <div class="ml-auto flex items-center gap-2">
            <a routerLink="/profile" class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-slate-200 hover:bg-slate-700">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900">{{ userInitial() }}</span>
              <span class="hidden max-w-36 truncate text-sm sm:block">{{ auth.currentUser()?.name }}</span>
            </a>
            <button (click)="logout()" class="rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white">Sign out</button>
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-7xl"><router-outlet /></main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  private notifications = inject(NotificationService);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.notifications.unread().subscribe({ next: items => this.unreadCount.set(items.length), error: () => {} });
  }

  userInitial(): string {
    return this.auth.currentUser()?.name?.charAt(0).toUpperCase() || '?';
  }

  logout(): void {
    this.auth.logout();
  }
}
