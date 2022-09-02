import { DbEntry } from "./db-entry";
import { DbProduct } from "./db-product";

/**
 * The basic datastructure for a shopping cart without
 * its database id.
 */
export interface ShoppingCartData {
  /** This is UTC in ms. */
  dateCreated: number | null,
  /** This is UTC in ms. */
  dateOrdered: number | null,
  /** This is null when no user is associated with this shopping cart. */
  userId: string | null,
}

/**
 * The basic datastructure for a shopping cart product without
 * its database id.
 */
export interface ShoppingCartProduct {
  count: number
}

/**
 * Database model for a shopping cart entry.
 */
export interface DbShoppingCart extends ShoppingCartData, DbEntry {
}

/**
 * Database model for products within a shopping cart.
 */
export interface DbShoppingCartProduct extends ShoppingCartProduct, DbEntry {
}

/**
 * This contains product counters.
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

  getShoppingCartTotalCount(): number {
    let sum = 0;
    this.productMap.forEach((item) => sum += item.count);
    return sum;
  }

  getShoppingCartProductCount(productId: string): number {
    return this.productMap.get(productId)?.count || 0;
  }

}

export class ResolvedShoppingCartProduct implements DbProduct {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  id: string;
  count: number;

  constructor(count: number, dbProduct: DbProduct) {
    this.name = dbProduct.name;
    this.price = dbProduct.price;
    this.category = dbProduct.category;
    this.imageUrl = dbProduct.imageUrl;
    this.id = dbProduct.id;
    this.count = count;
  }

  getTotal(): number {
    return this.price * this.count;
  }

}

export class ResolvedShoppingCartProducts {

  productArray: ResolvedShoppingCartProduct[];

  constructor(
    resolvedhoppingCartProducts: ResolvedShoppingCartProduct[]
  ) {
    this.productArray = resolvedhoppingCartProducts;
  }

  getShoppingCartTotal(): number {
    return this.productArray.reduce((prev, current) => prev += current.getTotal(), 0);
  }
}

