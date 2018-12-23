import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MatToolbarModule, MatSelectModule} from '@angular/material';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {SmartContractService} from './smart-contract.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSelectModule
  ],
  providers: [SmartContractService],
  bootstrap: [AppComponent]
})
export class AppModule {}
