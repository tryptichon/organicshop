import { DbEntry } from "./db-entry";
import { DbProduct } from "./db-product";

/**
 * The basic datastructure for a shopping cart without
 * its database id.
 */
export interface ShoppingCartData {
  /** This is UTC in ms. */
  dateCreated: number | null,
}

/**
 * The basic datastructure for a shopping cart product without
 * its database id.
 */
export interface ShoppingCartProduct {
  count: number
}

export class ShoppingCartIds implements DbEntry {

  constructor(
    public id: string,
    public productIds: string[]
  ) { }

}

