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
 * Simple wrapper class to provide a method to
 * calculate the total price across all products.
 */
export class ResolvedShoppingCartProducts {

  productArray: ResolvedShoppingCartProduct[];

  constructor(
    resolvedhoppingCartProducts: ResolvedShoppingCartProduct[]
  ) {
    this.productArray = resolvedhoppingCartProducts;
  }

  get totalPrice(): number {
    return this.productArray.reduce((prev, current) => prev += current.totalPrice, 0);
  }

  get totalQuantity(): number {
    return this.productArray.reduce((prev, current) => prev += current.count, 0);
  }
}

