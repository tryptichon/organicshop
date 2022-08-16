import { ConfirmDialogComponent } from './../../../app-components/dialogs/confirm-dialog/confirm-dialog.component';
import { getLocaleCurrencySymbol } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { uuidv4 as uuid } from "@firebase/util";
import { catchError, EMPTY, filter, map, switchMap, tap } from 'rxjs';


import { DbProduct } from './../../../model/db-product';
import { CategoryService } from './../../../services/database/category.service';
import { ProductService } from './../../../services/database/product.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.sass']
})
export class AdminProductComponent implements OnInit {

  id: string = 'new';

  nameControl = new FormControl<string | null>(null, [Validators.required]);
  priceControl = new FormControl<number | null>(null, [Validators.required]);
  categoryControl = new FormControl<string | null>(null, [Validators.required]);
  imageControl = new FormControl<URL | null>(null, [Validators.pattern('^[a-zA-Z0-9+\\.-]+://\\S*')]);

  form = new FormGroup({
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
    private confirmDialog: MatDialog,
    @Inject(LOCALE_ID) public locale_id: string
  ) {
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        map(params => params['id']),
        filter(id => (id && id != 'new')),
        tap(id => this.id = id),
        switchMap(id => this.productService.get(id)),
        catchError(error => {
          alert(JSON.stringify(error));
          return EMPTY;
        })
      )
      .subscribe(dbProduct => {
        if (!dbProduct)
          return;

        this.form.setValue(
          {
            name: dbProduct.name,
            price: dbProduct.price,
            category: dbProduct.category,
            imageUrl: dbProduct.imageUrl ? new URL(dbProduct.imageUrl) : null
          }
        );
      });
  }

  async onSubmit() {
    try {
      await this.productService.create(this.createProductFromForm());
      await this.router.navigate(['/admin', 'products']);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  onConfirmDelete() {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete product?', message: 'Do you want to delete product ' + this.nameControl.value + '?', icon: 'warning' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Ok')
        this.onDelete();
    })
  }

  async onDelete() {
    try {
      await this.productService.delete(this.id);
      await this.router.navigate(['/admin', 'products']);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  getCurrencySymbol() {
    return getLocaleCurrencySymbol(this.locale_id);
  }

  getCategories() {
    return this.categoryService.getCachedCategories().sort((a,b) => a.name.localeCompare(b.name));
  }

  isNew(): boolean {
    return (this.id === 'new');
  }

  /**
   * @returns Map with data matching interface DbProduct.
   */
  public createProductFromForm(): DbProduct {
    let formData = this.form.value;

    if (!formData.name || formData.price == undefined || !formData.category)
      throw new Error("Data is missing");

    this.id = this.isNew() ? uuid() : this.id;

    let newProduct: DbProduct = {
      id: this.id,
      name: formData.name,
      price: formData.price,
      category: formData.category,
      imageUrl: formData.imageUrl?.toString()
    }

    return newProduct;
  }

}
