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
  getDocs,
  runTransaction,
  Transaction
} from '@angular/fire/firestore';
import { uuidv4 as uuid } from "@firebase/util";
import { firstValueFrom, from, map, Observable, of, switchMap, take } from 'rxjs';

import { DbEntry } from './../../model/db-entry';

/**
 * Generic CRUD operations on Firebase/Firestore database.
 *
 * @template T Model interface of the data for Firestore, which has to
 *             extend {@link DbEntry}.
 */
export abstract class AbstractCrudService<T extends DbEntry> {

  private documentCollection: CollectionReference<DocumentData>;


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
   * @returns A NoId where the field 'id' has been removed.
   */
  protected removeId(document: DbEntry) {
    let documentData = { ...document, id: undefined };
    delete documentData.id;
    return documentData;
  }

  /**
   * @returns A new unique Id for a database entry.
   */
  public static getUniqueId() {
    return uuid();
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
    return from(runTransaction(this.firestore, (transaction) => this.getOrCreateT(transaction, document)));
  }

  async getOrCreateT(transaction: Transaction, document: T): Promise<T> {
    let foundDocument = await transaction.get(this.ref(document.id));
    if (foundDocument.exists())
      return {
        id: foundDocument.id,
        ...foundDocument.data()
      } as T;

    this.createT(transaction, document);
    return document;
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
   * @returns A promise containing all ids of the document collection.
   */
  async getIds(): Promise<string[]> {
    return (await firstValueFrom(this.getAll()
      .pipe(
        take(1)
      )
    )).map(document => document.id);
  }

  /**
   * Query document
   */
  async query(field: string, operator: string, value: string) {
    const q = query(
      this.documentCollection,
      where(field, operator as WhereFilterOp, value)
    );

    let queryResult = await getDocs(q);

    let documents: T[] = [];
    queryResult.forEach(result =>
      documents.push({ id: result.id, ...result.data() } as T)
    );

    return documents;
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

  createT(transaction: Transaction, document: DbEntry) {
    return transaction.set(this.ref(document.id), this.removeId(document), { merge: true });
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

  updateT(transaction: Transaction, document: DbEntry) {
    return transaction.update(this.ref(document.id), { ...this.removeId(document) });
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

  deleteT(transaction: Transaction, id: string) {
    return transaction.delete(this.ref(id));
  }

  /**
   * Delete all documents from the collection, thereby
   * removing it from the database.
   *
   * @returns A promise that finishes when the process completes.
   */
  async deleteAll() {
    let ids = await this.getIds();

    await runTransaction(this.firestore, async (transaction) => this.deleteAllT(transaction, ids));
  }

  /**
   * Because this gets called within a transaction, you can NOT
   * get data via a non-transactional query here.
   * Therefore the ids have obtained before the transaction starts.
   *
   * @param transaction The current transaction.
   * @param ids The ids of the documents to delete.
   */
  deleteAllT(transaction: Transaction, ids: string[]) {
    return ids.map(id => this.deleteT(transaction, id));
  }
}
