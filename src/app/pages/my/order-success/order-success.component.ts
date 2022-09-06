import { ActivatedRoute } from '@angular/router';
import { OrderService } from './../../../services/database/order.service';
import { Component, OnInit } from '@angular/core';
import { DbOrder } from 'src/app/model/db-order';
import { Observable, Subject, take, tap } from 'rxjs';

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
