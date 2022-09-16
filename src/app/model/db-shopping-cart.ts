import { DbEntry } from "./db-entry";

/**
 * Database model for a shopping cart entry.
 */
export interface DbShoppingCart extends DbEntry {
  dateCreated: number;
}

/**
 * Database model for products within a shopping cart.
 */
export interface DbShoppingCartProduct extends DbEntry {
  count: number
}
