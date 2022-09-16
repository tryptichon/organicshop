import { DbEntry } from './db-entry';

export interface DbProduct extends DbEntry {
  name: string,
  price: number,
  category: string,
  imageUrl: string
}

