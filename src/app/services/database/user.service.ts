import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DbUser } from 'src/app/model/db-user';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends AbstractCrudService<DbUser> {

  constructor(firestore: Firestore) {
    super('users', firestore);
  }

}
