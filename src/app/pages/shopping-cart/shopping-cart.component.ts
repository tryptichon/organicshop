import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { map, Observable, Subscription, from, firstValueFrom, switchMap } from 'rxjs';
import { DbProduct } from 'src/app/model/db-product';
import { CategoryService } from 'src/app/services/database/category.service';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';

interface TableEntry extends DbProduct {
  count: number
}

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass']
})
export class ShoppingCartComponent implements OnInit, AfterViewInit, OnDestroy {

  private tableData$!: Observable<TableEntry[]>;

  /** Be aware, that this number contains rounding errors, so do NOT use this directly without
   * conversion to the precision you need! */
  totalPrice: number = 0;
  totalCount: number = 0;

  displayedColumns: string[] = ['name', 'category', 'price', 'count'];
  dataSource = new MatTableDataSource<TableEntry>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private tableDataSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private shoppingCartHandlerService: ShoppingCartHandlerService
  ) { }

  ngOnInit(): void {

    this.tableData$ = from(this.shoppingCartHandlerService.shoppingCartProductService.query('shoppingCartId', '==', this.shoppingCartHandlerService.shoppingCartId))
      .pipe(
        switchMap(products => {
          let promises: Promise<TableEntry>[] = [];

          products.forEach(productRef => {
            promises.push(
              firstValueFrom(this.productService.get(productRef.id)
                .pipe(
                  map(dbProduct => ({ ...dbProduct, count: productRef.data().count }))
                )
              )
            );
          });

          return Promise.all(promises);
        })
      );
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.tableDataSubscription = this.tableData$
      .subscribe(tableData => {
        this.totalCount = 0;
        this.totalPrice = 0;
        tableData.forEach(t => {
          this.totalCount += t.count;
          this.totalPrice += t.count * t.price;
        });

        this.dataSource.data = [...tableData];
        this.table.renderRows();
      })

  }

  ngOnDestroy(): void {
    if (this.tableDataSubscription)
      this.tableDataSubscription.unsubscribe();
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }

}
