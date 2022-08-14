import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, docData, DocumentData, DocumentReference, Firestore, setDoc, updateDoc } from "@angular/fire/firestore";
import { from, Observable, of, switchMap } from "rxjs";
import { DbEntry } from "src/app/model/db-entry";

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
   * Get single document by id.
   *
   * @param id Id of a document
   * @returns Observable for this document.
   */
  get(id: string): Observable<T | null> {
    return docData(this.ref(id), { idField: 'id' }) as Observable<T | null>;
  }

  /**
   * Get single document or create it if it does not exist yet.
   *
   * @param document: The full document
   * @returns Observable for this document or the document obtained from Firestore.
   */
  getOrCreate(document: T): Observable<T | void> {
    return (docData(this.ref(document.id), { idField: 'id' }) as Observable<T>)
      .pipe(
        switchMap(dbDocument => {
          return (dbDocument) ?
            of(dbDocument) :
            this.create(document)
              .then(() => document)
              .catch(error => alert(JSON.stringify(error)));
        })
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
   * Create or update new document in Firestore.
   * This does NOT create a new ID automatically. It has to be included in 'document'.
   *
   * @param document The document data including an id.
   * @returns A promise that finishes when the process completes.
   */
  create(document: DbEntry): Promise<void> {
    return setDoc(this.ref(document.id), document);
  }

  /**
   * Update a document in Firestore.
   *
   * @param document The document data. Needs to have an id.
   * @returns A promise that finishes when the process completes.
   */
  update(document: DbEntry): Promise<void> {
    return updateDoc(this.ref(document.id), { ...document });
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
