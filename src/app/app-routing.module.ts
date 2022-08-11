import { ManageProductsComponent } from './manage-products/manage-products.component';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';
import { OrdersComponent } from './orders/orders.component';
import { ShoppingcartComponent } from './shoppingcart/shoppingcart.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'shoppingcart', component: ShoppingcartComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'manage-orders', component: ManageOrdersComponent },
  { path: 'manage-products', component: ManageProductsComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
