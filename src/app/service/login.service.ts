import { Injectable, OnDestroy } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithRedirect, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { EMPTY, firstValueFrom, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';

import { AppUser } from '../model/appuser';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnDestroy {

  private user$: Observable<AppUser | null> = EMPTY;

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
        map(user => {
          return user ? {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            isAdmin: false
          } : null;
        }),
        takeUntil(this.destroyed$)
      );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  get appUser$(): Observable<AppUser | null> {
    return this.user$.pipe(
      switchMap(user => {
        return user ? this.userService.getOrCreate(user) : of(null);
      })
    )
  }

  login() {
    signInWithRedirect(this.auth, new GoogleAuthProvider());
  }

  logout() {
    signOut(this.auth)
      .then(() =>
        this.router.navigate([''])
      );
  }

}
