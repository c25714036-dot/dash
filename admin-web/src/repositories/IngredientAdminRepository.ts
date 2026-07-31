import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Ingredient } from '../models/types';
import { PublishingService } from '../services/publishingService';

export class IngredientAdminRepository {
  private static colPath = 'ingredients';

  static async list(): Promise<Ingredient[]> {
    try {
      const snap = await getDocs(collection(db, this.colPath));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Ingredient, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.colPath);
      return [];
    }
  }

  static async getById(id: string): Promise<Ingredient | null> {
    try {
      const snap = await getDoc(doc(db, this.colPath, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<Ingredient, 'id'>) };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${this.colPath}/${id}`);
      return null;
    }
  }

  static async create(data: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const newId = doc(collection(db, this.colPath)).id;
      const payload: Omit<Ingredient, 'id'> = {
        ...data,
        normalizedName: data.name.toLowerCase().trim(),
        createdAt: now,
        updatedAt: now,
      };

      const actor = PublishingService.getActiveActor();
      await PublishingService.publishOrSaveContent(
        this.colPath,
        newId,
        payload,
        'published',
        actor,
        'Criação de ingrediente'
      );

      return newId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, this.colPath);
      throw err;
    }
  }

  static async update(id: string, updates: Partial<Ingredient>): Promise<void> {
    try {
      const current = await this.getById(id);
      const now = new Date().toISOString();
      const payload: Partial<Ingredient> = {
        ...updates,
        updatedAt: now,
      };
      if (updates.name) {
        payload.normalizedName = updates.name.toLowerCase().trim();
      }

      const mergedData = {
        ...(current || {}),
        ...payload,
      };

      const actor = PublishingService.getActiveActor();
      await PublishingService.publishOrSaveContent(
        this.colPath,
        id,
        mergedData,
        'published',
        actor,
        'Atualização de ingrediente'
      );
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
