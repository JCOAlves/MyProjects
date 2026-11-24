import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<Toast[]>([]);
  private nextId = 0;
  show(message: string, tone: Toast['tone'] = 'success'): void {
    this.messages.update((items) =>
      [
        ...items.filter((item) => item.message !== message),
        { id: ++this.nextId, message, tone },
      ].slice(-3),
    );
    const id = this.nextId;
    setTimeout(() => this.dismiss(id), 5500);
  }
  dismiss(id: number): void {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }
}
