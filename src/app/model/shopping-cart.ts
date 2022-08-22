import { DbEntry } from "./db-entry";

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
 * This is the fully resolved shopping cart.
 */
export interface ShoppingCart extends ShoppingCartData {
  /** Pair of <productId, items in cart>. */
  products: { [key: string]: ShoppingCartProduct }
}

/**
 * Database model for a shopping cart entry.
 */
export interface DbShoppingCart extends ShoppingCartData, DbEntry {
  /** Array of ids of assigned shopping cart products. */
  products: string[]
}

/**
 * Database model for products within a shopping cart.
 */
export interface DbShoppingCartProduct extends ShoppingCartProduct, DbEntry {
  shoppingCartId: string
}

