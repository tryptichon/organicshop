import { DbShoppingCartProduct } from "./db-shopping-cart";
import { ShoppingCartProduct } from "./shopping-cart";

/**
 * This contains a map of ShoppingCartProduct and methods
 * to summarize product count.
 */
export class ShoppingCartProducts {
  /** Map of <productId, ShoppingCartProduct> in cart. */
  productMap = new Map<string, ShoppingCartProduct>();

  constructor(
    dbShoppingCartProducts: DbShoppingCartProduct[]
  ) {
    this.productMap = dbShoppingCartProducts.reduce((prev, current) =>
      prev.set(current.id, { count: current.count }),
      new Map<string, ShoppingCartProduct>()
    );
  }

  get totalQuantity(): number {
    let sum = 0;
    this.productMap.forEach((item) => sum += item.count);
    return sum;
  }

  getShoppingCartProductQuantity(productId: string): number {
    return this.productMap.get(productId)?.count || 0;
  }

}
