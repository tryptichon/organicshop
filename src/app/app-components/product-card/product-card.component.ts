import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() imageUrl?: string | null;
  @Input() id?: string | null;
  @Input() idButtonLabel?: string | null;

  @Output() buttonClick = new EventEmitter<string>();

  constructor(
    private categoryService: CategoryService
  ) {
  }

  getCategoryName() {
    return this.categoryService.getCategoryName(this.category);
  }

  onButtonClick() {
    if (this.id)
      this.buttonClick.emit(this.id);
  }
}
