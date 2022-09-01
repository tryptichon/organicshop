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
 * This is the shopping cart with product counters.
 */
export class ShoppingCart implements DbShoppingCart {
  id: string;
  dateCreated: number | null;
  dateOrdered: number | null;
  userId: string | null;

  /** Map of <productId, ShoppingCartProduct> in cart. */
  products: Map<string, ShoppingCartProduct> = new Map<string, ShoppingCartProduct>();

  constructor(
    dbShoppingCart: DbShoppingCart,
    dbShoppingCartProducts: DbShoppingCartProduct[]
  ) {
    this.id = dbShoppingCart.id;
    this.dateCreated = dbShoppingCart.dateCreated;
    this.dateOrdered = dbShoppingCart.dateOrdered;
    this.userId = dbShoppingCart.userId;

    this.products = dbShoppingCartProducts.reduce((prev, current) =>
      prev.set(current.id, { count: current.count }),
      new Map<string, ShoppingCartProduct>()
    );
  }

  getShoppingCartCount(): number {
    let sum = 0;
    this.products.forEach((item) => sum += item.count);
    return sum;
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

