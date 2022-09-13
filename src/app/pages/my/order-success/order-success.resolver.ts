import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { DbOrder } from 'src/app/model/db-order';
import { OrderService } from './../../../services/database/order.service';

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
