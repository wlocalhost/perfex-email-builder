import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared.module';
import { TemplateInfoComponent } from './template-info/template-info.component';

@NgModule({
  declarations: [AppComponent, TemplateInfoComponent],
  entryComponents: [TemplateInfoComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
  ],
  // providers: [{
  //   // environment.globalVariable.CSRF.name, environment.globalVariable.CSRF.token
  //   // provide: ImageUploader, useClass: UploadImageService
  //   provide: IP_CONFIG, useValue: {
  //     xApiKey: 'ULMnDh2ens78ge40yU29Q7bbF6r0N5B96VNbebCJ',
  //     useDownloadButton: false,
  //     useSaveButton: false,
  //     uploadImagePath: `${environment.globalVariable.API_BASE}/upload`,
  //     csrf: { name: environment.globalVariable.CSRF.name, token: environment.globalVariable.CSRF.token }
  //   }
  // }],
  bootstrap: [AppComponent]
})
export class AppModule { }
