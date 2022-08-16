import { Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbUser } from './../../model/db-user';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends AbstractCrudService<DbUser> implements OnDestroy {

  constructor(firestore: Firestore) {
    super('users', firestore);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

}
