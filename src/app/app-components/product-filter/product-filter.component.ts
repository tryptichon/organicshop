import { DialogHandler } from './../dialogs/DialogHandler';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { EMPTY, Observable, catchError, of } from 'rxjs';
import { DbCategory } from 'src/app/model/db-category';
import { CategoryService } from 'src/app/services/database/category.service';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.sass']
})
export class ProductFilterComponent implements OnInit {

  categories$: Observable<DbCategory[] | null> = EMPTY;

  @Input() selected: string | null = null;

  @Output() selectedChange = new EventEmitter<string>();

  constructor(
    private categoryService: CategoryService,
    private dialogs: DialogHandler
  ) {
  }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getAll()
      .pipe(
        catchError(error => {
          this.dialogs.error({ title: "Category Service Error", message: error });
          return of(null);
        })
      );
  }

  setSelectedCategory($event: MatSelectionListChange) {
    this.selectedChange.emit($event.options[0]?.value);
  }

}
