import { DbEntry } from './db-entry';

export interface DbProduct extends DbEntry {
  name: string,
  price: number,
  category: string,
  imageUrl: string
}

export class Product implements DbProduct {
  id!: string;
  name!: string;
  price!: number;
  category!: string;
  imageUrl!: string;

  constructor(formData: Partial<{
    id: string | null,
    name: string | null,
    price: number | null,
    category: string | null,
    imageUrl: string | null
  }>) {
    Object.entries(formData).forEach((key, value) => {
      if (value === null || value === undefined)
        throw Error('Key ' + key + ' must not be null or undefined');
    });

    Object.assign(this, formData);
  }

}
