import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { combineLatest, Subscription } from 'rxjs';
import { CategoryService } from 'src/app/services/database/category.service';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';
import { DbProduct } from './../../model/db-product';
import { ResolvedShoppingCartProduct, ResolvedShoppingCartProducts } from './../../model/shopping-cart';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass']
})
export class ShoppingCartComponent implements AfterViewInit, OnDestroy {

  /** Be aware, that this number contains rounding errors, so do NOT use this directly without
   * conversion to the precision you need! */
  totalPrice: number = 0;

  displayedColumns: string[] = ['name', 'category', 'price', 'count', 'total'];
  dataSource = new MatTableDataSource<ResolvedShoppingCartProduct>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private shoppingCartSubscription?: Subscription;

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

    this.shoppingCartSubscription = combineLatest([
      this.productService.getAll(),
      this.shoppingCartProducts$
    ])
      .subscribe(([products, shoppingCartProducts]) => {

        let productArray: ResolvedShoppingCartProduct[] = [];

        shoppingCartProducts.productMap.forEach((shoppingCartProduct, id) => {
          let product = products.find(item => item.id === id);
          if (product)
            productArray.push(new ResolvedShoppingCartProduct(shoppingCartProduct.count, product));
        });

        let resolved = new ResolvedShoppingCartProducts(productArray);

        this.totalPrice = resolved.getShoppingCartTotal();

        this.dataSource.data = [...resolved.productArray];
        this.table.renderRows();
      });

  }

  ngOnDestroy(): void {
    if (this.shoppingCartSubscription)
      this.shoppingCartSubscription.unsubscribe();
  }

  get shoppingCart$() {
    return this.shoppingCartHandlerService.shoppingCart$;
  }

  get shoppingCartProducts$() {
    return this.shoppingCartHandlerService.shoppingCartProducts$;
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }

}
