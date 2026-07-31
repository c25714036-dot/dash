import { collection, doc, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { ContentReview } from '../models/types';

export class ContentReviewRepository {
  private static colPath = 'contentReviews';

  static async list(): Promise<ContentReview[]> {
    try {
      const snap = await getDocs(collection(db, this.colPath));
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ContentReview, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, this.colPath);
      return [];
    }
  }

  static async submitForReview(
    contentType: ContentReview['contentType'],
    contentId: string,
    contentTitle: string,
    submittedBy: string
  ): Promise<string> {
    try {
      const payload: Omit<ContentReview, 'id'> = {
        contentType,
        contentId,
        contentTitle,
        submittedBy,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };
      const ref = await addDoc(collection(db, this.colPath), payload);
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, this.colPath);
      throw err;
    }
  }

  static async updateReviewStatus(
    id: string,
    status: ContentReview['status'],
    reviewerUid: string,
    reviewerEmail?: string,
    notes?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.colPath, id), {
        status,
        reviewerUid,
        reviewerEmail,
        reviewedAt: new Date().toISOString(),
        notes,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${this.colPath}/${id}`);
    }
  }
}
