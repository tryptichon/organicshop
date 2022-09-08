import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { combineLatest, Subscription } from 'rxjs';
import { ResolvedShoppingCartProduct, ResolvedShoppingCartProducts } from 'src/app/model/resolved-shopping-cart-products';
import { CategoryService } from 'src/app/services/database/category.service';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';
import { DialogHandler } from './../../app-components/dialogs/DialogHandler';
import { DbProduct } from './../../model/db-product';
import { LoginService } from './../../services/auth/login.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.sass']
})
export class ShoppingCartComponent implements AfterViewInit, OnDestroy {

  /** Be aware, that this number contains rounding errors, so do NOT use this directly without
   * conversion to the precision you need! */
  totalPrice: number = 0;
  totalQuantity: number = 0;

  productTotals = new Map<string, number>();

  dateCreated: number | null = null;

  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'count', 'total'];
  dataSource = new MatTableDataSource<ResolvedShoppingCartProduct>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private shoppingCartSubscription?: Subscription;

  constructor(
    public loginService: LoginService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private shoppingCartService: ShoppingCartService,
    private dialogs: DialogHandler
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
          if (product) {
            let resolved = new ResolvedShoppingCartProduct(shoppingCartProduct.count, product);
            this.productTotals.set(id, resolved.totalPrice);
            productArray.push(resolved);
          }
        });

        let resolved = new ResolvedShoppingCartProducts(productArray);

        this.totalPrice = resolved.totalPrice;
        this.totalQuantity = resolved.totalQuantity;

        // Only redraw the table when the amount of products within change
        // to reduce flickering. Since parts of the table change nevertheless,
        // this data is in its own fields (productTotals, totalCount,
        // totalPrice)
        if (this.dataSource.data.length != resolved.productArray.length) {
          this.dataSource.data = [...resolved.productArray];
          this.table.renderRows();
        }
      });

  }

  ngOnDestroy(): void {
    if (this.shoppingCartSubscription)
      this.shoppingCartSubscription.unsubscribe();
  }

  get shoppingCart$() {
    return this.shoppingCartService.shoppingCart$;
  }

  get shoppingCartProducts$() {
    return this.shoppingCartService.shoppingCartProducts$;
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }

  onConfirmDelete() {
    this.dialogs
      .confirm({
        title: 'Delete Shopping Cart?',
        message: 'Do you want to delete your Shopping Cart?',
        icon: 'warning'
      })
      .subscribe(result => {
        if (result === 'Ok')
          this.onDeleteShoppingCart();
      });
  }

  onDeleteShoppingCart() {
    this.shoppingCartService.deleteShoppingCart();
  }

}
