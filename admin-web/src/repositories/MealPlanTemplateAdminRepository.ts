import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { MealPlanTemplate, EditorialStatus } from '../models/types';
import { PublishingService } from '../services/publishingService';

export class MealPlanTemplateAdminRepository {
  private static colPath = 'mealPlanTemplates';

  static async list(): Promise<MealPlanTemplate[]> {
    try {
      const snap = await getDocs(collection(db, this.colPath));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<MealPlanTemplate, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.colPath);
      return [];
    }
  }

  static async getById(id: string): Promise<MealPlanTemplate | null> {
    try {
      const snap = await getDoc(doc(db, this.colPath, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<MealPlanTemplate, 'id'>) };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${this.colPath}/${id}`);
      return null;
    }
  }

  static async create(data: Omit<MealPlanTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const payload: Omit<MealPlanTemplate, 'id'> = {
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

  static async update(id: string, updates: Partial<MealPlanTemplate>): Promise<void> {
    try {
      const current = await this.getById(id);
      const status = updates.status || current?.status || 'draft';

      const mergedData = {
        ...(current || {}),
        ...updates,
      };

      const actor = PublishingService.getActiveActor();

      await PublishingService.publishOrSaveContent(
        this.colPath,
        id,
        mergedData,
        status,
        actor,
        'Atualização de modelo de plano alimentar'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${this.colPath}/${id}`);
    }
  }

  static async setStatus(id: string, status: EditorialStatus): Promise<void> {
    await this.update(id, { status });
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.colPath, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${this.colPath}/${id}`);
    }
  }
}
