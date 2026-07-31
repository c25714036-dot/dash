import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { MuscleGroup } from '../models/types';

export class MuscleGroupAdminRepository {
  private static colPath = 'muscleGroups';

  static async list(): Promise<MuscleGroup[]> {
    try {
      const snap = await getDocs(collection(db, this.colPath));
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<MuscleGroup, 'id'>) }));
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.colPath);
      return [];
    }
  }

  static async create(data: Omit<MuscleGroup, 'id'>): Promise<string> {
    try {
      const ref = await addDoc(collection(db, this.colPath), data);
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, this.colPath);
      throw err;
    }
  }

  static async update(id: string, updates: Partial<MuscleGroup>): Promise<void> {
    try {
      await updateDoc(doc(db, this.colPath, id), updates);
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
