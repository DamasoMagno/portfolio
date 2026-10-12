# Portfolio

Portfólio em Next.js 15, React 19, TypeScript e Tailwind 4, com backoffice e arquitetura de monólito modular. O Supabase persiste conteúdo, posts, mensagens e analytics. O formulário recebe contatos diretamente no backoffice; não usa Resend nem envia e-mails.

## Rodar localmente

```sh
npm ci
cp -n .env.example .env.local
# Preencha a conexão do Supabase e as credenciais administrativas.
npm run dev:local
```

Portfólio: http://127.0.0.1:3000. Painel: http://127.0.0.1:3000/backoffice.

## Supabase

Configure no ambiente do servidor:

```dotenv
PORTFOLIO_STORAGE=supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
BACKOFFICE_ADMIN_EMAIL=seu-email
BACKOFFICE_PASSWORD=sua-senha
BACKOFFICE_SESSION_SECRET=segredo-aleatorio-com-no-minimo-32-caracteres
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
ANALYTICS_ENABLED=true
```

A chave secreta fica somente no servidor, sem prefixo `NEXT_PUBLIC`. `SUPABASE_SERVICE_ROLE_KEY` aceita a chave legada service_role como alternativa. A URL também pode vir de `NEXT_PUBLIC_SUPABASE_URL`; a chave pública não dá acesso aos dados privados do backoffice. O login do proprietário continua independente do Supabase Auth.

Execute as migrações de [supabase/migrations](supabase/migrations) em ordem no SQL Editor, ou use `npm run supabase:setup` para aplicar todas. São idempotentes. A migração inicial cria:

- `portfolio_documents`: documentos JSONB de conteúdo e posts, com revisão para impedir sobrescritas entre requisições/instâncias.
- `portfolio_analytics_events`: eventos individuais, identificador único, data do servidor e retenção.
- Funções de leitura/gravação, importação e controle transacional.

As tabelas têm RLS habilitado e nenhum acesso para `anon` ou `authenticated`. Somente o backend com chave secreta acessa os dados. As API Routes verificam o acesso administrativo antes de entregar contatos, rascunhos e relatórios. A política pública das APIs retorna apenas conteúdo publicado.

Se houver `psql` instalado, também é possível aplicar a migração pela conexão PostgreSQL:

```dotenv
# Somente para o script de configuração, não é necessário para executar o site.
SUPABASE_DB_PASSWORD=sua-senha-do-postgres
# Opcionais: substitua pela conexão do pooler se sua rede não acessar o host direto.
SUPABASE_DB_HOST=
SUPABASE_DB_USER=
SUPABASE_DB_PORT=
SUPABASE_DB_NAME=postgres
```

```sh
npm run supabase:setup -- --check
npm run supabase:setup
npm run supabase:check
```

`supabase:check` valida a conexão e os dados sem gravar. `supabase:setup` usa uma conexão PostgreSQL com TLS e senha no ambiente do processo; não coloca a senha nos argumentos do comando.

## Importar dados locais

Antes de começar a editar no Supabase, importe os arquivos existentes em `.data`:

```sh
npm run supabase:import -- --dry-run
npm run supabase:import
```

A importação valida conteúdo, posts e analytics e grava tudo em uma transação. Se os arquivos não existirem, usa o conteúdo inicial do repositório, blog desativado e histórico vazio. Preserva o estado de exibição do blog e os rascunhos existentes. As revisões começam em 1 no banco. Os arquivos locais são preservados. A importação recusa sobrescrever um banco que já tenha dados do portfólio; não a execute novamente após começar a editar no banco.

Após migrar, a aplicação não depende de disco persistente. Pode executar em múltiplas instâncias Node ou hospedagem serverless com runtime Node. Erros do Supabase não causam gravações de fallback nos arquivos locais.

Para desenvolver sem banco, defina explicitamente `PORTFOLIO_STORAGE=local`. Os arquivos ficam em `.data/portfolio.json`, `.data/posts.json` e `.data/analytics.json`; os caminhos podem ser ajustados por `PORTFOLIO_DATA_FILE`, `PORTFOLIO_POSTS_FILE` e `PORTFOLIO_ANALYTICS_FILE`. O modo local é bloqueado em produção. Sem seleção e sem conexão configurada, desenvolvimento usa arquivos; produção exige Supabase.

## Recursos

- Perfil, projetos, habilidades, experiências, serviços e recomendações: cadastro, rascunhos, ordenação e publicação.
- Sobre mim: quebras de linha preservadas, formatação Markdown e prévia com o mesmo componente usado no portfólio.
- Projetos: capturas reais, contexto/problema, participação e resultados opcionais, filtros e detalhes.
- Posts: Markdown com prévia, slug único, tags, resumo, capa, rascunhos e agendamento.
- Mensagens: nome, e-mail, tipo de projeto e breve descrição; pesquisa, leitura, arquivamento e marcação como lida. O visitante recebe sucesso somente após a persistência confirmar o recebimento.
- Analytics: visualizações, sessões, origens, dispositivos, cliques e contatos confirmados em períodos de 7, 30 ou 90 dias.

O interruptor **Exibir seção de posts** controla a home, o header, `/blog`, páginas individuais e sitemap. Desativar preserva os artigos e oculta as rotas públicas. Rascunhos e posts com data futura não são retornados publicamente. A publicação agendada é resolvida na leitura, em UTC, sem tarefas externas. Alterar um slug muda o endereço público; não há redirecionamento automático.

Foto, currículo e capturas estão em `public`. Imagens também aceitam URLs HTTP/HTTPS. O backoffice permite enviar foto do perfil e capas de projetos/posts ao Supabase Storage pela interface S3.

## Arquitetura e Repository Pattern

O fluxo das requisições do navegador é **API Route → serviço do módulo → interface de repositório → implementação → Supabase**. Rotas validam acesso/origem e adaptam HTTP; regras de publicação e edição ficam nos serviços. SQL, transporte REST e escrita em disco ficam nas implementações de persistência.

- `src/modules/content/repositories/contracts.ts`: `ContentRepository`.
- `src/modules/posts/repositories/contracts.ts`: `PostsRepository`.
- `src/modules/analytics/repositories/contracts.ts`: `AnalyticsRepository`.
- Implementações `supabase-*.ts` e adaptadores `local-*-adapter.ts`: cumprem os mesmos contratos.
- Arquivos `*-repository.ts`: composição das implementações conforme o ambiente.
- `src/modules/storage`: configuração, cliente REST exclusivo do servidor e persistência compartilhada de documentos.
- `src/modules/media`: upload, processamento de imagens e contrato `ImageStorageRepository`, com implementação S3.
- `src/modules/messages/services`: recebimento e gerenciamento dos contatos.
- `src/modules/backoffice`: autenticação e estrutura administrativa.
- `src/components/ui`: componentes compartilhados.

Para trocar o banco, implemente os contratos e ajuste a composição. Serviços, API Routes e componentes não precisam conhecer o novo driver. Os Server Components usam os mesmos serviços para a renderização inicial, sem executar SQL ou fazer chamadas HTTP ao próprio servidor. Componentes do navegador usam API Routes; não recebem chave secreta nem acessam o banco.

APIs públicas:

- `GET /api/portfolio`: perfil e coleções publicadas; nunca inclui mensagens.
- `GET /api/posts`: configuração pública e posts visíveis.
- `GET /api/posts/[slug]`: post publicado; retorna 404 para ocultos/rascunhos/agendados.
- `POST /api/contact`: recebe a mensagem no backoffice.
- `POST /api/analytics`: eventos públicos validados.

APIs administrativas, todas protegidas:

- `/api/backoffice/[resource]`: conteúdo, perfil e status de mensagens.
- `/api/backoffice/posts`: artigos e configuração do blog.
- `/api/backoffice/analytics`: relatórios.
- `/api/backoffice/session`: login e logout do proprietário.
- `/api/backoffice/jobs`: vagas e análise ATS, somente para o proprietário.
- `POST /api/backoffice/images`: upload multipart autenticado.

## Autenticação e analytics

O painel aceita somente o e-mail e senha definidos no servidor. A sessão tem assinatura HMAC e duração de 12 horas, cookie HttpOnly/SameSite Strict e Secure em produção. Alterar e-mail ou senha invalida sessões anteriores. Todas as gravações administrativas verificam a origem da requisição. Sem credenciais configuradas, o painel permanece bloqueado.

Analytics não armazena IP, parâmetros de URL, referência completa ou dados de formulários. Um identificador aleatório em `sessionStorage` agrupa a sessão por aba, com expiração após 30 minutos sem atividade. Dispositivos são estimados pelo navegador; dias usam UTC. Administradores autenticados, bots conhecidos e Do Not Track são excluídos. `ANALYTICS_ENABLED=false` interrompe a coleta sem apagar os dados.

O banco mantém até 90 dias e 50 mil eventos, com deduplicação e limpeza na gravação. A API pública de eventos tem limite por processo de 60 eventos/sessão/minuto. Esse limitador não é global entre instâncias. A conversão de contato é registrada no servidor após salvar a mensagem; visitantes não podem enviá-la pela API de analytics. A taxa usa sessões únicas com visita e contato confirmado no período. Cliques em WhatsApp/CV medem interesse, não conversa ou download concluído.

## Produção e verificação

Use Node.js 22, configure as variáveis na hospedagem (incluindo o domínio HTTPS em `NEXT_PUBLIC_SITE_URL`) e execute:

```sh
npm ci
npm run build
npm start
```

Não publique `.env.local` nem `.data`. Com Supabase ativo, dados novos e edições são persistidos no banco, não no disco da hospedagem.

```sh
npm run test:backoffice
npx tsc --noEmit
npm run build
# Opcional: exige Docker e imagem postgres:16-alpine disponível localmente.
npm run test:supabase:sql
```

Os testes cobrem publicação, validação, autenticação, conflitos de revisão, mensagens concorrentes, falhas de persistência, analytics, posts, adaptadores Supabase e upload (conversão WebP, conteúdo falsificado, limites multipart e proteção da API). O teste SQL usa um PostgreSQL isolado e verifica migração idempotente, grants/RLS, retenção, deduplicação e importação transacional.

## Imagens via S3

Configure `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` e `S3_PUBLIC_BASE_URL` conforme `.env.example`. Para Supabase, o endpoint termina em `/storage/v1/s3`; a URL pública termina em `/storage/v1/object/public/images` para o bucket público `images`. O nome da credencial S3 não é o nome do bucket. Nunca use prefixo `NEXT_PUBLIC` nas credenciais.

`npm run s3:check` verifica acesso ao bucket sem enviar arquivos. Os campos de foto e capa mantêm a opção de URL manual e oferecem envio de JPEG, PNG, WebP ou AVIF de até 4 MB, sem animação. O backend limita o corpo mesmo sem Content-Length, valida o conteúdo, remove metadados e converte para WebP. Redimensiona até 1200 px no perfil e 2400 px nas capas, mantendo a proporção. Os objetos recebem identificadores aleatórios e URLs estáveis; salvar o formulário aplica a imagem ao conteúdo. Uploads não associados e imagens substituídas permanecem no bucket até remoção pelo administrador. O currículo continua como arquivo/URL.

Em produção, configure Supabase e S3 no ambiente do servidor, as três variáveis de autenticação e o domínio HTTPS. A migração e a importação inicial devem existir antes do deploy; não repita a importação após editar no banco. A hospedagem precisa permitir requisições multipart acima de 4 MB e runtime Node, sem exportação estática.

## Vagas privadas e análise ATS

`/backoffice/vagas` cadastra empresa, cargo, link, localização, modelo de trabalho, etapa da candidatura, senioridade, contrato, faixa salarial, idiomas, prazo, contato, descrição, responsabilidades, benefícios, requisitos obrigatórios/desejáveis, observações e texto opcional do currículo. Não há seção pública, link no portfólio, rota pública nem entrada no sitemap.

O módulo `src/modules/jobs` segue API Route → serviço → contrato `JobsRepository` → Supabase/local. A migração `supabase/migrations/202610120002_jobs.sql` cria `portfolio_jobs` e a RPC de revisão atômica. RLS e grants permitem acesso somente pelo servidor. `supabase:setup` aplica todas as migrações em ordem. Desenvolvimento local pode usar `PORTFOLIO_JOBS_FILE`; produção usa Supabase.

A análise `ats-keywords-v1` funciona sem IA, sem chaves externas e sem envio de dados a terceiros. Considera perfil, habilidades, experiências, projetos, serviços, recomendações e posts, incluindo rascunhos, além do currículo colado. Exclui mensagens de visitantes e analytics. Não lê automaticamente o PDF do perfil ou o link da vaga; cole a descrição e, se desejar, o texto do currículo.

Normaliza acentos, reconhece aliases de tecnologias e usa limites de palavras (Java não corresponde a JavaScript). Extrai termos técnicos conhecidos e palavras relevantes da descrição/requisitos. Cada termo é contado uma vez; obrigatórios têm peso 2, desejáveis/descrição peso 1. Serviços, materiais recomendados e posts são exibidos como contexto, mas não comprovam experiência na pontuação. Exigências de tempo, idioma, formação e alternativas recebem indicação de revisão manual. Cobertura textual não mede senioridade, fluência, tempo de experiência, qualidade do currículo ou probabilidade de aprovação e não reproduz algoritmos proprietários de ATS.

Cada vaga guarda as últimas 10 análises, incluindo versões dos dados, evidências, sugestões, rascunho de currículo (TXT/Markdown) e mensagem de candidatura. O currículo prioriza experiências/projetos conforme os termos encontrados e usa fatos estruturados existentes; não inventa formação ou competências ausentes. Dados presentes somente no currículo colado devem ser mantidos manualmente na versão final. Edite o arquivo exportado antes de enviar. Nenhuma candidatura é enviada automaticamente.

### Sugestões opcionais com OpenAI

Configure `OPENAI_API_KEY` apenas no servidor e, opcionalmente, `OPENAI_MODEL` (padrão `gpt-4.1-mini`). Em Vercel, importe as variáveis e faça um novo deploy. O botão **Analisar com IA** só é habilitado quando a chave está configurada. A chamada ocorre exclusivamente na API autenticada do backoffice; o portfólio público não recebe a chave nem as análises.

O provedor implementa `JobAnalysisProvider`, separado da persistência e da comparação ATS. A Responses API recebe somente a descrição/requisitos da vaga e registros profissionais; mensagens de visitantes, analytics, credenciais e contato da candidatura são excluídos. Os registros têm limite de 60 mil caracteres (12 mil por registro), com indicação de truncamento. `store: false`, resposta estruturada validada e tempo limite de 45 segundos. Referências a registros inexistentes, recusas e respostas incompletas são rejeitadas. Sugestões precisam de revisão humana; não comprovam qualificações. A pontuação e o currículo determinístico continuam disponíveis. Falhas/quota da OpenAI não gravam análises parciais; revisões concorrentes não são sobrescritas.

Na lista **Habilidades** do backoffice, **Mostrar/Esconder** altera a publicação de cada stack, preservando seus dados e tecnologias. Grupos ocultos continuam disponíveis no admin e como contexto profissional para análise de vagas.

### Currículo em PDF

Em **Backoffice → Currículo**, selecione um PDF válido de até 4 MB e clique em **Enviar e publicar currículo**. A API exige sessão do proprietário e mesma origem, valida o PDF sem senha/ações automáticas/anexos e envia pelo S3 existente. O bucket deve ser público e aceitar `application/pdf` (o bucket atual já aceita). Somente o link `profile.resume` é atualizado, com controle de revisão. Em conflito, o upload não aplicado é removido. Arquivos anteriores não são excluídos automaticamente. O PDF fica público pelo botão **Baixar CV**. A análise de vagas continua usando o texto informado no formulário; este upload não extrai automaticamente texto do PDF.

### SEO e metadados

O título, descrição, palavras-chave, JSON-LD Person/WebSite e imagens sociais refletem o perfil e as stacks publicadas. Posts publicados têm canonical próprio, Open Graph de artigo, Twitter e BlogPosting. Filtros/buscas do blog recebem noindex, com canonical para `/blog`. O sitemap exclui admin, rascunhos, posts futuros e blog desativado, usando datas persistidas em vez da data da consulta. Backoffice/APIs têm `X-Robots-Tag`; previews recebem noindex e robots bloqueado.

Defina `NEXT_PUBLIC_SITE_URL` com a origem HTTPS pública (sem caminho, parâmetros ou credenciais). Na Vercel, quando omitida, a aplicação usa `VERCEL_PROJECT_PRODUCTION_URL`. Domínio local ou HTTP explícito em produção é rejeitado para evitar canonical incorreto. SEO técnico não garante indexação ou posicionamento; verifique o domínio/sitemap no Google Search Console após publicar.
