import { LoginService } from './../../../services/auth/login.service';
import { OrderService } from './../../../services/database/order.service';
import { DbShippingAddress, DbOrderProduct, DbOrder } from './../../../model/db-order';
import { ProductService } from 'src/app/services/database/product.service';
import { ShoppingCartHandlerService } from 'src/app/services/shopping-cart-handler.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { ResolvedShoppingCartProduct, ResolvedShoppingCartProducts } from 'src/app/model/resolved-shopping-cart-products';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DbProduct } from 'src/app/model/db-product';
import { Router } from '@angular/router';

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

  totalPrice: number = 0;
  totalCount: number = 0;

  shoppingCartProducts?: ResolvedShoppingCartProducts;

  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private shoppingCartSubscription?: Subscription;

  constructor(
    private shoppingCartHandlerService: ShoppingCartHandlerService,
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
        let productArray: ResolvedShoppingCartProduct[] = [];

        shoppingCartProducts.productMap.forEach((shoppingCartProduct, id) => {
          let product = products.find(item => item.id === id);
          if (product)
            productArray.push(new ResolvedShoppingCartProduct(shoppingCartProduct.count, product));
        });

        this.shoppingCartProducts = new ResolvedShoppingCartProducts(productArray);

        this.totalPrice = this.shoppingCartProducts.totalPrice;
        this.totalCount = this.shoppingCartProducts.totalQuantity;

        this.dataSource.data = [...this.shoppingCartProducts.productArray];
        this.table.renderRows();
      });
  }

  get shoppingCartProducts$() {
    return this.shoppingCartHandlerService.shoppingCartProducts$;
  }

  async onOrder() {
    if (!this.shoppingCartProducts)
      return;

    let formData = this.form.value;
    let userId = this.loginService.user?.id;

    if (!userId)
      throw Error("No logged in user");

    if (!formData.name || !formData.address || !formData.zipCode || !formData.city || !formData.state)
      throw Error('Fields are missing');

    let orderId = this.orderService.getUniqueId();

    let shippingAddress: DbShippingAddress = {
      name: formData.name,
      address: formData.address,
      zipCode: formData.zipCode,
      city: formData.city,
      state: formData.state
    }

    let products: DbOrderProduct[] = this.shoppingCartProducts.productArray.map(entry => ({
      id: entry.id,
      name: entry.name,
      price: entry.price,
      count: entry.count
    }));

    let order: DbOrder = {
      id: orderId,
      userId: userId,
      shoppingCartId: this.shoppingCartHandlerService.shoppingCartId,
      dateOrdered: new Date().getTime(),
      totalPrice: this.totalPrice,
      shippingAddress: shippingAddress,
      products: products
    }

    await this.orderService.create(order);
    await this.shoppingCartHandlerService.deleteShoppingCart();

    this.form.reset();

    this.router.navigate(['/my', 'order-success', orderId]);
  }

}
