import { ForbiddenComponent } from './shared/forbidden/forbidden.component';
import { PagenotfoundComponent } from './shared/pagenotfound/pagenotfound.component';
import { NgModule } from '@angular/core';
import { canActivate, hasCustomClaim, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { CheckOutComponent } from './check-out/check-out.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { ProductsComponent } from './products/products.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { AdminAuthGuard } from './service/admin-auth-guard.service';

/** Add the intended route as parameter 'returnUrl' to the route of the login component. */
const redirectUnauthorizedToLogin = (activated: ActivatedRouteSnapshot, state: RouterStateSnapshot) => redirectUnauthorizedTo(['login', { returnUrl: state.url }]);
/** If a parameter 'returnUrl' exists on the route to the login component, use it to navigate there after the login has finished. */
const redirectLoggedInToHome = (activated: ActivatedRouteSnapshot) => redirectLoggedInTo([activated.paramMap.get('returnUrl') || '']);

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'shopping-cart', component: ShoppingCartComponent },
  { path: 'login', component: LoginComponent, ...canActivate(redirectLoggedInToHome) },
  { path: 'check-out', component: CheckOutComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'order-success', component: OrderSuccessComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'my/orders', component: MyOrdersComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AdminAuthGuard]},
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [AdminAuthGuard] },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', pathMatch: 'full', component: PagenotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
