import { uuidv4 as uuid } from "@firebase/util";
import { Product } from "./db-product";

export class NewProduct implements Product {
  id: string = uuid();
  imageUrl: string | null = null;

  constructor(
    public name: string,
    public price: number,
    public category: string
  ) {
  }
}
