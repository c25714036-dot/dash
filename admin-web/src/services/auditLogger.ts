import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AdminAuditLog, AdminRole } from '../models/types';

export class AuditLogger {
  static async logAction(
    actorUid: string,
    actorRole: AdminRole,
    action: string,
    resourceType: string,
    resourceId: string,
    summary: string,
    actorEmail?: string
  ): Promise<void> {
    try {
      const payload: Omit<AdminAuditLog, 'id'> = {
        actorUid,
        actorEmail,
        actorRole,
        action,
        resourceType,
        resourceId,
        summary,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'adminAuditLogs'), payload);
    } catch (err) {
      console.warn('Audit log write warning:', err);
      // Audit logs do not block user actions if offline or permissions restrict write
    }
  }
}
