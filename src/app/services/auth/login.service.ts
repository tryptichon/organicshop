import { Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { signInWithPopup, User } from 'firebase/auth';
import { map, Observable, of, switchMap } from 'rxjs';

import { DbUser } from './../../model/db-user';
import { UserService } from './../database/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private user$: Observable<DbUser | null>;

  user: DbUser | null = null;

  constructor(
    public auth: Auth,
    public userService: UserService
  ) {
    this.user$ = authState(this.auth)
      .pipe(
        map(firebaseUser => firebaseUser ? this.getMappedUser(firebaseUser) : null),
        switchMap(user => user ? this.userService.getOrCreate(user) : of(null)),
        map(dbUser => dbUser ?? null)
      );

    this.user$.subscribe(dbUser => this.user = dbUser);
  }

  /**
   * Obtains user data from the backend database.
   *
   * @return An Observable containing the user data from the user database
   *         or of(null) if no such user exists and it cannot be created.
   */
  get appUser$(): Observable<DbUser | null> {
    return this.user$;
  }

  /**
   * Login with provider. This is using a popup, since redirection
   * currently tends to break on Mozilla Firefox.
   * After the login has completed, the page is reloaded to trigger
   * the route redirections defined in app-routing.module.ts.
   *
   * @return Promise that gets fulfilled after the reload is done.
   */
  async login(): Promise<void> {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
    return this.reloadPage();
  }


  /**
   * Logout.
   *
   * @return Promise that gets fulfilled after navigation is done.
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
    return this.reloadPage();
  }

  private reloadPage() {
    window.location.reload();
  }

  private getMappedUser(firebaseUser: User): DbUser {
    let newUser: DbUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName != null ? firebaseUser.displayName : undefined,
      email: firebaseUser.email != null ? firebaseUser.email : undefined,
      isAdmin: false
    };

    return newUser;
  }
}
