import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCartButtonComponent } from './product-cart-button.component';

describe('ProductCartButtonComponent', () => {
  let component: ProductCartButtonComponent;
  let fixture: ComponentFixture<ProductCartButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductCartButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCartButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
