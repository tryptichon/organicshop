import { Injectable, OnDestroy } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { signInWithPopup } from 'firebase/auth';
import { EMPTY, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';

import { DbMappedUser } from './../../model/db-mapped-user';
import { DbUser } from './../../model/db-user';
import { UserService } from './../database/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnDestroy {

  private user$: Observable<DbUser | null> = EMPTY;

  private destroyed$ = new Subject<void>();

  constructor(
    public auth: Auth,
    public userService: UserService,
    private router: Router
  ) {
    if (!auth)
      return;

    this.user$ = authState(this.auth)
      .pipe(
        map(firebaseUser => firebaseUser ? new DbMappedUser(firebaseUser) : null),
        takeUntil(this.destroyed$)
      );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  /**
   * Obtains user data from the backend database.
   *
   * @return An Observable containing the user data from the user database or
   *         null/void if no such user exists and it cannot be created.
   */
  get appUser$(): Observable<DbUser | null | void> {
    return this.user$.pipe(
      switchMap(user => user ? this.userService.getOrCreate(user) : of(null))
    );
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
    return window.location.reload();
  }


  /**
   * Logout and redirect to home.
   *
   * @return Promise that gets fulfilled after navigation is done.
   */
  async logout(): Promise<boolean | void> {
    await signOut(this.auth);
    return await this.router.navigate(['']);
  }

}
