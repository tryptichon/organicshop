import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoginService } from './../../services/auth/login.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnDestroy {

  public isAdmin: boolean = false;
  public name?: string;

  private userSubscription: Subscription;

  constructor(public loginService: LoginService) {
    this.userSubscription = this.loginService.appUser$
      .subscribe(appUser => {
        this.isAdmin = appUser?.isAdmin || false;
        this.name = appUser?.name;
      });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this.loginService.logout();
  }
}
