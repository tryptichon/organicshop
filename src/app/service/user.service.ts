import { Injectable } from '@angular/core';
import { collectionData, doc, docData, Firestore } from '@angular/fire/firestore';
import { collection, CollectionReference, deleteDoc, DocumentData, DocumentReference, setDoc, updateDoc } from 'firebase/firestore';
import { map, Observable } from 'rxjs';
import { AppUser } from '../model/appuser';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.userCollection = collection(this.firestore, 'users');
  }

  private ref(id: string): DocumentReference<DocumentData> {
    return doc(this.firestore, 'users', id);
  }

  get(id: string): Observable<AppUser | null> {
    return docData(this.ref(id), { idField: 'id' }) as Observable<AppUser | null>;
  }

  getOrCreate(user: AppUser): Observable<AppUser> {
    return (docData(this.ref(user.id), { idField: 'id' }) as Observable<AppUser>)
      .pipe(
        map(appUser => {
          if (!appUser) {
            this.create(user)
              .catch(error => alert(JSON.stringify(error)));
            return user;
          } else {
            return appUser;
          }
        })
      );
  }

  getAll() {
    return collectionData(this.userCollection, { idField: 'id' }) as Observable<AppUser[]>;
  }

  create(user: AppUser) {
    return setDoc(this.ref(user.id), user);
  }

  update(user: AppUser) {
    return updateDoc(this.ref(user.id), { ...user });
  }

  delete(id: string) {
    return deleteDoc(this.ref(id));
  }
}
