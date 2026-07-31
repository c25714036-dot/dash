import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AppConfig } from '../models/types';

export class AppConfigAdminRepository {
  private static docPath = 'appConfig/public';

  static async getPublicConfig(): Promise<AppConfig> {
    try {
      const snap = await getDoc(doc(db, 'appConfig', 'public'));
      if (snap.exists()) {
        return snap.data() as AppConfig;
      }
    } catch (err) {
      console.warn('Config fetch fallback:', err);
    }

    // Default configuration if document does not exist yet
    return {
      appName: 'Vida Saudável',
      currentTermsVersion: '1.0.0',
      currentPrivacyVersion: '1.0.0',
      minimumSupportedVersion: '1.0.0',
      latestVersion: '1.2.0',
      maintenanceMode: false,
      supportEmail: 'suporte@vidasaudavel.app',
      privacyUrl: 'https://vidasaudavel.app/privacidade',
      termsUrl: 'https://vidasaudavel.app/termos',
      featureFlags: {
        recipes: true,
        mealPlans: true,
        shoppingList: true,
        exercises: true,
        workoutPlans: true,
        achievements: true,
        reminders: true,
        evolutionPhotos: true,
        healthConnect: true,
        googleLogin: true,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  static async updatePublicConfig(config: AppConfig): Promise<void> {
    try {
      const updated: AppConfig = {
        ...config,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'appConfig', 'public'), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, this.docPath);
    }
  }
}
