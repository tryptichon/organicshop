import { DbEntry } from "./db-entry";

/**
 * Database model for a shopping cart entry.
 */
export interface DbShoppingCart extends DbEntry {
  /** This is UTC in ms. */
  dateCreated: number | null,
}

/**
 * Database model for products within a shopping cart.
 */
export interface DbShoppingCartProduct extends DbEntry {
  count: number
}

