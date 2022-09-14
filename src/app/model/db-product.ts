import { DbEntry } from './db-entry';

export interface DbProduct extends DbEntry {
  name: string,
  price: number,
  category: string,
  imageUrl: string
}

export class Product implements DbProduct {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public category: string,
    public imageUrl: string
  ) { }
}
