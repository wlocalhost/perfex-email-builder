import { Component, ElementRef } from '@angular/core';
import { ITemplate } from 'src/interfaces';

@Component({
  selector: 'app-root',
  template: `
    <app-templates [templates]="templates" *ngIf="mount === 'templates';else campaigns"></app-templates>
    <ng-template #campaigns>
      <app-campaigns></app-campaigns>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  mount: string;
  templates: ITemplate[];

  constructor(el: ElementRef<HTMLElement>) {
    this.mount = el.nativeElement.getAttribute('data-mount') || 'templates';
    const { templates } = el.nativeElement.dataset;
    this.templates = JSON.parse(templates);
  }
}
