import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { combineLatest, Subscription } from 'rxjs';
import { ShoppingCart, ShoppingCartProduct } from 'src/app/model/shopping-cart';
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

  tableData?: ShoppingCart;

  dateCreated: number | null = null;

  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'count', 'total'];
  dataSource = new MatTableDataSource<ShoppingCartProduct>;

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
        this.tableData = new ShoppingCart(this.shoppingCartService.shoppingCartId);

        shoppingCartProducts.productMap.forEach((shoppingCartProduct, id) => {
          let product = products.find(item => item.id === id);
          if (product)
            this.tableData?.put(new ShoppingCartProduct(shoppingCartProduct, product));
        });

        // Only redraw the table when the amount of products within change
        // to reduce flickering.
        if (this.dataSource.data.length != this.tableData.disctinctProducts) {
          this.dataSource.data = [...this.tableData.productArray];
          this.table.renderRows();
        }
      });

  }

  ngOnDestroy(): void {
    if (this.shoppingCartSubscription)
      this.shoppingCartSubscription.unsubscribe();
  }

  get totalPrice() {
    return this.tableData?.totalPrice;
  }

  get totalQuantity() {
    return this.tableData?.totalQuantity;
  }

  getProductTotalPrice(productId: string) {
    return this.tableData?.getProductTotalPrice(productId);
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
