import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Subscription } from 'rxjs';
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

  public shoppingCartCount!: number | null;

  private idSubscription?: Subscription;
  private userSubscription?: Subscription;
  private productSumSubscription?: Subscription;

  constructor(
    public loginService: LoginService,
    private shoppingCartHandlerService: ShoppingCartHandlerService,
    private dialogs: DialogHandler
  ) {
  }

  ngOnInit(): void {
    this.userSubscription = this.loginService.appUser$
      .subscribe(appUser => {
        this.isAdmin = appUser?.isAdmin || false;
        this.name = appUser?.name;
      });

    this.idSubscription = this.shoppingCartHandlerService.shoppingCartId$
      .subscribe(shoppingCartId => {
        if (this.productSumSubscription)
          this.productSumSubscription.unsubscribe();

        this.productSumSubscription = this.shoppingCartHandlerService
          .getShoppingCartProductService(shoppingCartId)
          .getAll()
          .pipe(
            map(shoppingCartDocuments => {
              if (!shoppingCartDocuments)
                return null;

              let sum = shoppingCartDocuments.map(shoppingCartDocument => shoppingCartDocument.count).reduce((sum, current) => sum += current, 0);

              return sum > 0 ? sum : null;
            })
          )
          .subscribe(sum => {
            this.shoppingCartCount = sum;
          });
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    if (this.productSumSubscription)
      this.productSumSubscription.unsubscribe();
    if (this.idSubscription)
      this.idSubscription.unsubscribe();
  }

  logout() {
    this.loginService.logout();
  }
}
