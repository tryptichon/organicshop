import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';

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
    public shoppingCartService: ShoppingCartService
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

  logout() {
    this.loginService.logout();
  }

  get shoppingCartProducts$() {
    return this.shoppingCartService.shoppingCartProducts$;
  }
}
