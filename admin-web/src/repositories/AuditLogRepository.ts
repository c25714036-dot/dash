import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AdminAuditLog } from '../models/types';

export class AuditLogRepository {
  private static colPath = 'adminAuditLogs';

  static async listLogs(maxCount: number = 100): Promise<AdminAuditLog[]> {
    try {
      const q = query(collection(db, this.colPath), orderBy('createdAt', 'desc'), limit(maxCount));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AdminAuditLog, 'id'>) }));
    } catch (err) {
      console.warn('Fallback list logs:', err);
      try {
        const snap = await getDocs(collection(db, this.colPath));
        return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AdminAuditLog, 'id'>) }));
      } catch (innerErr) {
        handleFirestoreError(innerErr, OperationType.LIST, this.colPath);
        return [];
      }
    }
  }
}
