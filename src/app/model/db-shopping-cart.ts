import { DbEntry } from "./db-entry";

/**
 * Database model for a shopping cart entry.
 */
export class DbShoppingCart implements DbEntry {
  public dateCreated: number;

  constructor(
    public id: string,
  ) {
    /** This is UTC in ms. */
    this.dateCreated = new Date().getTime();
  }
}

/**
 * Database model for products within a shopping cart.
 */
export interface DbShoppingCartProduct extends DbEntry {
  count: number
}

