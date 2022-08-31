import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { firstValueFrom, map, Subscription, switchMap } from 'rxjs';
import { DbProduct } from 'src/app/model/db-product';
import { CategoryService } from 'src/app/services/database/category.service';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';

export interface ResolvedShoppingCartProduct extends DbProduct {
  count: number
}

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass']
})
export class ShoppingCartComponent implements AfterViewInit, OnDestroy {

  /** Be aware, that this number contains rounding errors, so do NOT use this directly without
   * conversion to the precision you need! */
  totalPrice: number = 0;
  totalCount: number = 0;

  displayedColumns: string[] = ['name', 'category', 'price', 'count'];
  dataSource = new MatTableDataSource<ResolvedShoppingCartProduct>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private idSubscription?: Subscription;
  private tableSumSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) { }

  /**
   * Calculates table data and table sums
   */
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.idSubscription = this.shoppingCartHandlerService.shoppingCartId$
      .subscribe(shoppingCartId => {
        if (this.tableSumSubscription)
          this.tableSumSubscription.unsubscribe();

        this.tableSumSubscription = this.shoppingCartHandlerService
          .getShoppingCartProductService(shoppingCartId)
          .getAll()
          .pipe(
            switchMap(dbShoppingCartProducts => {
              let promises: Promise<ResolvedShoppingCartProduct>[] = [];

              dbShoppingCartProducts.forEach(dbShoppingCartProduct => {
                promises.push(
                  firstValueFrom(this.productService.get(dbShoppingCartProduct.id)
                    .pipe(
                      map(product => ({ ...product, count: dbShoppingCartProduct.count }))
                    )
                  )
                )
              })

              return Promise.all(promises);
            })
          )
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
      });
  }

  ngOnDestroy(): void {
    if (this.tableSumSubscription)
      this.tableSumSubscription.unsubscribe();
    if (this.idSubscription)
      this.idSubscription.unsubscribe();
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }
}
