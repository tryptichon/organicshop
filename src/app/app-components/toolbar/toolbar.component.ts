import { Component, OnDestroy, OnInit } from '@angular/core';
import { from, map, Observable, Subscription } from 'rxjs';
import { ShoppingCart } from 'src/app/model/shopping-cart';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';
import { DialogHandler } from '../dialogs/DialogHandler';

import { LoginService } from './../../services/auth/login.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnInit, OnDestroy {

  public isAdmin: boolean = false;
  public name?: string;

  private userSubscription?: Subscription;

  constructor(
    public loginService: LoginService,
    public shoppingCartHandlerService: ShoppingCartHandlerService,
    private dialogs: DialogHandler
  ) {
  }

  ngOnInit(): void {
    this.userSubscription = this.loginService.appUser$
      .subscribe(appUser => {
        this.isAdmin = appUser?.isAdmin || false;
        this.name = appUser?.name;
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
  }

  get shoppingCart$() {
    return this.shoppingCartHandlerService.shoppingCart$;
  }

  logout() {
    this.loginService.logout();
  }

}
