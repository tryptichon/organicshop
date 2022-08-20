import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { DbProduct } from './../../model/db-product';
import { CategoryService } from './../../services/database/category.service';
import { ProductService } from './../../services/database/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.sass']
})
export class ProductsComponent implements OnDestroy {

  private _selectedCategory: string | null = null;

  filteredProducts: DbProduct[] = [];

  productSubscription?: Subscription

  constructor(
    private activatedRoute: ActivatedRoute,
    public categoryService: CategoryService,
    private productService: ProductService,
    private router: Router
  ) {
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
