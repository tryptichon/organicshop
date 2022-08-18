import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { DbCategory } from 'src/app/model/db-category';
import { CategoryService } from 'src/app/services/database/category.service';
import { MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.sass']
})
export class ProductFilterComponent {

  categories$: Observable<DbCategory[]> = EMPTY;

  @Input() selected: string | null = null;

  @Output() selectedChange = new EventEmitter<string>();

  constructor(
    private categoryService: CategoryService
  ) {
    this.categories$ = this.categoryService.getDocuments$();
  }

  setSelectedCategory($event: MatSelectionListChange) {
    this.selectedChange.emit($event.options[0]?.value);
  }

}
