import { DbEntry } from "./db-entry";
import { ShoppingCartData, ShoppingCartProduct } from "./shopping-cart";

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
