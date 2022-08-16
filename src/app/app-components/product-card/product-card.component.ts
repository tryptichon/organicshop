import { Component, Input } from '@angular/core';
import { CategoryService } from './../../services/database/category.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.sass']
})
export class ProductCardComponent {

  @Input() name?: string | null;
  @Input() price?: number | null;
  @Input() category?: string | null;
  @Input() imageUrl?: URL | null;

  constructor(
    private categoryService: CategoryService
  ) {
  }

  getCategoryName() {
    return this.categoryService.getCategoryName(this.category);
  }

}
