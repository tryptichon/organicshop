import { DbCategory } from './../../../model/db-category';
import { CategoryService } from './../../../services/database/category.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.sass']
})
export class AdminProductsComponent {

  categories: Observable<DbCategory[]>;

  nameControl = new FormControl<string | null>(null, [Validators.required]);
  priceControl = new FormControl<number | null>(null, [Validators.required]);
  categoryControl = new FormControl<DbCategory | null>(null, [Validators.required]);
  imageControl = new FormControl<URL | null>(null, [Validators.pattern('^\\S+://\\S*')]);

  form = new FormGroup({
    name: this.nameControl,
    price: this.priceControl,
    categories: this.categoryControl,
    imageUrl: this.imageControl
  });

  constructor(
    private categoryService: CategoryService
  ) {
    this.categories = this.categoryService.getAll();
  }

}
