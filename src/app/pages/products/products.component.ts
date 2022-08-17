import { DbProduct } from './../../model/db-product';
import { EMPTY, Observable, Subscription, tap, switchMap, concatMap, concat, shareReplay } from 'rxjs';
import { DbCategory } from './../../model/db-category';
import { ProductService } from './../../services/database/product.service';
import { CategoryService } from './../../services/database/category.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { MatListOption, MatSelectionListChange } from '@angular/material/list';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.sass']
})
export class ProductsComponent implements OnInit, OnDestroy {

  categories$: Observable<DbCategory[]> = EMPTY;

  selectedCategory: string | null = null;

  filteredProducts: DbProduct[] = [];

  productSubscription?: Subscription

  constructor(
    private activatedRoute: ActivatedRoute,
    public categoryService: CategoryService,
    private productService: ProductService
  ) {
    this.categories$ = this.categoryService.getDocuments$();

    this.productSubscription = activatedRoute.queryParamMap
      .pipe(
        switchMap((params) => {
          this.selectedCategory = params.get('category');
          return this.productService.getDocuments$();
        }),
      )
      .subscribe(products =>
        this.filteredProducts = products.filter(product =>
          (this.selectedCategory) ? (product.category === this.selectedCategory) : true
        )
      );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.productSubscription)
      this.productSubscription.unsubscribe();
  }

}
