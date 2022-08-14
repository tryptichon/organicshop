import { DbEntry } from './db-entry';
/**
 * This is an interface, because it uses firebase.User as source
 * data.
 */
export interface DbUser extends DbEntry {
  name: string | null,
  email: string | null,
  isAdmin: boolean
}
