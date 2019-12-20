import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-templates *ngIf="mount === 'templates';else campaigns"></app-templates>
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

  constructor(el: ElementRef<HTMLElement>) {
    // const templateEl = this.el.nativeElement.nextElementSibling as HTMLTemplateElement;
    // this.renderer.setProperty(this.el.nativeElement, 'innerHTML', templateEl.innerHTML);
    this.mount = el.nativeElement.getAttribute('data-mount') || 'templates';

    console.log(el.nativeElement.dataset);
  }
}
