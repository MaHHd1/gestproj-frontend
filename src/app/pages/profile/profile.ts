import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserResponse } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Profile</h1>
        <p class="text-slate-500 text-sm mt-1">Your account and identity details</p>
      </div>

      @if (loading()) {
        <div class="text-slate-500">Loading profile...</div>
      } @else if (!user()) {
        <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          Unable to load your profile.
        </div>
      } @else {
        <div class="bg-white border border-slate-200 rounded-2xl p-6">
          <div class="flex items-center gap-4 mb-6">
            @if (user()!.profileImageUrl) {
              <img [src]="user()!.profileImageUrl" [alt]="user()!.name" class="w-14 h-14 rounded-full object-cover" />
            } @else {
              <div class="w-14 h-14 rounded-full bg-indigo-500 text-white font-bold text-xl flex items-center justify-center">{{ initials() }}</div>
            }
            <div>
              <p class="text-lg font-semibold text-slate-800">{{ user()!.name }}</p>
              <p class="text-slate-500 text-sm">{{ user()!.email }}</p>
            </div>
          </div>

          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <dt class="text-xs text-slate-500 uppercase tracking-wide">Username</dt>
              <dd class="text-slate-800 font-medium mt-1">{{ user()!.username }}</dd>
            </div>
            <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <dt class="text-xs text-slate-500 uppercase tracking-wide">Email address</dt>
              <dd class="text-slate-800 font-medium mt-1 break-all">{{ user()!.email }}</dd>
            </div>
            <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <dt class="text-xs text-slate-500 uppercase tracking-wide">Account status</dt>
              <dd class="text-green-700 font-medium mt-1">Active</dd>
            </div>
          </dl>
          <p class="mt-5 text-xs text-slate-500">Profile editing and password changes will appear here when the backend profile-update endpoint is available.</p>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);

  user = signal<UserResponse | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.auth.me().subscribe({
      next: user => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.user.set(this.auth.currentUser());
        this.loading.set(false);
      }
    });
  }

  initials(): string {
    const name = this.user()?.name ?? '';
    return name.charAt(0).toUpperCase() || '?';
  }
}
