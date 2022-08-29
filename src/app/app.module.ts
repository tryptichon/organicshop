import '@angular/common/locales/global/de';
import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from './../environments/environment';

import { FooterComponent } from './app-components/footer/footer.component';
import { ProductCardComponent } from './app-components/product-card/product-card.component';
import { ToolbarComponent } from './app-components/toolbar/toolbar.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialComponentsModule } from './material-components/material-components.module';

import { ConfirmDialogComponent } from './app-components/dialogs/confirm-dialog/confirm-dialog.component';
import { ProductCartButtonComponent } from './app-components/product-cart-button/product-cart-button.component';
import { ProductFilterComponent } from './app-components/product-filter/product-filter.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { AdminProductComponent } from './pages/admin/admin-product/admin-product.component';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { ForbiddenComponent } from './pages/errors/forbidden/forbidden.component';
import { PagenotfoundComponent } from './pages/errors/pagenotfound/pagenotfound.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { CheckOutComponent } from './pages/my/check-out/check-out.component';
import { MyOrdersComponent } from './pages/my/my-orders/my-orders.component';
import { OrderSuccessComponent } from './pages/my/order-success/order-success.component';
import { ProductsComponent } from './pages/products/products.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { ErrorDialogComponent } from './app-components/dialogs/error-dialog/error-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    HomeComponent,
    ShoppingCartComponent,
    ProductsComponent,
    CheckOutComponent,
    ShoppingCartComponent,
    OrderSuccessComponent,
    MyOrdersComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    LoginComponent,
    PagenotfoundComponent,
    ForbiddenComponent,
    FooterComponent,
    ProductCardComponent,
    AdminProductComponent,
    ConfirmDialogComponent,
    ProductFilterComponent,
    ProductCartButtonComponent,
    ErrorDialogComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialComponentsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
