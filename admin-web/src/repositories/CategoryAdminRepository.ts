import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { RecipeCategory } from '../models/types';
import { PublishingService } from '../services/publishingService';

export class CategoryAdminRepository {
  private static colPath = 'recipeCategories';

  static async list(): Promise<RecipeCategory[]> {
    try {
      const snap = await getDocs(collection(db, this.colPath));
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<RecipeCategory, 'id'>) }));
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.colPath);
      return [];
    }
  }

  static async getById(id: string): Promise<RecipeCategory | null> {
    try {
      const snap = await getDoc(doc(db, this.colPath, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<RecipeCategory, 'id'>) };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${this.colPath}/${id}`);
      return null;
    }
  }

  static async create(data: Omit<RecipeCategory, 'id'>): Promise<string> {
    try {
      const newId = doc(collection(db, this.colPath)).id;
      const actor = PublishingService.getActiveActor();
      
      await PublishingService.publishOrSaveContent(
        this.colPath,
        newId,
        data,
        'published',
        actor,
        'Criação de categoria de receita'
      );

      return newId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, this.colPath);
      throw err;
    }
  }

  static async update(id: string, updates: Partial<RecipeCategory>): Promise<void> {
    try {
      const current = await this.getById(id);
      const mergedData = {
        ...(current || {}),
        ...updates,
      };

      const actor = PublishingService.getActiveActor();
      await PublishingService.publishOrSaveContent(
        this.colPath,
        id,
        mergedData,
        'published',
        actor,
        'Atualização de categoria de receita'
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
