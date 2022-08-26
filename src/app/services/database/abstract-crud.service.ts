import {
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
  WhereFilterOp,
  QuerySnapshot
} from '@angular/fire/firestore';
import { uuidv4 as uuid } from "@firebase/util";
import { getDocs } from 'firebase/firestore';
import { catchError, EMPTY, Observable, of, switchMap } from 'rxjs';
import { Alert } from 'src/app/util/error-alert';

import { DbEntry } from './../../model/db-entry';


export interface DbDataEntry {
  id?: string;
}

/**
 * Generic CRUD operations on Firebase/Firestore database.
 *
 * TODO: Implement correct error handling.
 *
 * @template T Model interface of the data for Firestore, which has to
 *             extend {@link DbEntry}.
 */
export abstract class AbstractCrudService<T extends DbEntry> {

  private documentCollection: CollectionReference<DocumentData>;

  protected documents$: Observable<T[]>;

  /**
   * Construct the CRUD service.
   *
   * @param nameOfCollection Name of the Collection in Firebase/Firestore.
   * @param firestore Reference to the Firestore.
   */
  constructor(
    protected nameOfCollection: string,
    protected firestore: Firestore
  ) {
    this.documentCollection = collection(this.firestore, nameOfCollection);

    this.documents$ = this.getAll()
      .pipe(
        catchError(error => {
          Alert.show(error);
          return EMPTY;
        }),
      );
  }

  /**
   * Obtain a generic DocumentReference.
   *
   * @param id Id of a document
   * @returns A reference to a document with this id.
   */
  protected ref(id: string): DocumentReference<DocumentData> {
    return doc(this.firestore, this.nameOfCollection, id);
  }

  /**
   * Remove the id from the document for write and update operations.
   *
   * @param document Thhe original document with id.
   * @returns A DbDataEntry where the field 'id' has been removed.
   */
  protected removeId(document: DbEntry): DbDataEntry {
    let documentData: DbDataEntry = document;
    delete documentData.id;
    return documentData;
  }

  /**
   * @returns A new unique Id for a database entry.
   */
  getUniqueId() {
    return uuid();
  }

  /**
   * @returns Observable<T[]> An observable over the array of documents.
   */
  getDocuments$() {
    return this.documents$;
  }

  /**
   * Get single document by id.
   *
   * @param id Id of a document
   * @returns Observable for this document.
   */
  get(id: string): Observable<T> {
    return docData(this.ref(id), { idField: 'id' }) as Observable<T>;
  }

  /**
   * Get single document or create it if it does not exist yet. If the incoming
   * document does not have an id, a unique id will be set.
   *
   * @param document: The full document
   * @returns Observable for this document or the document obtained from Firestore.
   */
  getOrCreate(document: T): Observable<T | void> {
    return this.get(document.id)
      .pipe(
        switchMap(dbDocument => (dbDocument) ? of(dbDocument) :
          this.create(document)
            .then(() => document)
            .catch(error => alert(JSON.stringify(error))))
      );
  }

  /**
   * Get all documents.
   *
   * @returns An Observalbe of an array of all documents
   */
  getAll(): Observable<T[]> {
    return collectionData(this.documentCollection, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Query document
   */
  async query(field: string, operator: string, value: string) {
    const q = query(
      this.documentCollection,
      where(field, operator as WhereFilterOp, value)
    );

    return await getDocs(q) as QuerySnapshot<T>;
  }

  /**
   * Create or update new document in Firestore.
   * This does NOT create a new ID automatically. It has to be included in 'document'.
   *
   * @param document The document data including an id.
   * @returns A promise that finishes when the process completes.
   */
  create(document: DbEntry): Promise<void> {
    return setDoc(this.ref(document.id), this.removeId(document), { merge: true });
  }

  /**
   * Update a document in Firestore.
   *
   * @param document The document data. Needs to have an id.
   * @returns A promise that finishes when the process completes.
   */
  update(document: DbEntry): Promise<void> {
    return updateDoc(this.ref(document.id), { ...this.removeId(document) });
  }

  /**
   * Remove a document from Firestore.
   *
   * @param id Id of the document to remove.
   * @returns A promise that finishes when the process completes.
   */
  delete(id: string): Promise<void> {
    return deleteDoc(this.ref(id));
  }
}
