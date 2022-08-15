import { Observable, of, switchMap, EMPTY } from 'rxjs';
import { CategoryService } from './../../services/database/category.service';
import { DbCategory } from './../../model/db-category';
import { Component, Input, OnInit } from '@angular/core';
import { DbProduct } from './../../model/db-product';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.sass']
})
export class ProductCardComponent {

  @Input() name?: string | null;
  @Input() price?: number | null;
  @Input() imageUrl?: URL | null;

  categoryName$: Observable<string | null> = EMPTY;

  constructor(
    private categoryService: CategoryService
  ) {
  }

  @Input()
  set category(category: string | null) {
    if (!category)
      return;

    this.categoryName$ = this.categoryService.get(category)
      .pipe(
        switchMap(dbCategory => {
          return of(dbCategory.name);
        })
      );
  }


}
