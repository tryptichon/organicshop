import { Injectable, OnDestroy } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signOut, signInWithRedirect } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';
import { Router } from '@angular/router';
import { signInWithPopup, UserCredential } from 'firebase/auth';
import { EMPTY, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { DbUser } from 'src/app/model/db-user';
import { UserService } from '../database/user.service';



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

  get appUser$(): Observable<DbUser | null | void> {
    return this.user$.pipe(
      switchMap(user => {
        return user ? this.userService.getOrCreate(user) : of(null);
      })
    )
  }

  login() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then(() => window.location.reload());
  }

  logout() {
    signOut(this.auth)
      .then(() =>
        this.router.navigate([''])
      );
  }

}
