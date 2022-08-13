import { MaterialComponentsModule } from './material-components/material-components.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from '../environments/environment';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Components

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './app-components/toolbar/toolbar.component';
import { HomeComponent } from './pages/public/home/home.component';
import { ProductsComponent } from './pages/public/products/products.component';
import { CheckOutComponent } from './pages/loggedin/check-out/check-out.component';
import { ShoppingCartComponent } from './pages/public/shopping-cart/shopping-cart.component';
import { OrderSuccessComponent } from './pages/loggedin/order-success/order-success.component';
import { MyOrdersComponent } from './pages/loggedin/my-orders/my-orders.component';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { LoginComponent } from './pages/public/login/login.component';
import { PagenotfoundComponent } from './pages/errors/pagenotfound/pagenotfound.component';
import { ForbiddenComponent } from './pages/errors/forbidden/forbidden.component';
import { FooterComponent } from './app-components/footer/footer.component';

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
    FooterComponent
  ],
  imports: [
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
