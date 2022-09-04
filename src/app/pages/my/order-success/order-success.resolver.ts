import { OrderService } from './../../../services/database/order.service';
import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { DbOrder } from 'src/app/model/db-order';

@Injectable({
  providedIn: 'root'
})
export class OrderSuccessResolver implements Resolve<DbOrder | null> {

  constructor(
    private orderService: OrderService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DbOrder | null> {
    let orderId = route.paramMap.get('id');
    return (orderId) ? this.orderService.get(orderId) : of(null);
  }
}
