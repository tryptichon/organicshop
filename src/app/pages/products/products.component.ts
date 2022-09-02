import { DialogHandler } from './../../app-components/dialogs/DialogHandler';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Subscription, switchMap } from 'rxjs';
import { DbProduct } from './../../model/db-product';
import { CategoryService } from './../../services/database/category.service';
import { ProductService } from './../../services/database/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.sass']
})
export class ProductsComponent implements OnInit, OnDestroy {

  private _selectedCategory: string | null = null;

  filteredProducts: DbProduct[] = [];

  productSubscription?: Subscription

  constructor(
    private activatedRoute: ActivatedRoute,
    public categoryService: CategoryService,
    private productService: ProductService,
    private dialogs: DialogHandler,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.productSubscription = this.activatedRoute.queryParamMap
      .pipe(
        switchMap((params) => {
          this.selectedCategory = params.get('category');
          return this.productService.getAll();
        }),
        catchError(error => {
          this.dialogs.error({ title: "Product Service Error", message: error });
          return of(null);
        })
      )
      .subscribe(products => {
        if (!products)
          return;

        this.filteredProducts = products.filter(product =>
          (this.selectedCategory) ? (product.category === this.selectedCategory) : true
        )
      });
  }

  ngOnDestroy(): void {
    if (this.productSubscription)
      this.productSubscription.unsubscribe();
  }

  get selectedCategory(): string | null {
    return this._selectedCategory;
  }

  set selectedCategory(category: string | null) {
    this._selectedCategory = category;
    this.router.navigate(['.'], { relativeTo: this.activatedRoute, queryParams: { 'category': category } });
  }

}
