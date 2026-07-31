import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { ContentVersion } from '../models/types';

export class VersionControlService {
  static async createVersionSnapshot(
    contentType: string,
    contentId: string,
    version: number,
    snapshot: any,
    changedBy: string,
    changeReason: string
  ): Promise<void> {
    const path = `contentVersions/${contentId}/versions`;
    try {
      const payload: Omit<ContentVersion, 'id'> = {
        contentType,
        contentId,
        version,
        snapshot,
        changedBy,
        changeReason,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, path), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  static async getVersions(contentId: string): Promise<ContentVersion[]> {
    const path = `contentVersions/${contentId}/versions`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<ContentVersion, 'id'>)
      }));
    } catch (err) {
      console.warn('Could not fetch versions or collection empty:', err);
      return [];
    }
  }
}
