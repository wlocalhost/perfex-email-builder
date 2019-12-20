import { NgModule } from '@angular/core';

// import { TemplatesRoutingModule } from './templates-routing.module';
import { TemplatesComponent } from './templates.component';
import { SharedModule } from '../shared.module';
import { IP_CONFIG, IpEmailBuilderModule } from 'ip-email-builder';
import { environment } from '../../environments/environment';
import { EditTemplateComponent } from './edit-template/edit-template.component';


@NgModule({
  declarations: [TemplatesComponent, EditTemplateComponent],
  imports: [
    SharedModule,
    IpEmailBuilderModule.forChild({ xApiKey: '' }),
    // TemplatesRoutingModule,
  ],
  exports: [TemplatesComponent],
  providers: [{
    provide: IP_CONFIG, useValue: {
      xApiKey: 'ULMnDh2ens78ge40yU29Q7bbF6r0N5B96VNbebCJ',
      useDownloadButton: false,
      useSaveButton: false,
      uploadImagePath: `${environment.globalVariable.API_BASE}/upload`,
      csrf: { name: environment.globalVariable.CSRF.name, token: environment.globalVariable.CSRF.token }
    }
  }],
})
export class TemplatesModule { }
