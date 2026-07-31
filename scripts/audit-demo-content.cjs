/**
 * Script de Auditoria de Conteúdo de Demonstração / Mock no Firestore Real.
 * Varre as principais coleções procurando referências a mocks, exemplos ou dados de teste,
 * e gera um relatório formatado em 'docs/DEMO_CONTENT_AUDIT.md'.
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const TARGET_PROJECT_ID = 'vital-dd47f';

// Palavras-chave suspeitas para identificar dados de demonstração ou testes
const DEMO_KEYWORDS = [
  'mock', 'demo', 'sample', 'example', 'fixture', 'fake', 'dummy', 
  'placeholder', 'test', 'teste', 'demonstração', 'temporário'
];

// Coleções para auditar
const COLLECTIONS_TO_AUDIT = [
  'recipes',
  'exercises',
  'recipeCategories',
  'workoutTemplates',
  'mealPlanTemplates',
  'achievements',
  'onboardingQuestions',
  'appAnnouncements'
];

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`🔍 INICIANDO AUDITORIA DE CONTEÚDO DEMO/MOCK`);
  console.log(`Projeto Alvo: ${TARGET_PROJECT_ID}`);
  console.log(`======================================================\n`);

  try {
    // Inicializar Firebase Admin
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        projectId: TARGET_PROJECT_ID
      });
    }

    const db = getFirestore();
    const auditResults = [];

    for (const colName of COLLECTIONS_TO_AUDIT) {
      console.log(`Auditando coleção: "${colName}"...`);
      const ref = db.collection(colName);
      const snapshot = await ref.get();

      console.log(`-> Encontrados ${snapshot.size} documentos na coleção "${colName}".`);

      snapshot.forEach(doc => {
        const data = doc.data();
        let isDemo = false;
        const reasons = [];

        // 1. Verificar flag de desenvolvimento expressa
        if (data.developmentOnly === true || data.isDemo === true) {
          isDemo = true;
          reasons.push("Marcado explicitamente com 'developmentOnly: true' ou 'isDemo: true'");
        }

        // 2. Procurar termos suspeitos em campos string principais
        const searchInFields = ['name', 'title', 'slug', 'description', 'shortDescription', 'fullDescription', 'message'];
        for (const field of searchInFields) {
          if (data[field] && typeof data[field] === 'string') {
            const valLower = data[field].toLowerCase();
            for (const keyword of DEMO_KEYWORDS) {
              if (valLower.includes(keyword)) {
                isDemo = true;
                reasons.push(`Campo "${field}" contém termo suspeito "${keyword}"`);
              }
            }
          }
        }

        // 3. Verificar se imagens são placeholders ou links temporários
        if (data.media?.imageUrl) {
          const imgUrl = data.media.imageUrl.toLowerCase();
          if (imgUrl.includes('placehold.co') || imgUrl.includes('via.placeholder') || imgUrl.includes('picsum.photos') || imgUrl.includes('lorempixel')) {
            isDemo = true;
            reasons.push(`Imagem de mídia usa domínio placeholder temporário: "${data.media.imageUrl}"`);
          }
        }

        if (isDemo) {
          auditResults.push({
            id: doc.id,
            collection: colName,
            name: data.name || data.title || doc.id,
            reasons: [...new Set(reasons)],
            status: data.status || (data.active ? 'Ativo' : 'Inativo'),
            actionRecommended: colName.includes('recipe') || colName.includes('exercise') 
              ? 'Promover a production, revisar imagens ou arquivar.'
              : 'Verificar relevância e substituir por dados reais ou desativar.'
          });
        }
      });
    }

    // Gerar o relatório formatado em Markdown
    generateMarkdownReport(auditResults);

  } catch (err) {
    console.error('❌ Erro durante a auditoria:', err.message);
    console.log('Certifique-se de que possui as credenciais padrão do GCP ativas (gcloud auth application-default login).');
    process.exit(1);
  }
}

function generateMarkdownReport(results) {
  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const reportPath = path.join(docsDir, 'DEMO_CONTENT_AUDIT.md');

  let md = `# Relatório de Auditoria de Conteúdo de Demonstração\n\n`;
  md += `*Gerado automaticamente em: ${new Date().toLocaleString('pt-BR')}*\n`;
  md += `*Projeto Firebase Alvo: \`${TARGET_PROJECT_ID}\`*\n\n`;

  md += `## Resumo Executivo\n\n`;
  md += `Esta auditoria varreu o banco de dados Cloud Firestore em busca de dados de teste, mocks, placeholders de mídia ou documentos marcados para desenvolvimento que possam poluir o ambiente de produção do aplicativo **Vida Saudável**.\n\n`;
  md += `- **Total de Mocks/Demos Identificados:** ${results.length}\n`;
  md += `- **Risco:** Médio/Alto (se apresentados para usuários reais em produção)\n\n`;

  md += `## Detalhamento por Documento\n\n`;

  if (results.length === 0) {
    md += `🎉 **Excelente! Nenhum dado suspeito de demonstração foi encontrado no banco de dados real.**\n`;
  } else {
    md += `| Coleção | ID do Documento | Nome/Título | Motivos da Identificação | Status Editorial | Ação Recomendada |\n`;
    md += `| --- | --- | --- | --- | --- | --- |\n`;

    results.forEach(item => {
      const reasonsStr = item.reasons.join('<br>');
      md += `| \`${item.collection}\` | \`${item.id}\` | **${item.name}** | ${reasonsStr} | \`${item.status}\` | ${item.actionRecommended} |\n`;
    });
  }

  md += `\n## Recomendações Gerais de Produção\n\n`;
  md += `1. **Imagens de Mídia:** Certifique-se de substituir todas as URLs de \`placehold.co\` e \`picsum.photos\` por links HTTPS seguros armazenados no Firebase Storage ou CDN confiável.\n`;
  md += `2. **Configuração do AppConfig:** Garanta que no documento \`appConfig/public\` a flag \`allowDemoContent\` esteja definida como \`false\` em produção para blindar o app de dados de testes.\n`;
  md += `3. **Fluxo Editorial:** Todo conteúdo gerado deve passar pelo status de rascunho (\`draft\`) e revisão antes de se tornar \`published\`. Nunca edite conteúdo publicado diretamente em produção sem testar antes.\n`;

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`\n🎉 Relatório de auditoria gerado com sucesso em: "${reportPath}"`);
}

runAudit();
