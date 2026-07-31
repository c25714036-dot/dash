import { writeBatch, doc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { EditorialStatus, AdminRole } from '../models/types';

export class PublishingService {
  private static manifestPath = 'contentManifest/public';

  /**
   * Obtém o ator ativo a partir da sessão armazenada localmente.
   */
  static getActiveActor(): { uid: string; email: string; role: AdminRole } {
    try {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        return {
          uid: parsed.uid || 'system-uid',
          email: parsed.email || 'system@vidasaudavel.app',
          role: parsed.role || 'superAdmin'
        };
      }
    } catch (err) {
      console.warn('Erro ao ler sessão do localStorage:', err);
    }
    return {
      uid: 'system-uid',
      email: 'system@vidasaudavel.app',
      role: 'superAdmin'
    };
  }

  /**
   * Obtém a chave correspondente do manifesto para um dado tipo de recurso.
   */
  private static getManifestKey(collectionPath: string): string {
    switch (collectionPath) {
      case 'recipes':
        return 'recipesVersion';
      case 'exercises':
        return 'exercisesVersion';
      case 'workoutTemplates':
        return 'workoutTemplatesVersion';
      case 'mealPlanTemplates':
        return 'mealPlansVersion';
      case 'recipeCategories':
        return 'categoriesVersion';
      case 'ingredients':
        return 'ingredientsVersion';
      case 'allergens':
        return 'allergensVersion';
      case 'achievements':
        return 'achievementsVersion';
      case 'onboardingQuestions':
        return 'onboardingVersion';
      case 'appAnnouncements':
        return 'announcementsVersion';
      case 'appConfig':
        return 'appConfigVersion';
      default:
        return 'unknownVersion';
    }
  }

  /**
   * Publica ou atualiza um conteúdo com controle de versão de manifesto, snapshot e auditoria
   * em uma gravação em lote atômica (writeBatch) sempre que possível.
   */
  static async publishOrSaveContent(
    collectionPath: string,
    id: string,
    data: any,
    targetStatus: EditorialStatus,
    actor: { uid: string; email: string; role: AdminRole },
    changeReason: string = 'Publicação ou alteração via Painel de Controle'
  ): Promise<void> {
    const batch = writeBatch(db);
    const nowStr = new Date().toISOString();

    // 1. Snapshot da versão anterior (se existir e estivermos editando)
    try {
      const currentDocRef = doc(db, collectionPath, id);
      const snap = await getDoc(currentDocRef);
      if (snap.exists()) {
        const currentData = snap.data();
        const currentVersion = currentData.version || 1;
        const snapshotRef = doc(db, `contentVersions/${id}/versions/${currentVersion}`);
        
        batch.set(snapshotRef, {
          contentType: collectionPath.replace('s', ''), // Ex: recipes -> recipe
          contentId: id,
          version: currentVersion,
          snapshot: currentData,
          changedBy: actor.email,
          changeReason: changeReason,
          createdAt: nowStr
        });
      }
    } catch (err) {
      console.warn('Erro ao preparar snapshot de versão:', err);
    }

    // 2. Definir dados principais
    const mainDocRef = doc(db, collectionPath, id);
    const docUpdates: any = {
      ...data,
      status: targetStatus,
      updatedAt: nowStr
    };

    if (targetStatus === 'published') {
      docUpdates.publishedAt = nowStr;
    }

    // Incrementar versão do próprio documento
    const currentVersion = data.version || 1;
    docUpdates.version = currentVersion + 1;

    batch.set(mainDocRef, docUpdates, { merge: true });

    // 3. Atualizar o contentManifest/public se o status for published
    if (targetStatus === 'published') {
      const manifestRef = doc(db, 'contentManifest', 'public');
      const manifestKey = this.getManifestKey(collectionPath);
      
      const manifestUpdates: any = {
        lastPublishedAt: nowStr,
        updatedAt: nowStr
      };

      if (manifestKey !== 'unknownVersion') {
        manifestUpdates[manifestKey] = increment(1);
      }

      batch.set(manifestRef, manifestUpdates, { merge: true });
    }

    // 4. Gravar log de auditoria
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const auditRef = doc(db, 'adminAuditLogs', auditId);
    
    batch.set(auditRef, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: targetStatus === 'published' ? 'publish' : 'update',
      resourceType: collectionPath,
      resourceId: id,
      summary: `${targetStatus === 'published' ? 'Publicou' : 'Atualizou'} ${collectionPath} ID: ${id}. Motivo: ${changeReason}`,
      createdAt: nowStr
    });

    // Submeter o lote atômico
    await batch.commit();
    console.log(`[PublishingService] Operação de lote concluída com sucesso para ${collectionPath}/${id} com status ${targetStatus}`);
  }
}
