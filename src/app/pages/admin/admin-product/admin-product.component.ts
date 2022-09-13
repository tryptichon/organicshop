import { getLocaleCurrencySymbol } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, take } from 'rxjs';
import { DialogHandler } from './../../../app-components/dialogs/DialogHandler';

import { Product } from './../../../model/db-product';
import { CategoryService } from './../../../services/database/category.service';
import { ProductService } from './../../../services/database/product.service';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.sass']
})
export class AdminProductComponent implements OnInit {

  idControl = new FormControl<string | null>('new');
  nameControl = new FormControl<string | null>(null, [Validators.required]);
  priceControl = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  categoryControl = new FormControl<string | null>(null, [Validators.required]);
  imageControl = new FormControl<string | null>(null, [Validators.pattern('^[a-zA-Z0-9+\\.-]+://\\S*')]);

  form = new FormGroup({
    id: this.idControl,
    name: this.nameControl,
    price: this.priceControl,
    category: this.categoryControl,
    imageUrl: this.imageControl
  });

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogs: DialogHandler,
    @Inject(LOCALE_ID) public locale_id: string
  ) {
  }

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new')
      return;

    this.idControl.setValue(id);

    // Only take the product to edit from the database
    // once, therefore ignoring all further updates
    // that might happen in the backend.
    this.productService.get(id)
      .pipe(
        catchError(error => {
          this.dialogs.error({ title: 'Product Service Communication Error', message: error });
          return of(null);
        }),
        take(1)
      )
      .subscribe(dbProduct => {
        if (!dbProduct)
          return;

        this.form.setValue(dbProduct);
      });
  }

  getCategories() {
    return this.categoryService.getCachedCategories().sort((a, b) => a.name.localeCompare(b.name));
  }

  getCurrencySymbol() {
    return getLocaleCurrencySymbol(this.locale_id);
  }

  isNew(): boolean {
    return (this.idControl.value === 'new');
  }

  onConfirmDelete() {
    this.dialogs
      .confirm({
        title: 'Delete product?',
        message: 'Do you want to delete product ' + this.nameControl.value + '?',
        icon: 'warning'
      })
      .subscribe(result => {
        if (result === 'Ok')
          this.onDelete();
      });
  }

  async onSubmit() {
    try {
      await this.productService.create(new Product(this.form.value));
      await this.router.navigate(['/admin', 'products']);
    } catch (error) {
      this.dialogs.error({ title: 'On Submit Communication Error', message: error });
    }
  }

  async onDelete() {
    try {
      if (!this.idControl.value)
        return;

      await this.productService.removeProductFromAllCarts(this.idControl.value);
      await this.router.navigate(['/admin', 'products']);
    } catch (error) {
      this.dialogs.error({ title: 'On Delete Communication Error', message: error });
    }
  }

}
