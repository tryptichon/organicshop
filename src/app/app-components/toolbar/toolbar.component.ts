import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, map } from 'rxjs';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';

import { LoginService } from './../../services/auth/login.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnInit, OnDestroy {

  public isAdmin: boolean = false;
  public name?: string;

  public shoppingCartCount$!: Observable<number | null>;

  private userSubscription?: Subscription;

  constructor(
    public loginService: LoginService,
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) {
  }

  ngOnInit(): void {
    this.userSubscription = this.loginService.appUser$
      .subscribe(appUser => {
        this.isAdmin = appUser?.isAdmin || false;
        this.name = appUser?.name;
      });

    this.shoppingCartCount$ = this.shoppingCartHandlerService.shoppingCartProductService.getDocuments$()
      .pipe(
        map(shoppingCartDocuments => {
          if (!shoppingCartDocuments)
            return null;

          let sum = shoppingCartDocuments.map(shoppingCartDocument => shoppingCartDocument.count).reduce((sum, current) => sum += current, 0);

          return sum > 0 ? sum : null;
        }
        )
      )
  }

  ngOnDestroy(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
  }

  logout() {
    this.loginService.logout();
  }
}
