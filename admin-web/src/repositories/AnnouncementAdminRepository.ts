import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AppAnnouncement } from '../models/types';

export class AnnouncementAdminRepository {
  private static colPath = 'appAnnouncements';

  static async list(): Promise<AppAnnouncement[]> {
    try {
      const snap = await getDocs(collection(db, this.colPath));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AppAnnouncement, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.colPath);
      return [];
    }
  }

  static async create(data: Omit<AppAnnouncement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const payload: Omit<AppAnnouncement, 'id'> = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await addDoc(collection(db, this.colPath), payload);
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, this.colPath);
      throw err;
    }
  }

  static async update(id: string, updates: Partial<AppAnnouncement>): Promise<void> {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, this.colPath, id), { ...updates, updatedAt: now });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${this.colPath}/${id}`);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.colPath, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${this.colPath}/${id}`);
    }
  }
}
