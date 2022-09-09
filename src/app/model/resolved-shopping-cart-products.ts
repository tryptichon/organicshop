import { DbProduct } from "./db-product";

/**
 * Contains data of products from a shopping cart enriched
 * by the data of the products themselves (like name, price etc.).
 */
export class ResolvedShoppingCartProduct implements DbProduct {
  name!: string;
  price!: number;
  category!: string;
  imageUrl!: string;
  id!: string;

  constructor(
    public count: number,
    dbProduct: DbProduct
  ) {
    Object.assign(this, dbProduct);
  }

  get totalPrice(): number {
    return this.price * this.count;
  }

}

/**
 * Simple wrapper class to provide methods for
 * calculations across all products.
 */
export class ResolvedShoppingCartProducts {

  private products = new Map<string, ResolvedShoppingCartProduct>();

  put(product: ResolvedShoppingCartProduct) {
    this.products.set(product.id, product);
  }

  get productArray() {
    return Array.from(this.products.values());
  }

  get totalPrice(): number {
    let result = 0;
    this.products.forEach(item => result += item.totalPrice);
    return result;
  }

  get totalQuantity(): number {
    let result = 0;
    this.products.forEach(item => result += item.count);
    return result;
  }

  getProductTotalPrice(productId: string) {
    return this.products.get(productId)?.totalPrice;
  }

  get size() {
    return this.products.size;
  }

}

