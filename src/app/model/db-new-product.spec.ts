import { NewProduct } from './db-new-product';

describe('DbProductImpl', () => {
  it('should create an instance', () => {
    expect(new NewProduct('name', 0, 'category')).toBeTruthy();
  });
});
