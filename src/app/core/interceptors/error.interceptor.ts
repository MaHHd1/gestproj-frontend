import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

let lastErrorKey = '';
let lastErrorAt = 0;
const duplicateToastWindowMs = 5000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasts = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = errorMessage(error);
      const isDeploymentStatusRequest =
        req.method === 'GET' && /\/api\/projects\/[^/]+\/(?:deployments|workflows)(?:\/|$)/i.test(req.url);
      const now = Date.now();
      const errorKey = `${error.status}:${message}`;
      const shouldNotify = errorKey !== lastErrorKey || now - lastErrorAt > duplicateToastWindowMs;
      if (shouldNotify) {
        lastErrorKey = errorKey;
        lastErrorAt = now;
      }

      if (error.status === 429) {
        if (shouldNotify) toasts.show('Too many requests. Please wait a moment and try again.', 'error', 7000);
      } else if (error.status === 0) {
        if (shouldNotify) toasts.show('Unable to reach the server. Check your connection and try again.', 'error');
      } else if (error.status >= 500) {
        // Deployment replaces the backend container. During that short restart,
        // Nginx can return 502 while the deployment/workflow polling requests
        // are already scheduled to retry. Do not show a noisy toast for those
        // background requests, and never surface Nginx's HTML error document.
        if (!isDeploymentStatusRequest && shouldNotify) {
          const fallback = error.status === 502
            ? 'The server is restarting for deployment. Please try again in a few seconds.'
            : 'The server encountered a problem. Please try again shortly.';
          toasts.show(message || fallback, 'error');
        }
      }
      return throwError(() => error);
    })
  );
};

function errorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'object' && error.error?.message) {
    return error.error.message;
  }
  if (typeof error.error === 'string' && error.error.trim()) {
    const text = error.error.trim();
    // Nginx sends an HTML error page for a gateway failure. It is not useful
    // as a toast message and should not be displayed as application content.
    if (/<(?:!doctype\s+html|html|head|body|title)\b/i.test(text)) {
      return '';
    }
    return text;
  }
  return '';
}
