import { DbEntry } from './db-entry';

export interface Product extends DbEntry {
  name: string,
  price: number,
  category: string,
  imageUrl: string | null
}
