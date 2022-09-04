import { Observable } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DbOrder } from 'src/app/model/db-order';
import { OrderService } from 'src/app/services/database/order.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.sass']
})
export class AdminOrdersComponent implements OnInit {

  orders$?: Observable<DbOrder[]>;

  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.orders$ = this.orderService.getAll();
  }

}
