import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-[#0d1117] p-4">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center"><h1 class="text-4xl font-bold text-white"><span class="text-indigo-400">Gest</span>Proj</h1><p class="mt-2 text-slate-400">Reset your password</p></div>
        <div class="rounded-xl border border-slate-700 bg-[#161b22] p-8 shadow-2xl">
          @if (sent()) {
            <h2 class="text-2xl font-bold text-white">Check your inbox</h2>
            <p class="mt-3 text-sm text-slate-300">If an account exists for that address, we sent password-reset instructions.</p>
            <a routerLink="/login" class="mt-6 inline-block text-sm font-medium text-white hover:underline">Back to sign in</a>
          } @else {
            <h2 class="text-2xl font-bold text-white">Forgot password?</h2>
            <p class="mt-2 text-sm text-slate-500">Enter your email and we’ll send reset instructions.</p>
            @if (error()) { <p class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p> }
            <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
              <div><label class="mb-1 block text-sm font-medium text-slate-700">Email</label><input formControlName="email" type="email" placeholder="you@example.com" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />@if (form.controls.email.invalid && form.controls.email.touched) { <p class="mt-1 text-xs text-red-500">Enter a valid email address.</p> }</div>
              <button [disabled]="saving()" class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{{ saving() ? 'Sending…' : 'Send reset link' }}</button>
            </form>
            <p class="mt-6 text-center text-sm text-slate-500"><a routerLink="/login" class="font-medium text-indigo-600 hover:underline">Back to sign in</a></p>
          }
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  saving = signal(false);
  sent = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.error.set('');
    this.auth.requestPasswordReset(this.form.controls.email.value).subscribe({
      next: () => { this.sent.set(true); this.saving.set(false); },
      error: err => { this.error.set(err.error?.message ?? 'Unable to send the reset link. Please try again.'); this.saving.set(false); }
    });
  }
}
