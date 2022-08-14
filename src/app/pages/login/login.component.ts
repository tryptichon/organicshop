import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  returnUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    public loginService: LoginService
  ) { }

  /**
   * Looks for the parameter 'returnUrl' in the route of the request
   * and saves it in this.returnUrl for later use by the router when
   * the login has finished.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
        this.returnUrl = paramMap.get('returnUrl') || this.returnUrl;
    });
  }

  login() {
    this.loginService.login()
  }

}
