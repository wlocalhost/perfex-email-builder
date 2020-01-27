import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared.module';
import { TemplateInfoComponent } from './template-info/template-info.component';
import { TemplatesModule } from './templates/templates.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';

@NgModule({
  declarations: [AppComponent, TemplateInfoComponent, ModalDialogComponent],
  entryComponents: [TemplateInfoComponent, ModalDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    TemplatesModule,
    CampaignsModule,
    // AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
