import { DialogHandler } from './../../../app-components/dialogs/DialogHandler';
import { CategoryService } from './../../../services/database/category.service';

import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { catchError, of, Subscription } from 'rxjs';

import { DbProduct } from './../../../model/db-product';
import { ProductService } from './../../../services/database/product.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.sass']
})
export class AdminProductsComponent implements AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['name', 'category', 'price', 'action'];
  dataSource = new MatTableDataSource<DbProduct>;

  id?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DbProduct>;

  private productSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialogs: DialogHandler
  ) {
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.productSubscription = this.productService.getAll()
      .pipe(
        catchError(error => {
          this.dialogs.error({ title: "Product Service Error", message: error });
          return of(null);
        })
      )
      .subscribe(productArray => {
        if (!productArray)
          return;

        this.dataSource.data = [...productArray];
        // this.table.renderRows();
      });
  }

  ngOnDestroy(): void {
    if (this.productSubscription)
      this.productSubscription.unsubscribe();
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }

  applyFilter($event: KeyboardEvent) {
    const filterValue = ($event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate =
      (product: DbProduct, filter: string) =>
        this.filterMatch(product.name, filter) ||
        this.filterMatch(product.category, filter);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private filterMatch(value: string, filter: string): boolean {
    return value.toLowerCase().indexOf(filter) >= 0;
  };

}
