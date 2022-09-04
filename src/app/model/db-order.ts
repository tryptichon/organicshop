import { DbShoppingCartProduct } from './db-shopping-cart';
import { DbEntry } from './db-entry';


export interface DbOrderProduct extends DbShoppingCartProduct {
  name: string;
  price: number;
}

export interface DbShippingAddress {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  state: string;
}

export interface DbOrder extends DbEntry {
  userId: string;
  shoppingCartId: string;
  dateOrdered: number;
  totalPrice: number;
  shippingAddress: DbShippingAddress;
  products: DbOrderProduct[];
}
