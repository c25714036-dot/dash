# Integração Painel Administrativo ↔ Aplicativo Vida Saudável

Este documento descreve a arquitetura, o fluxo de dados, as regras de sincronização, a segurança e a publicação de conteúdos entre o **Painel Administrativo Web** e o **Aplicativo Mobile Vida Saudável** usando o **Cloud Firestore** como fonte oficial e centralizada de dados.

---

## 1. Arquitetura de Comunicação Centralizada

Toda a comunicação e compartilhamento de dados entre o Painel e o Aplicativo ocorre de forma desacoplada através do **Cloud Firestore (Firebase)** real no projeto oficial `vital-dd47f`.

```
PAINEL ADMINISTRATIVO (Web)
        │  (Gravações atômicas, Snapshots de versão, Logs de auditoria)
        ▼
CLOUD FIRESTORE (Banco de dados de Produção)
        ▲
        │  (Leituras otimizadas, Respeito a flags de produção, Cache offline)
APLICATIVO VIDA SAUDÁVEL (Mobile)
```

- **O Painel escreve:** Modifica, revisa e publica conteúdos.
- **O Firestore armazena:** Mantém os dados duráveis, o histórico de versões e as regras de segurança aplicadas por coleção.
- **O Aplicativo lê:** Consome somente dados publicados e homologados para produção.
- **Sem comunicação direta:** O painel e o aplicativo **nunca** se comunicam diretamente via HTTP ou APIs personalizadas. O Firestore atua como a única camada de persistência e mensagens.

---

## 2. Fluxo Editorial de Conteúdo (Workflows)

Para garantir que conteúdos em andamento, de teste ou de rascunho não poluam a experiência dos usuários finais no aplicativo móvel, foi implementado um fluxo editorial estrito com os seguintes status:

```
[ draft ] ──► [ inReview ] ──► [ approved ] ──► [ published ]
                                                   │
                                                   ▼ (Opcional)
                                              [ archived ]
```

### Regras de Exibição
- **Status Permitidos no Aplicativo:** Apenas documentos com `status == "published"` e `developmentOnly != true` são exibidos aos usuários finais no aplicativo.
- **Status Administrativos:** `draft`, `inReview`, `changesRequested`, `approved` e `archived` são visíveis apenas no Painel Administrativo por usuários autorizados.
- **Arquivamento Seguro:** Quando um conteúdo é arquivado (`archived`), ele é removido das listagens principais do aplicativo para novos acessos, mas dados históricos já referenciados em registros pessoais de usuários (como treinos realizados ou receitas consumidas) são preservados de forma íntegra.

---

## 3. Manifesto de Conteúdo (`contentManifest/public`)

Para evitar consultas de listeners constantes (`onSnapshot`) em coleções massivas de dados (como receitas ou exercícios), o aplicativo móvel realiza uma sincronização seletiva baseada em versões por meio do documento `contentManifest/public`.

### Estrutura do Manifesto
O documento armazena o número da versão atual de cada módulo de conteúdo gerenciável:

```json
{
  "recipesVersion": 1,
  "exercisesVersion": 1,
  "workoutTemplatesVersion": 1,
  "mealPlansVersion": 1,
  "categoriesVersion": 1,
  "ingredientsVersion": 1,
  "allergensVersion": 1,
  "achievementsVersion": 1,
  "onboardingVersion": 1,
  "announcementsVersion": 1,
  "appConfigVersion": 1,
  "lastPublishedAt": "2026-07-31T20:30:00.000Z",
  "updatedAt": "2026-07-31T20:30:00.000Z"
}
```

### Mecanismo de Atualização no Painel
Sempre que um administrador clica em **Publicar** no painel:
1. O documento de conteúdo é atualizado para `status = "published"`.
2. Os timestamps `publishedAt` e `updatedAt` são gravados.
3. A respectiva chave do manifesto de conteúdo (por exemplo, `recipesVersion` ao publicar uma receita) é incrementada atomicamente no Firestore usando o operador `increment(1)`.
4. Uma cópia da versão anterior do documento é salva na coleção de snapshots de versão (`contentVersions/{id}/versions`).
5. Um registro é gerado na coleção de auditoria administrada (`adminAuditLogs`).
6. **Gravação Atômica:** Todos os passos de modificação e incremento são agrupados e executados em uma única chamada de lote (`writeBatch`) do Firestore para evitar estados parciais e inconsistentes.

### Mecanismo de Sincronização no Aplicativo
Ao inicializar ou ser atualizado:
1. O aplicativo lê apenas o documento `contentManifest/public`.
2. Compara o número das versões remotas com as versões armazenadas localmente no cache seguro (`localStorage` ou similar).
3. Se houver discrepância (ex: versão remota `recipesVersion` é `15` e local é `12`), o aplicativo invalida o cache antigo daquele módulo específico e faz uma consulta pontual à coleção (ex: busca receitas onde `status == "published"`).
4. Grava a nova versão local e atualiza o cache para uso offline imediato.

---

## 4. Segurança e Controle de Acessos (Claims e Rules)

A proteção do banco de dados Cloud Firestore é controlada por meio de regras estritas em `firestore.rules` acopladas aos papéis administrativos configurados nos Custom Claims do Firebase Authentication.

### Perfis de Acesso (Roles)
- `superAdmin` / `admin`: Acesso completo. Podem criar, editar, aprovar, publicar e arquivar qualquer recurso do ecossistema.
- `contentEditor`: Podem criar e editar rascunhos de receitas e exercícios (`draft`). Não têm permissão para aprovar ou publicar.
- `nutritionReviewer`: Revisa e edita receitas e ingredientes. Não tem acesso para publicar ou editar treinos/exercícios.
- `exerciseReviewer`: Revisa e edita exercícios e modelos de treino. Não tem acesso a receitas ou planos alimentares.
- `support`: Perfil de leitura de relatórios e atendimento ao cliente. Não pode modificar conteúdo global.

---

## 5. Práticas para Ambiente de Produção Offline

- **Cache do Firebase:** O Firebase Firestore possui persistência offline nativa ativada no aplicativo. Se o usuário perder a conexão, o aplicativo servirá de forma transparente a última versão válida de receitas, treinos e planos alimentares armazenada no cache local sem quebrar a interface do usuário.
- **Imagens e Mídias:** Todos os placeholders e mocks de imagem de domínios temporários foram substituídos por URLs CDN oficiais com suporte a cache ou assets de mídia locais protegidos.
