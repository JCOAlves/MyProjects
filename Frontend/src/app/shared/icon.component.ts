import { Component, Input } from '@angular/core';

const paths: Record<string, string[]> = {
  home: ['m3 10 9-7 9 7', 'M5 9v11h5v-6h4v6h5V9'],
  folder: ['M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z'],
  settings: [
    'm9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h4l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z',
    'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  ],
  search: ['M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z', 'm15 15 6 6'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  sun: [
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  ],
  moon: ['M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z'],
  plus: ['M12 5v14M5 12h14'],
  check: ['m5 12 4 4L19 6'],
  'check-circle': ['M22 12A10 10 0 1 1 12 2', 'm8 11 4 4L22 5'],
  clock: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', 'M12 6v6l4 2'],
  'arrow-right': ['M4 12h16m-6-6 6 6-6 6'],
  'arrow-left': ['M20 12H4m6-6-6 6 6 6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-right': ['m9 6 6 6-6 6'],
  'chevron-left': ['m15 6-6 6 6 6'],
  more: ['M12 5h.01M12 12h.01M12 19h.01'],
  'more-horizontal': ['M5 12h.01M12 12h.01M19 12h.01'],
  user: ['M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', 'M5 21v-2a7 7 0 0 1 14 0v2Z'],
  users: [
    'M14 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    'M4 21v-2a7 7 0 0 1 14 0v2Z',
    'M18 4a3 3 0 0 1 0 6m2 5a5 5 0 0 1 2 4v2',
  ],
  mail: ['M3 5h18v14H3Z', 'm3 5 9 7 9-7'],
  lock: ['M5 10h14v11H5Z', 'M8 10V6a4 4 0 0 1 8 0v4'],
  eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  'eye-off': [
    'm3 3 18 18',
    'M10.5 5.1 12 5c7 0 10 7 10 7a18 18 0 0 1-3 4M6 6a21 21 0 0 0-4 6s3 7 10 7c2 0 4-.7 5.5-1.7',
  ],
  edit: ['m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0 0-3l-1-1a2 2 0 0 0-3 0L4 16Z'],
  pencil: ['m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0 0-3l-1-1a2 2 0 0 0-3 0L4 16Z'],
  note: ['M5 3h14v18H5Z', 'M8 7h8M8 11h8M8 15h5'],
  file: ['M5 3h9l5 5v13H5Z', 'M14 3v6h5M8 14h8M8 17h5'],
  trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7'],
  x: ['m6 6 12 12M6 18 18 6'],
  info: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z', 'M12 11v6M12 7v.01'],
  alert: ['m12 3 10 18H2Z', 'M12 9v5m0 3v.01'],
  'log-out': ['M9 21H3V3h6M10 12h12m-5-5 5 5-5 5'],
  logout: ['M9 21H3V3h6M10 12h12m-5-5 5 5-5 5'],
  menu: ['M3 6h18M3 12h18M3 18h18'],
  calendar: ['M3 5h18v16H3ZM7 2v6m10-6v6M3 11h18'],
  copy: ['M9 9h12v12H9Z', 'M5 15H3V3h12v2'],
  link: [
    'm10 13 4-4',
    'm8 15-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0m2 1 2-2a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0',
  ],
  upload: ['M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6'],
  camera: ['M3 7h4l2-3h6l2 3h4v14H3Z', 'M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  laptop: ['M4 3h16v14H4Z', 'M2 21h20l-2-4H4Z'],
  bulb: ['M9 18h6m-6 3h6', 'M8 15a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z'],
  chart: ['M4 21V11h4v10M10 21V6h4v15M16 21V2h4v19'],
  book: ['M12 6v15M3 3l9 3 9-3v15l-9 3-9-3Z'],
  rocket: [
    'M12 16 8 12C9 5 14 2 21 3c1 7-2 12-9 13Z',
    'M8 12H3l4-6h4m1 10v5l6-4v-4M4 16l-2 6 6-2',
    'M17 7h.01',
  ],
  shield: ['m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z', 'm8 12 3 3 5-6'],
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg
    [attr.width]="size"
    [attr.height]="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="name === 'more' || name === 'more-horizontal' ? 3 : 1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    @for (path of iconPaths; track $index) {
      <path [attr.d]="path" />
    }
  </svg>`,
  styles: [
    ':host{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:0;vertical-align:middle}',
  ],
})
export class IconComponent {
  @Input() name = 'folder';
  @Input() size = 20;
  get iconPaths(): string[] {
    return paths[this.name] ?? paths['folder'];
  }
}
