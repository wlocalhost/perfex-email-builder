import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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


@NgModule({
  imports: [],
  declarations: [],
  exports: [
    CommonModule,
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
    MatListModule
  ]
})
export class SharedModule { }
