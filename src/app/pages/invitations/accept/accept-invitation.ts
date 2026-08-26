import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvitationService } from '../../../core/services/invitation.service';
import { ProjectInvitationResponse } from '../../../core/models/invitation.model';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-black p-4 text-white sm:p-6">
      <div class="w-full max-w-lg border border-white/25 bg-[#111111] p-6 shadow-2xl shadow-black sm:p-8">
        <div class="mb-7 border-b border-white/20 pb-5">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">GestProj</p>
          <h1 class="text-2xl font-bold tracking-tight text-white">Project invitation</h1>
        </div>

        @if (loading()) {
          <div class="flex items-center gap-3 text-sm text-slate-300"><span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>Loading invitation...</div>
        } @else if (error()) {
          <div class="border border-white/35 bg-white/10 p-4 text-sm text-white">
            {{ error() }}
          </div>
          <a routerLink="/login" class="mt-5 inline-block border-b border-white text-sm font-medium text-white hover:text-slate-300">
            Go to login
          </a>
        } @else if (invitation()) {
          <p class="mb-5 text-sm leading-6 text-slate-300">
            You were invited to join project #{{ invitation()!.projectId }}.
          </p>

          <div class="mb-6 divide-y divide-white/15 border border-white/20 text-sm">
            <p class="flex items-center justify-between gap-4 p-4"><span class="text-slate-400">Status</span><span class="font-semibold text-white">{{ invitation()!.status }}</span></p>
            <p class="flex items-center justify-between gap-4 p-4"><span class="text-slate-400">Role</span><span class="font-semibold text-white">{{ invitation()!.proposedRole }}</span></p>
            <p class="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><span class="text-slate-400">Expires</span><span class="font-medium text-white">{{ formatDate(invitation()!.expiresAt) }}</span></p>
          </div>

          @if (success()) {
            <div class="mb-4 border border-white/35 bg-white/10 p-4 text-sm text-white">
              {{ success() }}
            </div>
          }

          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              (click)="accept()"
              [disabled]="saving() || invitation()!.status !== 'PENDING'"
              class="flex-1 bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              @if (saving()) { Saving... } @else { Accept invitation }
            </button>
            <button
              (click)="reject()"
              [disabled]="saving() || invitation()!.status !== 'PENDING'"
              class="flex-1 border border-white/50 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reject invitation
            </button>
          </div>

          <a routerLink="/dashboard" class="mt-6 inline-block border-b border-white/60 pb-0.5 text-sm text-slate-300 hover:border-white hover:text-white">
            Open dashboard
          </a>
        }
      </div>
    </div>
  `
})
export class AcceptInvitationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationService = inject(InvitationService);

  token = '';
  invitation = signal<ProjectInvitationResponse | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error.set('Invalid invitation link.');
      this.loading.set(false);
      return;
    }
    this.token = token;
    this.load();
  }

  accept(): void {
    this.saving.set(true);
    this.error.set('');
    this.invitationService.accept(this.token).subscribe({
      next: invitation => {
        this.invitation.set(invitation);
        this.success.set('Invitation accepted successfully.');
        this.saving.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Unable to accept invitation.');
        this.saving.set(false);
      }
    });
  }

  reject(): void {
    this.saving.set(true);
    this.error.set('');
    this.invitationService.reject(this.token).subscribe({
      next: invitation => {
        this.invitation.set(invitation);
        this.success.set('Invitation rejected.');
        this.saving.set(false);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Unable to reject invitation.');
        this.saving.set(false);
      }
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  private load(): void {
    this.loading.set(true);
    this.invitationService.getByToken(this.token).subscribe({
      next: invitation => {
        this.invitation.set(invitation);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message ?? 'Invitation not found or expired.');
        this.loading.set(false);
      }
    });
  }
}
