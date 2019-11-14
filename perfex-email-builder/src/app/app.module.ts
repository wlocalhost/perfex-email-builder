import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { IpEmailBuilderModule } from "ip-email-builder";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IpEmailBuilderModule.forRoot({
      xApiKey: ""
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
