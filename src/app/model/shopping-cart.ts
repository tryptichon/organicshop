import { DbShoppingCart, DbShoppingCartProduct } from 'src/app/model/db-shopping-cart';
import { DbProduct } from "./db-product";

/**
 * Merges data of DbShoppingCartProducts with the data of the DbProduct.
 */
export class ShoppingCartProduct implements DbProduct, DbShoppingCartProduct {
  name!: string;
  price!: number;
  category!: string;
  imageUrl!: string;
  id!: string;
  count!: number;

  constructor(
    dbShoppingCartProduct: DbShoppingCartProduct,
    dbProduct: DbProduct
  ) {
    Object.assign(this, dbProduct);
    Object.assign(this, dbShoppingCartProduct);
  }

  get totalPrice(): number {
    return this.price * this.count;
  }

}

/**
 * Only contains a map of DbShoppingCartProductsand some
 * calculation methods.
 * This class is used to separate the data of the ShoppingCart from
 * the data of the ShoppingCartProducts within.
 */
export class ShoppingCartProducts<T extends DbShoppingCartProduct> {
  public productMap = new Map<string, T>();

  constructor(products?: T[]) {
    if (products)
      products.forEach(product => this.productMap.set(product.id, product));
  }

  get productArray() {
    return Array.from(this.productMap.values());
  }

  put(product: T) {
    this.productMap.set(product.id, product);
  }

  /**
   * Get the total quantity of all products within the Shopping Cart.
   */
  get totalQuantity(): number {
    let result = 0;
    this.productMap.forEach(item => result += this.getProductQuantity(item.id) || 0);
    return result;
  }

  /** The amount of distinct products within the Shopping Cart. */
  get disctinctProducts() {
    return this.productMap.size;
  }

  /**
   * The quantity of a single product within the Shopping Cart.
   *
   * @param productId Id of the product in question.
   * @returns Quantity of the product in the Shopping Cart or undefined
   *          if the product cannot be found.
   */
  getProductQuantity(productId: string): number | undefined {
    return this.productMap.get(productId)?.count;
  }
}

/**
 * Fully resolved shopping cart containing all relevant data.
 */
export class ShoppingCart extends ShoppingCartProducts<ShoppingCartProduct> implements DbShoppingCart {
  public dateCreated!: number;
  public id!: string;

  constructor(
    id: string,
    products?: ShoppingCartProduct[]
  ) {
    super(products);
    Object.assign(this, new DbShoppingCart(id));
  }

  get totalPrice(): number {
    let result = 0;
    this.productMap.forEach(item => result += this.getProductTotalPrice(item.id) || 0);
    return result;
  }

  getProductTotalPrice(productId: string): number | undefined {
    return this.productMap.get(productId)?.totalPrice;
  }

}

