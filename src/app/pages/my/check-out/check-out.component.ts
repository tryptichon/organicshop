import { Shipping } from './../../../model/order';
import { LoginService } from './../../../services/auth/login.service';
import { OrderService } from './../../../services/database/order.service';
import { DbShipping, DbOrderProduct, DbOrder } from './../../../model/db-order';
import { ProductService } from 'src/app/services/database/product.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { ResolvedShoppingCartProduct, ResolvedShoppingCartProducts } from 'src/app/model/resolved-shopping-cart-products';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DbProduct } from 'src/app/model/db-product';
import { Router } from '@angular/router';
import { Order } from 'src/app/model/order';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.sass']
})
export class CheckOutComponent implements AfterViewInit {

  nameControl = new FormControl<string | null>(null, [Validators.required]);
  addressControl = new FormControl<string | null>(null, [Validators.required]);
  zipCodeControl = new FormControl<string | null>(null, [Validators.required]);
  cityControl = new FormControl<string | null>(null, [Validators.required]);
  stateControl = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    name: this.nameControl,
    address: this.addressControl,
    zipCode: this.zipCodeControl,
    city: this.cityControl,
    state: this.stateControl
  });

  displayedColumns: string[] = ['items', 'total'];
  dataSource = new MatTableDataSource<ResolvedShoppingCartProduct>;

  shoppingCartProducts?: ResolvedShoppingCartProducts;

  get totalPrice() {
    return this.shoppingCartProducts?.totalPrice;
  };

  get totalCount() {
    return this.shoppingCartProducts?.totalQuantity;
  }

  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private shoppingCartSubscription?: Subscription;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private productService: ProductService,
    private orderService: OrderService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    this.shoppingCartSubscription = combineLatest([
      this.productService.getAll(),
      this.shoppingCartProducts$
    ])
      .subscribe(([products, shoppingCartProducts]) => {
        this.shoppingCartProducts = new ResolvedShoppingCartProducts();

        shoppingCartProducts.productMap.forEach((shoppingCartProduct, id) => {
          let product = products.find(item => item.id === id);
          if (product)
            this.shoppingCartProducts?.put(new ResolvedShoppingCartProduct(shoppingCartProduct.count, product));
        });

        this.dataSource.data = [...this.shoppingCartProducts.productArray];
        this.table.renderRows();
      });
  }

  get shoppingCartProducts$() {
    return this.shoppingCartService.shoppingCartProducts$;
  }

  async onOrder() {
    if (!this.shoppingCartProducts)
      return;

    let formData = this.form.value;
    let userId = this.loginService.user?.id;

    if (!userId)
      throw Error("No logged in user");

    let order = new Order(
      this.orderService.getUniqueId(),
      userId,
      this.shoppingCartService.shoppingCartId,
      new Shipping(formData),
      this.shoppingCartProducts
    );

    await this.orderService.createOrderAndClearShoppingCart(order);

    this.router.navigate(['/my', 'order-success', order.id]);
  }

}
