/**
 * Script para atribuição de Custom Claims (roles) em contas de administradores.
 * Executar via Cloud Shell ou terminal local autorizado:
 * 
 * Uso:
 * npm run set:admin -- --uid=UID_DO_USUARIO --role=superAdmin
 * 
 * Papéis permitidos:
 * - superAdmin
 * - admin
 * - contentEditor
 * - nutritionReviewer
 * - exerciseReviewer
 * - support
 */

const admin = require('firebase-admin');

const ALLOWED_ROLES = [
  'superAdmin',
  'admin',
  'contentEditor',
  'nutritionReviewer',
  'exerciseReviewer',
  'support'
];

const TARGET_PROJECT_ID = 'vital-dd47f';

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.replace(/^--/, '').split('=');
      args[key] = value;
    }
  });
  return args;
}

async function setAdminClaim() {
  const { uid, role } = parseArgs();

  if (!uid || !role) {
    console.error('❌ Erro: Argumentos insuficientes.');
    console.log('📌 Exemplo de uso: npm run set:admin -- --uid=UID_AQUI --role=superAdmin');
    process.exit(1);
  }

  if (!ALLOWED_ROLES.includes(role)) {
    console.error(`❌ Erro: Papel inválido "${role}".`);
    console.log(`Permitidos: ${ALLOWED_ROLES.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Projeto Alvo: ${TARGET_PROJECT_ID}`);
  console.log(`UID do Usuário: ${uid}`);
  console.log(`Papel Solicitado: ${role}`);
  console.log(`========================================\n`);

  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: TARGET_PROJECT_ID
    });

    // Validar se o usuário existe no Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    console.log(`✅ Usuário encontrado: ${userRecord.email || userRecord.uid}`);

    // Definir Custom Claims
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`🎉 Sucesso! Custom claim 'role: "${role}"' atribuído a ${uid}.`);
    console.log(`⚠️ ATENÇÃO: O usuário deve fazer LOGOUT e LOGIN novamente no Painel Web para renovar o token e aplicar as novas permissões.\n`);
  } catch (error) {
    console.error('❌ Erro ao atribuir claim:', error.message);
    process.exit(1);
  }
}

setAdminClaim();
