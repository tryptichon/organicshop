import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { uuidv4 as uuid } from "@firebase/util";


import { DbCategory } from './../../../model/db-category';
import { DbProduct } from './../../../model/db-product';
import { CategoryService } from './../../../services/database/category.service';
import { ProductService } from './../../../services/database/product.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.sass']
})
export class AdminProductsComponent {

  categories: Observable<DbCategory[]>;
  products: Observable<DbProduct[]>;

  nameControl = new FormControl<string | null>(null, [Validators.required]);
  priceControl = new FormControl<number | null>(null, [Validators.required]);
  categoryControl = new FormControl<DbCategory | string | null>(null, [Validators.required]);
  imageControl = new FormControl<URL | null>(null, [Validators.pattern('^[a-zA-Z0-9+\\.-]+://\\S*')]);

  form = new FormGroup({
    name: this.nameControl,
    price: this.priceControl,
    category: this.categoryControl,
    imageUrl: this.imageControl
  });

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {
    this.categories = this.categoryService.getAll();
    this.products = this.productService.getAll();
  }

  saveProduct() {
    this.productService.create(this.createProductFromForm());
  }

  private createProductFromForm(): DbProduct {
    let formData = this.form.value;

    if (formData.name == null || formData.price == null || formData.category == null)
      throw new Error("Data is missing");

    let newProduct: DbProduct = {
      id: uuid(),
      name: formData.name,
      price: formData.price,
      category: formData.category as string,
      imageUrl: formData.imageUrl != null ? formData.imageUrl.toString() : undefined
    }

    return newProduct;
  }

}
