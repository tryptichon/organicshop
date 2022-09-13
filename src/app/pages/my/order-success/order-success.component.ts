import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbOrder } from 'src/app/model/db-order';
import { OrderService } from './../../../services/database/order.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.sass']
})
export class OrderSuccessComponent implements OnInit {

  order: DbOrder | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.data
      .subscribe(({ order }) => {
        this.order = order;
      });
  }


}
