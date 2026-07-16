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
    <div class="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
      <div class="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 class="text-xl font-bold text-slate-800 mb-1">Project Invitation</h1>

        @if (loading()) {
          <p class="text-slate-500 text-sm">Loading invitation...</p>
        } @else if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {{ error() }}
          </div>
          <a routerLink="/login" class="inline-block mt-4 text-indigo-600 hover:underline text-sm">
            Go to login
          </a>
        } @else if (invitation()) {
          <p class="text-slate-600 text-sm mb-4">
            You were invited to join project #{{ invitation()!.projectId }}.
          </p>

          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-1 mb-5">
            <p><span class="font-medium">Status:</span> {{ invitation()!.status }}</p>
            <p><span class="font-medium">Role:</span> {{ invitation()!.proposedRole }}</p>
            <p><span class="font-medium">Expires at:</span> {{ formatDate(invitation()!.expiresAt) }}</p>
          </div>

          @if (success()) {
            <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
              {{ success() }}
            </div>
          }

          <div class="flex gap-3">
            <button
              (click)="accept()"
              [disabled]="saving() || invitation()!.status !== 'PENDING'"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
            >
              Accept
            </button>
            <button
              (click)="reject()"
              [disabled]="saving() || invitation()!.status !== 'PENDING'"
              class="flex-1 border border-slate-200 hover:bg-slate-50 py-2 rounded-lg text-sm font-medium text-slate-700"
            >
              Reject
            </button>
          </div>

          <a routerLink="/dashboard" class="inline-block mt-4 text-sm text-indigo-600 hover:underline">
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
