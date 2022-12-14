import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoginService } from './../../services/auth/login.service';

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
    let returnUrl = this.route.snapshot.paramMap.get('returnUrl');
    if (returnUrl)
      this.returnUrl = returnUrl;
  }

  login() {
    this.loginService.login()
  }

}
