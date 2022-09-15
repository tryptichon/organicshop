import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DbOrder } from 'src/app/model/db-order';

@Component({
  selector: 'app-orders-table',
  templateUrl: './orders-table.component.html',
  styleUrls: ['./orders-table.component.sass']
})
export class OrdersTableComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'dateOrdered', 'shipping', 'totalPrice']
  dataSource = new MatTableDataSource<DbOrder>;

  private _orders: DbOrder[] | null = null;

  @Input()
  public set orders(value: DbOrder[] | null) {
    this._orders = value;

    if (this._orders) {
      this.dataSource.data = [...this._orders];
    }
  }

  public get orders() {
    return this._orders;
  }

  constructor() { }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
