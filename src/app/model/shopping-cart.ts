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

