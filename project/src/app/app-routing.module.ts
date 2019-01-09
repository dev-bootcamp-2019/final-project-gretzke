import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { OwnerComponent } from './owner/owner.component';
import { AdminComponent } from './admin/admin.component';
import { StoreOwnerComponent } from './store-owner/store-owner.component';
import { StoreComponent } from './store-owner/store/store.component';
import { ItemComponent } from './store-owner/store/item/item.component';
import { CStoreownerComponent } from './customer/c-storeowner/c-storeowner.component';
import { CStoreComponent } from './customer/c-storeowner/c-store/c-store.component';
import { CItemComponent } from './customer/c-storeowner/c-store/c-item/c-item.component';

const routes: Routes = [
  { path: '', component: CustomerComponent, pathMatch: 'full' },
  { path: 'owner', component: OwnerComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'storeowner', component: StoreOwnerComponent },
  { path: 'storeowner/:storeID', component: StoreComponent },
  { path: 'storeowner/:storeID/:itemID', component: ItemComponent },
  { path: ':address', component: CStoreownerComponent},
  { path: ':address/:storeID', component: CStoreComponent},
  { path: ':address/:storeID/:itemID', component: CItemComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
