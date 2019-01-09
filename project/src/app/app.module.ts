import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  MatToolbarModule,
  MatSelectModule,
  MatIconModule,
  MatTooltipModule,
  MatInputModule,
  MatButtonModule,
  MatDialogModule,
  MatCardModule,
  MatDividerModule,
  MatGridListModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatListModule
} from '@angular/material';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { SmartContractService } from './smart-contract.service';
import { HeaderComponent } from './header/header.component';
import { OwnerComponent } from './owner/owner.component';
import { AdminComponent } from './admin/admin.component';
import { StoreOwnerComponent } from './store-owner/store-owner.component';
import { CustomerComponent } from './customer/customer.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddStoreDialogComponent } from './store-owner/add-store-dialog/add-store-dialog.component';
import { StoreComponent } from './store-owner/store/store.component';
import { ItemComponent } from './store-owner/store/item/item.component';
import { AddItemDialogComponent } from './store-owner/store/add-item-dialog/add-item-dialog.component';
import { RestockItemDialogComponent } from './store-owner/store/item/restock-item-dialog/restock-item-dialog.component';
import { ChangePriceDialogComponent } from './store-owner/store/item/change-price-dialog/change-price-dialog.component';
import { CStoreownerComponent } from './customer/c-storeowner/c-storeowner.component';
import { CStoreComponent } from './customer/c-storeowner/c-store/c-store.component';
import { CItemComponent } from './customer/c-storeowner/c-store/c-item/c-item.component';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OwnerComponent,
    AdminComponent,
    StoreOwnerComponent,
    CustomerComponent,
    AddStoreDialogComponent,
    StoreComponent,
    ItemComponent,
    AddItemDialogComponent,
    RestockItemDialogComponent,
    ChangePriceDialogComponent,
    CStoreownerComponent,
    CStoreComponent,
    CItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  entryComponents: [
    AddStoreDialogComponent,
    AddItemDialogComponent,
    RestockItemDialogComponent,
    ChangePriceDialogComponent
  ],
  providers: [SmartContractService, { provide: APP_BASE_HREF, useValue: '/' }],
  bootstrap: [AppComponent]
})
export class AppModule {}
