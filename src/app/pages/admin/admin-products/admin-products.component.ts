import { CategoryService } from './../../../services/database/category.service';

import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';

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

  private destroyed$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.productService.getDocuments$()
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(productArray => {
        this.dataSource.data = [...productArray];
        this.table.renderRows();
      });
  }

  getCategoryName(id: string) {
    return this.categoryService.getCategoryName(id);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
