import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Recipe, EditorialStatus } from '../models/types';
import { VersionControlService } from '../services/versionControl';
import { PublishingService } from '../services/publishingService';

export class RecipeAdminRepository {
  private static colPath = 'recipes';

  static async list(statusFilter?: EditorialStatus): Promise<Recipe[]> {
    try {
      let q = query(collection(db, this.colPath), orderBy('updatedAt', 'desc'), limit(100));
      if (statusFilter) {
        q = query(collection(db, this.colPath), where('status', '==', statusFilter), limit(100));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Recipe, 'id'>) }));
    } catch (err) {
      console.warn('Fallback list query:', err);
      try {
        const snap = await getDocs(collection(db, this.colPath));
        return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Recipe, 'id'>) }));
      } catch (innerErr) {
        handleFirestoreError(innerErr, OperationType.LIST, this.colPath);
        return [];
      }
    }
  }

  static async getById(id: string): Promise<Recipe | null> {
    try {
      const snap = await getDoc(doc(db, this.colPath, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<Recipe, 'id'>) };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${this.colPath}/${id}`);
      return null;
    }
  }

  static async create(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'version'>, actorEmail?: string): Promise<string> {
    try {
      const now = new Date().toISOString();
      const payload: Omit<Recipe, 'id'> = {
        ...data,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
      const ref = await addDoc(collection(db, this.colPath), payload);
      await VersionControlService.createVersionSnapshot('recipe', ref.id, 1, payload, actorEmail || 'system', 'Criação inicial de rascunho');
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, this.colPath);
      throw err;
    }
  }

  static async update(id: string, updates: Partial<Recipe>, actorEmail?: string, changeReason?: string): Promise<void> {
    try {
      const current = await this.getById(id);
      const newVersion = (current?.version || 1);
      const status = updates.status || current?.status || 'draft';

      const mergedData = {
        ...(current || {}),
        ...updates,
        version: newVersion,
      };

      const actor = PublishingService.getActiveActor();
      if (actorEmail) {
        actor.email = actorEmail;
      }

      await PublishingService.publishOrSaveContent(
        this.colPath,
        id,
        mergedData,
        status,
        actor,
        changeReason || 'Atualização de receita'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${this.colPath}/${id}`);
    }
  }

  static async setStatus(id: string, status: EditorialStatus, actorEmail?: string, notes?: string): Promise<void> {
    await this.update(id, { 
      status, 
      reviewedBy: actorEmail, 
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes 
    }, actorEmail, `Alteração de status editorial para: ${status}`);
  }

  static async duplicate(id: string, actorEmail?: string): Promise<string> {
    const original = await this.getById(id);
    if (!original) throw new Error('Receita não encontrada');

    const copyData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      ...original,
      name: `${original.name} (Cópia)`,
      slug: `${original.slug}-copia-${Date.now()}`,
      status: 'draft',
      reviewedBy: undefined,
      reviewedAt: undefined,
      reviewNotes: undefined,
    };

    return this.create(copyData, actorEmail);
  }

  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.colPath, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${this.colPath}/${id}`);
    }
  }
}
