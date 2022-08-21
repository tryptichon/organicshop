import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { filter, Subscription, Observable, map } from 'rxjs';
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
  private tableData: TableEntry[] = [];

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
    this.tableData$ = this.shoppingCartHandlerService.shoppingCart$
      .pipe(
        map(shoppingCart => {
          let shoppingCartProducts: TableEntry[] = [];

          if (shoppingCart) {
            Object.keys(shoppingCart.products).forEach(productId => {
              let product = this.productService.productCache.get(productId);
              if (product) {
                shoppingCartProducts.push({
                  ...product,
                  count: shoppingCart.products[productId]
                });
              }
            })
          }

          return shoppingCartProducts;
        })
      );
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.tableDataSubscription = this.tableData$.subscribe(tableArray => {
      this.tableData = tableArray;
      this.dataSource.data = [...this.tableData];
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

  getTotalPrice() : number | null {
    return this.tableData.map(t => t.price * t.count).reduce((sum, value) => sum + value, 0);
  }

  getTotalCount() : number | null {
    return this.tableData.map(t => t.count).reduce((sum, value) => sum + value, 0);
  }

}
