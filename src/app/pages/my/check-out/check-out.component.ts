import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { DbProduct } from 'src/app/model/db-product';
import { Order } from 'src/app/model/order';
import { ResolvedShoppingCart, ResolvedShoppingCartProduct } from 'src/app/model/resolved-shopping-cart-products';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartService } from 'src/app/services/database/shopping-cart.service';
import { Shipping } from './../../../model/order';
import { LoginService } from './../../../services/auth/login.service';
import { OrderService } from './../../../services/database/order.service';

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

  shoppingCart?: ResolvedShoppingCart;

  get totalPrice() {
    return this.shoppingCart?.totalPrice;
  };

  get totalCount() {
    return this.shoppingCart?.totalQuantity;
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
        this.shoppingCart = new ResolvedShoppingCart();

        shoppingCartProducts.productMap.forEach((shoppingCartProduct, id) => {
          let product = products.find(item => item.id === id);
          if (product)
            this.shoppingCart?.put(new ResolvedShoppingCartProduct(shoppingCartProduct.count, product));
        });

        this.dataSource.data = [...this.shoppingCart.productArray as ResolvedShoppingCartProduct[]];
        this.table.renderRows();
      });
  }

  get shoppingCartProducts$() {
    return this.shoppingCartService.shoppingCartProducts$;
  }

  async onOrder() {
    if (!this.shoppingCart)
      return;

    let formData = this.form.value;
    let userId = this.loginService.user?.id;

    if (!userId)
      throw Error("No logged in user");

    let order = new Order(
      OrderService.getUniqueId(),
      userId,
      this.shoppingCartService.shoppingCartId,
      new Shipping(formData),
      this.shoppingCart
    );

    await this.orderService.createOrderAndClearShoppingCart(order);

    this.router.navigate(['/my', 'order-success', order.id]);
  }

}
