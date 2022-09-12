import { DbOrder, DbOrderProduct, DbShipping as DbShipping } from "./db-order";
import { ResolvedShoppingCart } from "./resolved-shopping-cart-products";

export class Shipping implements DbShipping {
  name: string = '';
  address: string = '';
  zipCode: string = '';
  city: string = '';
  state: string = '';

  constructor(formData: Partial<{
    name: string | null,
    address: string | null,
    zipCode: string | null,
    city: string | null,
    state: string | null,
  }>
  ) {
    Object.entries(formData).forEach((key, value) => {
      if (value === null)
        throw Error('Key ' + key + ' must not be null');
    });

    Object.assign(this, formData);
  }

}

export class Order implements DbOrder {
  dateOrdered: number;
  totalPrice: number;
  products: DbOrderProduct[];
  shipping: DbShipping;

  constructor(
    public id: string,
    public userId: string,
    public shoppingCartId: string,
    shipping: Shipping,
    shoppingCartProducts: ResolvedShoppingCart
  ) {
    this.dateOrdered = new Date().getTime();
    this.totalPrice = shoppingCartProducts.totalPrice;
    this.products = shoppingCartProducts.productArray.map(entry => ({
      id: entry.id,
      name: entry.name,
      price: entry.price,
      count: entry.count
    }));
    this.shipping = { ...shipping };
  }

}
