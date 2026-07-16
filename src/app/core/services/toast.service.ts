import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 0;

  show(message: string, type: ToastType = 'info', duration = 5000): void {
    const toast: ToastMessage = { id: ++this.nextId, message, type };
    this.messages.update(messages => [...messages, toast]);
    window.setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number): void {
    this.messages.update(messages => messages.filter(message => message.id !== id));
  }
}
