import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { OwnerComponent } from './owner/owner.component';
import { AdminComponent } from './admin/admin.component';
import { StoreOwnerComponent } from './store-owner/store-owner.component';
import { StoreComponent } from './store-owner/store/store.component';
import { ItemComponent } from './store-owner/store/item/item.component';

const routes: Routes = [
  { path: '', component: CustomerComponent, pathMatch: 'full' },
  { path: 'owner', component: OwnerComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'storeowner', component: StoreOwnerComponent },
  { path: 'storeowner/:storeID', component: StoreComponent },
  { path: 'storeowner/:storeID/:itemID', component: ItemComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
