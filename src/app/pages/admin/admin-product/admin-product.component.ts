import { ProductCardComponent } from './../../../app-components/product-card/product-card.component';
import { getLocaleCurrencySymbol } from '@angular/common';
import { Component, Inject, LOCALE_ID, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { uuidv4 as uuid } from "@firebase/util";
import { filter, map, Observable, Subject, takeUntil, switchMap, catchError, EMPTY, of, lastValueFrom } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


import { DbCategory } from './../../../model/db-category';
import { DbProduct } from './../../../model/db-product';
import { CategoryService } from './../../../services/database/category.service';
import { ProductService } from './../../../services/database/product.service';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.sass']
})
export class AdminProductComponent implements OnInit, OnDestroy {

  categories$: Observable<DbCategory[]>;
  id$: Observable<string> = EMPTY;

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

  private destroyed$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public locale_id: string
  ) {
    this.categories$ = this.categoryService.getAll()
      .pipe(
        takeUntil(this.destroyed$)
      );
  }

  ngOnInit(): void {

    this.id$ = this.route.params
      .pipe(
        map(params => params['id']),
        filter(id => (id && id != 'new'))
      );

    this.id$
      .subscribe(id => this.id = id);

    this.id$
      .pipe(
        switchMap(id => this.productService.get(id)),
        catchError(error => {
          alert(JSON.stringify(error));
          return EMPTY;
        })
      )
      .subscribe(dbProduct => {
        if (!dbProduct)
          return;

        this.nameControl.setValue(dbProduct.name);
        this.priceControl.setValue(dbProduct.price);
        this.categoryControl.setValue(dbProduct.category);
        this.imageControl.setValue(dbProduct.imageUrl ? new URL(dbProduct.imageUrl) : null);
      });

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  async onSubmit() {
    try {
      await this.productService.create(this.createProductFromForm());
      await this.router.navigate(['/admin', 'products']);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  getCategory(id: string | null) {
    return id ? this.categoryService.get(id) : EMPTY;
  }

  getCurrencySymbol() {
    return getLocaleCurrencySymbol(this.locale_id);
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
