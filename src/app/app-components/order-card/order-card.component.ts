import { DbOrder } from 'src/app/model/db-order';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.sass']
})
export class OrderCardComponent {

  @Input() order?: DbOrder;

  constructor() { }

}
