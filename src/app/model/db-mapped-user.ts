import { DbUser } from "./db-user";
import { User } from '@angular/fire/auth';

/**
 * Maps the data of a firebase user to match the
 * interface DbUser.
 */
export class DbMappedUser implements DbUser {

  public id: string;
  public name: string | null;
  public email: string | null;
  public isAdmin: boolean = false;

  /**
   * Maps the data of a firebase user to match the
   * interface DbUser.
   *
   * @param firebaseUser The user data obtained from firebase.
   */
  constructor(firebaseUser: User) {
    this.id = firebaseUser.uid;
    this.name = firebaseUser.displayName;
    this.email = firebaseUser.email;
  }
}
