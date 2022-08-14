import { ForbiddenComponent } from './pages/errors/forbidden/forbidden.component';
import { PagenotfoundComponent } from './pages/errors/pagenotfound/pagenotfound.component';
import { NgModule } from '@angular/core';
import { AuthGuard, canActivate, hasCustomClaim, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { CheckOutComponent } from './pages/my/check-out/check-out.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MyOrdersComponent } from './pages/my/my-orders/my-orders.component';
import { OrderSuccessComponent } from './pages/my/order-success/order-success.component';
import { ProductsComponent } from './pages/products/products.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { AdminAuthGuard } from './services/routing/admin-auth-guard.service';

/** Add the intended route as parameter 'returnUrl' to the route of the login component. */
const redirectUnauthorizedToLogin = (activated: ActivatedRouteSnapshot, state: RouterStateSnapshot) => redirectUnauthorizedTo(['login', { returnUrl: state.url }]);
/** If a parameter 'returnUrl' exists on the route to the login component, use it to navigate there after the login has finished. */
const redirectLoggedInToHome = (activated: ActivatedRouteSnapshot) => redirectLoggedInTo([activated.paramMap.get('returnUrl') || '']);

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'shopping-cart', component: ShoppingCartComponent },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToHome } },
  { path: 'check-out', component: CheckOutComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'order-success', component: OrderSuccessComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'my/orders', component: MyOrdersComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, noAdminRedirectUrl: ['forbidden'] } },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin, noAdminRedirectUrl: ['forbidden'] } },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', pathMatch: 'full', component: PagenotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
