import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [RouterLink],
  template: `<a class="brand" routerLink="/" aria-label="PPI — página inicial"
    ><svg width="33" height="36" viewBox="0 0 32 36" aria-hidden="true">
      <path d="m16 1 15 8.5-15 8.8L1 9.5Z" fill="#2985f6" />
      <path d="m1 11.5 14 8.2V35L1 26.8Z" fill="#1462d8" />
      <path d="m17 19.7 14-8.2v15.3L17 35Z" fill="#084dbb" />
    </svg>
    @if (!compact) {
      <span>PPI</span>
    }
  </a>`,
  styles: [
    '.brand{display:inline-flex;align-items:center;gap:10px;color:var(--text);font-size:24px;font-weight:750;letter-spacing:-.7px;text-decoration:none}.brand:hover{opacity:.86}.brand svg{display:block}',
  ],
})
export class BrandComponent {
  @Input() compact = false;
}
