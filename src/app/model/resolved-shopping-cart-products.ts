import { DbShoppingCart, DbShoppingCartProduct } from 'src/app/model/db-shopping-cart';
import { ShoppingCartService } from '../services/database/shopping-cart.service';
import { DbProduct } from "./db-product";

/**
 * Contains data of products from a shopping cart enriched
 * by the data of the products themselves (like name, price etc.).
 */
export class ResolvedShoppingCartProduct implements DbProduct, DbShoppingCartProduct {
  name!: string;
  price!: number;
  category!: string;
  imageUrl!: string;
  id!: string;

  constructor(
    public count: number,
    dbProduct: DbProduct
  ) {
    Object.assign(this, dbProduct);
  }

  get totalPrice(): number {
    return this.price * this.count;
  }

}

/**
 * Only contains a map of products with counters and some
 * calculation methods.
 */
export class ShoppingCartProducts {
  private _productMap = new Map<string, DbShoppingCartProduct>();
  public get productMap() {
    return this._productMap;
  }

  constructor(products?: DbShoppingCartProduct[]) {
    if (products)
      products.forEach(product => this._productMap.set(product.id, product));
  }

  get productArray() {
    return Array.from(this.productMap.values());
  }

  get totalQuantity(): number {
    let result = 0;
    this.productMap.forEach(item => result += this.getProductTotalSize(item.id) || 0);
    return result;
  }

  get disctinctProducts() {
    return this.productMap.size;
  }

  getProductTotalSize(productId: string): number | undefined {
    return this.productMap.get(productId)?.count;
  }
}

/**
 * Simple wrapper class to provide methods for
 * calculations across all products.
 */
export class ResolvedShoppingCart extends ShoppingCartProducts implements DbShoppingCart {
  public dateCreated: number | null;
  public id: string;

  constructor(products?: ResolvedShoppingCartProduct[], id?: string) {
    super(products);
    this.id = id ? id : ShoppingCartService.getUniqueId();
    this.dateCreated = new Date().getTime();
  }

  put(product: ResolvedShoppingCartProduct) {
    this.productMap.set(product.id, product);
  }

  override get productMap() {
    return super.productMap as Map<string, ResolvedShoppingCartProduct>;
  }

  override get productArray() {
    return super.productArray as ResolvedShoppingCartProduct[];
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

