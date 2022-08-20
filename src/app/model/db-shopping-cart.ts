import { DbEntry } from './db-entry';
export interface DbShoppingCart extends DbEntry {
  /** This is UTC in ms. */
  dateCreated: number | null,
  /** This is UTC in ms. */
  dateOrdered: number | null,
  /** This is null when no user is associated with this shopping cart. */
  userId: string | null,
  /** Pair of <productId, items in cart>.
      No products is just an empty object.
      Not undefined, not null. */
  products: { [key: string]: number }
}
