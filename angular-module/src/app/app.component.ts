import { Component, ViewContainerRef, ComponentFactoryResolver, ViewChild, TemplateRef } from '@angular/core';


@Component({
  selector: 'app-root',
  template: `
    <ng-template></ng-template>
  `,
  styles: [`
    :host {
      display: block;
      height: inherit;
      min-height: inherit;
    }
  `],
})
export class AppComponent {
  @ViewChild(TemplateRef, { read: ViewContainerRef }) private templateRef: ViewContainerRef;

  constructor(private componentFactory: ComponentFactoryResolver) {
    this.lazyLoadComponent(globalThis.NGB.mount)
  }

  async lazyLoadComponent(mount?: string) {
    let component: any;
    if (mount === 'campaigns') {
      const { CampaignsComponent } = await import('./campaigns/campaigns.component');
      component = this.componentFactory.resolveComponentFactory(CampaignsComponent);
    } else if (mount === 'widgets') {
      const { WidgetsComponent } = await import('./widgets/widgets.component');
      component = this.componentFactory.resolveComponentFactory(WidgetsComponent);
    } else {
      const { TemplatesComponent } = await import('./templates/templates.component');
      component = this.componentFactory.resolveComponentFactory(TemplatesComponent);
    }
    this.templateRef.clear();
    this.templateRef.createComponent(component);
  }
}
