import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-illustration',
  standalone: true,
  template: `<img
    [src]="'illustrations/' + safeKind + '.svg'"
    alt=""
    aria-hidden="true"
    width="480"
    height="400"
    draggable="false"
  />`,
  styles: [
    ':host{display:block;width:100%}img{display:block;width:100%;height:100%;object-fit:contain;user-select:none}',
  ],
})
export class IllustrationComponent {
  @Input() kind = 'tasks';
  get safeKind(): string {
    return [
      'tasks',
      'account',
      'cube',
      'not-found',
      'laptop',
      'bulb',
      'chart',
      'folder',
      'book',
      'rocket',
    ].includes(this.kind)
      ? this.kind
      : 'folder';
  }
}
