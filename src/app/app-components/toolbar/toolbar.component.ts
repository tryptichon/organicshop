import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { LoginService } from './../../services/auth/login.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnDestroy {

  public isAdmin: boolean = false;
  public name: string | null = null;

  private destroyed$ = new Subject<void>();

  constructor(public loginService: LoginService) {
    this.loginService.appUser$
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(appUser => {
        this.isAdmin = appUser?.isAdmin || false;
        this.name = appUser?.name || null;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  logout() {
    this.loginService.logout();
  }
}