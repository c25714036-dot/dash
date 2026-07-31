# Checklist de Preparação para o Modo de Produção

Este checklist ajuda a garantir que tanto o **Painel Administrativo** quanto o **Aplicativo Mobile Vida Saudável** estejam 100% integrados, livres de dados fictícios/mocks e prontos para o lançamento oficial de produção com total segurança.

---

## 📋 Checklist Técnico e Arquitetural

### 1. Conexão e Ambiente
- [x] **Projeto Firebase Correto:** Ambos utilizam o projeto oficial real `vital-dd47f`.
- [x] **Emuladores Desativados:** `ENABLE_FIREBASE_EMULATOR=false` configurado (sem localhost ou portas locais).
- [x] **Configurações Estruturais:** `appConfig/public` configurado com `environment: "production"` e `allowDemoContent: false`.
- [x] **Avisos Reais:** Coleção `appAnnouncements` livre de mensagens ou avisos de teste.

### 2. Fluxos Editorial e de Publicação Atômica
- [x] **Fluxo Editorial Estrito:** Transições `draft` ➔ `inReview` ➔ `approved` ➔ `published` funcionais.
- [x] **Publicação com Manifesto:** Incremento de versões em `contentManifest/public` ocorrendo em lote (`writeBatch`) atômico.
- [x] **Auditoria Administrativa:** Toda publicação de conteúdos é registrada de forma segura na coleção `adminAuditLogs`.
- [x] **Snapshots de Versões:** Coleção `contentVersions` salvando o estado anterior de qualquer documento alterado.

### 3. Integração de Módulos (Sem Mocks)
- [x] **Módulo de Receitas:** Receitas e suas subcoleções carregadas e salvas no Firestore real.
- [x] **Categorias e Ingredientes:** Inteiramente baseados nos dados gerenciados no painel.
- [x] **Módulo de Exercícios e Equipamentos:** Dados de treinos estruturados e músculos-alvo sem mocks.
- [x] **Modelos de Treino e Planos Alimentares:** Templates lidos e duplicados para a coleção pessoal do usuário (`userWorkoutPlans` / `userMealPlans`) para total independência.
- [x] **Fluxo de Onboarding:** Perguntas dinâmicas controladas de forma segura pelo `onboardingConfig/public` e `onboardingFlows`.
- [x] **Conquistas:** Conquistas reais carregadas de `achievements`.

### 4. Cache e Desempenho Offline
- [x] **Sincronização por Versão:** O app móvel monitora apenas o manifesto e baixa apenas o que mudou.
- [x] **Funcionamento Offline:** Aplicativo exibe dados cacheados se estiver offline.
- [x] **Prevenção de Loops:** Sem listeners desnecessários no catálogo completo.

### 5. Segurança e Regras de Acesso
- [x] **Segurança por Claims:** Permissões baseadas nas claims de role (`superAdmin`, `contentEditor`, etc.) nos tokens JWT.
- [x] **Regras do Firestore:** `firestore.rules` atualizado proibindo escrita por usuários comuns nas coleções globais.
- [x] **Isolamento de Dados Pessoais:** Regras de segurança bloqueando o usuário A de ler/escrever dados pessoais do usuário B.

---

## 🛠️ Comandos Administrativos (Cloud Shell / CLI local)

### Atribuir permissão de Super Administrador para o seu e-mail:
```bash
npm run set:admin -- --uid=UID_DO_SEU_USUARIO --role=superAdmin
```

### Auditar banco de dados em busca de termos mock/demo:
```bash
node scripts/audit-demo-content.cjs
```

### Preparar o banco de dados e promover rascunhos para produção:
```bash
node scripts/migrate-to-production.cjs
```
