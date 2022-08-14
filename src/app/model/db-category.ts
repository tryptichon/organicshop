import { DbEntry } from './db-entry';

export interface DbCategory extends DbEntry {
  name: string | null;
}
