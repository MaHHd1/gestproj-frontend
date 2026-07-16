import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
      @for (toast of toastService.messages(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-lg border p-4 shadow-lg"
          [class]="toast.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'"
          role="alert"
        >
          <p class="flex-1 text-sm">{{ toast.message }}</p>
          <button type="button" (click)="toastService.dismiss(toast.id)" class="text-lg leading-none opacity-70 hover:opacity-100" aria-label="Dismiss notification">&times;</button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
