import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { environment } from '../environments/environment';
// import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared.module';
import { TemplateInfoComponent } from './template-info/template-info.component';
import { TemplatesModule } from './templates/templates.module';
import { CampaignsModule } from './campaigns/campaigns.module';
// import { EditTemplateComponent } from './templates/edit-template/edit-template.component';
// import { CampaignsComponent } from './campaigns/campaigns.component';
// import { TemplatesComponent } from './templates/templates.component';

@NgModule({
  declarations: [AppComponent, TemplateInfoComponent],
  entryComponents: [TemplateInfoComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    TemplatesModule,
    CampaignsModule
    // AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
