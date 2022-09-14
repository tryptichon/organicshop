import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';

import { LoginService } from './../auth/login.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  static DEFAULTROUTE = ['forbidden'];

  constructor(
    public loginService: LoginService,
    public router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.loginService.appUser$
      .pipe(
        map(appUser => appUser?.isAdmin ?? this.router.createUrlTree(AdminAuthGuard.DEFAULTROUTE))
      );
  }
}
