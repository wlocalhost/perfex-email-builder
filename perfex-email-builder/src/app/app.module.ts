import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IpEmailBuilderModule, ImageUploader } from 'ip-email-builder';
import { UploadImageService } from './app.upload.service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IpEmailBuilderModule.forRoot({
      xApiKey: 'ULMnDh2ens78ge40yU29Q7bbF6r0N5B96VNbebCJ',
      useDownloadButton: false,
      useSaveButton: false
    }),
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    TranslateModule,
    MatTooltipModule,
    MatChipsModule
  ],
  providers: [{
    provide: ImageUploader, useClass: UploadImageService
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
