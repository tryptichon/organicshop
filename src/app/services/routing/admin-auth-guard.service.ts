import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { LoginService } from '../auth/login.service';

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
    let redirect = (route.data['noAdminRedirectUrl'] || AdminAuthGuard.DEFAULTROUTE) as any[];

    return this.loginService.appUser$
      .pipe(
        map(appUser => appUser?.isAdmin || this.router.createUrlTree(redirect))
      );
  }
}
