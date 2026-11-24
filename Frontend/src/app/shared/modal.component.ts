import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { IconComponent } from './icon.component';

let nextModalId = 0;
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  template: `<dialog
    #dialog
    class="modal"
    [attr.aria-labelledby]="id + '-title'"
    [attr.aria-describedby]="description ? id + '-description' : null"
    (cancel)="requestClose($event)"
    (click)="backdrop($event)"
  >
    <header class="modal-heading">
      <div>
        <h2 [id]="id + '-title'">{{ title }}</h2>
        @if (description) {
          <p class="muted" [id]="id + '-description'">{{ description }}</p>
        }
      </div>
      <button type="button" class="icon-button" aria-label="Fechar janela" (click)="closed.emit()">
        <app-icon name="x" />
      </button>
    </header>
    <div class="modal-body"><ng-content /></div>
  </dialog>`,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() description = '';
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  readonly id = `ppi-modal-${++nextModalId}`;
  private previousFocus = document.activeElement as HTMLElement | null;
  private previousOverflow = '';
  ngAfterViewInit(): void {
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialog.nativeElement.showModal();
    const initial = this.dialog.nativeElement.querySelector<HTMLElement>(
      '[autofocus], input:not([type="hidden"]), textarea',
    );
    initial?.focus();
  }
  requestClose(event: Event): void {
    event.preventDefault();
    this.closed.emit();
  }
  backdrop(event: MouseEvent): void {
    if (event.target !== this.dialog.nativeElement) return;
    const rect = this.dialog.nativeElement.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      this.closed.emit();
  }
  ngOnDestroy(): void {
    this.dialog.nativeElement.close();
    document.body.style.overflow = this.previousOverflow;
    if (this.previousFocus?.isConnected) this.previousFocus.focus();
  }
}
