import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { IpEmailBuilderModule } from 'ip-email-builder';

import { KeyToLangPipe } from './key-to-lang.pipe';
import { AppComponent } from './app.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { TemplatesComponent } from './templates/templates.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { PurchaseCodeInjectorService } from './purchase-code-injector.service';
import { WidgetsComponent } from './widgets/widgets.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalDialogComponent,
    KeyToLangPipe,
    TemplatesComponent,
    CampaignsComponent,
    WidgetsComponent
  ],
  entryComponents: [ModalDialogComponent, TemplatesComponent],
  imports: [
    CommonModule,
    BrowserModule,
    NoopAnimationsModule,
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
    MatChipsModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    MatTabsModule,
    MatExpansionModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatListModule,
    MatDialogModule,
    MatSlideToggleModule,
    IpEmailBuilderModule.forRoot({
      xApiKey: 'ULMnDh2ens78ge40yU29Q7bbF6r0N5B96VNbebCJ',
      uploadImagePath: `${globalThis.NGB.baseUrl}/upload`,
      uploadImageName: 'image',
      csrf: globalThis.NGB.csrf,
      useDownloadButton: false,
      useSaveButton: false,
      usePreviewButton: false,
      templateListIfEmpty: false
    })
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: PurchaseCodeInjectorService,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
