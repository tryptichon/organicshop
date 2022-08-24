import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { firstValueFrom, map, Subscription, switchMap, take, Observable, merge, tap } from 'rxjs';
import { DbProduct } from 'src/app/model/db-product';
import { CategoryService } from 'src/app/services/database/category.service';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';
import { DbShoppingCartProduct } from './../../model/shopping-cart';

interface TableEntry extends DbProduct {
  count: number
}

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass']
})
export class ShoppingCartComponent implements OnInit, AfterViewInit, OnDestroy {

  tableData$!: Observable<TableEntry[]>;

  /** Be aware, that this number contains rounding errors, so do NOT use this directly without
   * conversion to the precision you need! */
  totalPrice: number = 0;
  totalCount: number = 0;

  displayedColumns: string[] = ['name', 'category', 'price', 'count'];
  dataSource = new MatTableDataSource<TableEntry>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private tableSumSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) { }

  /**
   * Adds an observable for combined product and shoppingCartProduct data.
   */
  ngOnInit(): void {

    this.tableData$ = this.shoppingCartHandlerService.shoppingCartProductService.getDocuments$()
      .pipe(
        switchMap(shoppingCartProducts => {
          let promises: Promise<TableEntry>[] = [];

          shoppingCartProducts.forEach(shoppingCartProduct => {
            promises.push(
              firstValueFrom(this.productService.get(shoppingCartProduct.id)
                .pipe(
                  map(product => ({ ...product, count: shoppingCartProduct.count }))
                )
              )
            )
          })

          return Promise.all(promises);
        })
      );

  }

  /**
   * Calculates table data and table sums
   */
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.tableSumSubscription = this.tableData$
      .subscribe(tableData => {
        this.totalCount = 0;
        this.totalPrice = 0;
        tableData.forEach(t => {
          this.totalCount += t.count;
          this.totalPrice += t.count * t.price;
        });

        if (this.dataSource.data.length != tableData.length) {
          this.dataSource.data = [...tableData];
          this.table.renderRows();
        }
      })

  }

  ngOnDestroy(): void {
    if (this.tableSumSubscription)
      this.tableSumSubscription.unsubscribe();
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }
}
