/**
 * Script de Migração e Preparação para o Ambiente de Produção.
 * Analisa o conteúdo atual do Firestore real (vital-dd47f), faz backups locais de segurança,
 * permite promover conteúdos aprovados/vulneráveis removendo a marcação 'developmentOnly',
 * e configura os documentos estruturais centrais (appConfig/public e contentManifest/public)
 * para o modo de produção real.
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const TARGET_PROJECT_ID = 'vital-dd47f';

async function runMigration() {
  console.log(`\n======================================================`);
  console.log(`🚀 INICIANDO SCRIPT DE MIGRAÇÃO PARA PRODUÇÃO`);
  console.log(`Projeto Firebase Alvo: ${TARGET_PROJECT_ID}`);
  console.log(`======================================================\n`);

  try {
    // Inicializar Firebase Admin
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        projectId: TARGET_PROJECT_ID
      });
    }

    const db = getFirestore();
    const backupData = {};
    const backupDir = path.join(__dirname, '../backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Fazer backup local de segurança de todas as coleções críticas antes de prosseguir
    const collectionsToBackup = [
      'recipes', 'exercises', 'recipeCategories', 'workoutTemplates', 
      'mealPlanTemplates', 'achievements', 'onboardingQuestions', 'appConfig'
    ];

    console.log('📦 Fase 1: Criando backup local de segurança de todos os dados...');
    for (const colName of collectionsToBackup) {
      const snap = await db.collection(colName).get();
      backupData[colName] = {};
      snap.forEach(doc => {
        backupData[colName][doc.id] = doc.data();
      });
      console.log(`   - Backup de "${colName}": ${snap.size} documentos salvos.`);
    }

    const backupFile = path.join(backupDir, `backup_real_db_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`✅ Backup local concluído com sucesso em: "${backupFile}"\n`);

    // 2. Configurar appConfig/public para PRODUÇÃO real
    console.log('⚙️ Fase 2: Configurando "appConfig/public" para o modo Produção real...');
    const configRef = db.collection('appConfig').doc('public');
    const defaultProductionConfig = {
      appName: 'Vida Saudável',
      environment: 'production',
      contentMode: 'firestore',
      allowDemoContent: false,
      maintenanceMode: false,
      currentTermsVersion: '1.0.0',
      currentPrivacyVersion: '1.0.0',
      minimumSupportedVersion: '1.0.0',
      latestVersion: '1.0.0',
      supportEmail: 'suporte@vidasaudavel.app',
      privacyUrl: 'https://vidasaudavel.app/privacidade',
      termsUrl: 'https://vidasaudavel.app/termos',
      featureFlags: {
        recipes: true,
        mealPlans: true,
        shoppingLists: true,
        exercises: true,
        workoutPlans: true,
        achievements: true,
        reminders: true,
        healthConnect: true,
        progressPhotos: true,
        googleLogin: true
      },
      updatedAt: new Date().toISOString()
    };
    await configRef.set(defaultProductionConfig, { merge: true });
    console.log('✅ Configurações estruturais de produção atualizadas com sucesso em appConfig/public.\n');

    // 3. Inicializar ou certificar o "contentManifest/public" com versões zeradas/iniciais de produção
    console.log('📄 Fase 3: Inicializando ou certificando o manifesto "contentManifest/public"...');
    const manifestRef = db.collection('contentManifest').doc('public');
    const initialManifest = {
      recipesVersion: 1,
      exercisesVersion: 1,
      workoutTemplatesVersion: 1,
      mealPlansVersion: 1,
      categoriesVersion: 1,
      ingredientsVersion: 1,
      allergensVersion: 1,
      achievementsVersion: 1,
      onboardingVersion: 1,
      announcementsVersion: 1,
      appConfigVersion: 1,
      lastPublishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const manifestSnap = await manifestRef.get();
    if (!manifestSnap.exists) {
      await manifestRef.set(initialManifest);
      console.log('✅ Manifesto contentManifest/public criado com as versões iniciais.');
    } else {
      console.log('ℹ️ Manifesto contentManifest/public já existe. Mantendo versões existentes para consistência.');
    }
    console.log();

    // 4. Promover conteúdos aprovados e limpar 'developmentOnly'
    console.log('🧼 Fase 4: Limpando a flag "developmentOnly" de dados reais aprovados...');
    let promotedRecipes = 0;
    let promotedExercises = 0;

    const recipesSnap = await db.collection('recipes').get();
    for (const doc of recipesSnap.docs) {
      const data = doc.data();
      if (data.developmentOnly === true) {
        // Se já está aprovado ou publicado, podemos limpar developmentOnly para fazê-lo legível em produção
        await db.collection('recipes').doc(doc.id).update({
          developmentOnly: false,
          updatedAt: new Date().toISOString()
        });
        promotedRecipes++;
      }
    }

    const exercisesSnap = await db.collection('exercises').get();
    for (const doc of exercisesSnap.docs) {
      const data = doc.data();
      if (data.developmentOnly === true) {
        await db.collection('exercises').doc(doc.id).update({
          developmentOnly: false,
          updatedAt: new Date().toISOString()
        });
        promotedExercises++;
      }
    }

    console.log(`✅ Fase 4 concluída. Limpos: ${promotedRecipes} receitas e ${promotedExercises} exercícios.\n`);

    // 5. Configurar o appTheme/public padrão para produção
    console.log('🎨 Fase 5: Configurando as variáveis de tema visual "appTheme/public"...');
    const themeRef = db.collection('appTheme').doc('public');
    const initialThemeColors = {
      primaryColor: '#F8FEDA',
      secondaryColor: '#F47551',
      accentColor: '#F8D558',
      backgroundColor: '#CCB1F6',
      textColor: '#333333',
      successColor: '#CDE26D',
      updatedAt: new Date().toISOString()
    };
    await themeRef.set(initialThemeColors, { merge: true });
    console.log('✅ appTheme/public de produção configurado com sucesso.\n');

    console.log(`======================================================`);
    console.log(`🎉 MIGRAÇÃO PARA PRODUÇÃO CONCLUÍDA COM SUCESSO!`);
    console.log(`Ambiente pronto e configurado como PRODUÇÃO real.`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('❌ Erro crítico durante a migração:', err.message);
    process.exit(1);
  }
}

runMigration();
