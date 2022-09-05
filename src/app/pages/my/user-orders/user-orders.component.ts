import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Subject, Subscription } from 'rxjs';
import { DbOrder } from 'src/app/model/db-order';
import { LoginService } from './../../../services/auth/login.service';
import { OrderService } from './../../../services/database/order.service';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.sass']
})
export class UserOrdersComponent implements OnInit, OnDestroy {

  userId?: string;

  orders$ = new Subject<DbOrder[]>();

  orderSubscription?: Subscription;
  loginSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.initWith(this.loginService.user?.id);

    this.loginSubscription = this.loginService.appUser$
      .subscribe(user => this.initWith(user?.id))
  }

  ngOnDestroy(): void {
    if (this.loginSubscription)
      this.loginSubscription.unsubscribe();
    if (this.orderSubscription)
      this.orderSubscription.unsubscribe();
  }

  initWith(userId?: string) {
    this.userId = userId;
    if (!userId)
      return;

    if (this.orderSubscription)
      this.orderSubscription.unsubscribe();

    this.orderSubscription = this.orderService.getAll()
      .pipe(
        map(orders => orders
          .filter(order => order.userId == userId)
          .sort((a, b) => b.dateOrdered - a.dateOrdered)
        )
      )
      .subscribe(orders => this.orders$.next(orders));
  }

}
