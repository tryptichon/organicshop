import { DbOrder, DbOrderProduct, DbShipping } from "./db-order";
import { ShoppingCart } from "./shopping-cart";

export class Order implements DbOrder {
  dateOrdered: number;
  totalPrice: number;
  shoppingCartId: string;
  products: DbOrderProduct[];
  shipping: DbShipping;

  constructor(
    public id: string,
    public userId: string,
    shipping: DbShipping,
    shoppingCart: ShoppingCart
  ) {
    this.dateOrdered = new Date().getTime();
    this.totalPrice = shoppingCart.totalPrice;
    this.shoppingCartId = shoppingCart.id;
    this.products = shoppingCart.productArray.map(entry => ({
      id: entry.id,
      name: entry.name,
      price: entry.price,
      count: entry.count
    }));
    this.shipping = { ...shipping };
  }

}
