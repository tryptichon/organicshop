import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

import { DbCategory } from './../../model/db-category';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends AbstractCrudService<DbCategory>{

  constructor(firestore: Firestore) {
    super('categories', firestore);
  }
}
