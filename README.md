# TaskFlow

Aplicação de tarefas pessoais com **Next.js 16, React 19, TypeScript e Supabase**. Login obrigatório, dados isolados por usuário, imagens e áudios privados e estatísticas por status.

- **Aplicação:** https://taskflow-self-six.vercel.app
- **Código-fonte:** https://github.com/KenedyRodrigues/taskflow
- **Documentação:** [docs/README.md](docs/README.md)

## Funcionalidades

- Cadastro, confirmação por e-mail, login e logout com Supabase Auth.
- Rotas protegidas no servidor; visitantes são direcionados para login.
- CRUD de tarefas: título obrigatório, descrição opcional e status a fazer/em andamento/concluída.
- Busca, filtro por status e conclusão/reabertura.
- Até cinco anexos opcionais por tarefa: imagens JPEG/PNG/WebP (5 MB) e áudios MP3/M4A/WAV/OGG (20 MB).
- Storage privado, prévia de imagens e reprodução de áudio por links temporários.
- Menu lateral retrátil, preferência persistida e navegação móvel.
- Estatísticas das tarefas atuais, com contadores e gráfico acessível.
- RLS para tarefas, registros de anexos e arquivos.

## Executar localmente

Requisitos: Node.js **22.13+**, npm e projeto Supabase.

```powershell
git clone https://github.com/KenedyRodrigues/taskflow.git
cd taskflow
npm ci
Copy-Item .env.example .env.local
```

Preencha as variáveis públicas:

| Variável                             | Valor                            |
| ------------------------------------ | -------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL             | URL do projeto Supabase          |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable key (ou anon legada) |

Não use service_role. O arquivo .env.local não é versionado. Não é necessário colocar senha do banco ou chave administrativa no aplicativo.

No SQL Editor do Supabase, aplique **na ordem, uma vez cada**:

1. [Tabela tasks e RLS](supabase/migrations/202609210001_tasks.sql).
2. [Anexos e Storage privado](supabase/migrations/202609220001_attachments.sql).
3. [Valida??o de uploads](supabase/migrations/202609220002_storage_upload_validation.sql).

Se você já usa a versão original, execute **somente a segunda migração**. Elas preservam as tarefas existentes.

Em Authentication, habilite Email e configure:

- Site URL: endereço do aplicativo.
- Redirect URLs: http://localhost:3000/auth/callback, http://127.0.0.1:3100/auth/callback e https://taskflow-self-six.vercel.app/auth/callback.
- Mantenha a confirmação por e-mail ativa. Para produção, configure SMTP adequado.

```powershell
npm run dev
```

Abra http://localhost:3000. Veja o [setup detalhado](docs/setup.md) para autenticação e retorno dos links de e-mail.

## Organização

```text
src/
  app/          # Entradas de rotas, layouts, APIs e favicon do Next.js
  backend/      # Autorização, cliente do servidor, serviços e validação
  frontend/     # Interface, componentes, hooks, cliente do navegador e estilos
  proxy.ts      # Renovação dos cookies da sessão
supabase/
  migrations/   # Schema, permissões, RLS e bucket privado
scripts/        # Testes de integração do banco e Storage
tests/          # Playwright: interface e fluxos autenticados
docs/           # Arquitetura, segurança, setup, testes e deploy
```

As duas áreas principais são backend e frontend. src/app é mantida separada por convenção do App Router e delega autenticação e validação ao backend e renderização ao frontend. Um único projeto é publicado na Vercel.

## Comandos

| Comando              | Objetivo                                        |
| -------------------- | ----------------------------------------------- |
| npm run dev          | Desenvolvimento                                 |
| npm run build        | Build de produção e checagem de tipos           |
| npm run start        | Servir o build                                  |
| npm run test:unit    | Valida??o de dados e limites de anexos          |
| npm run typecheck    | TypeScript                                      |
| npm test             | Playwright desktop/celular                      |
| npm run test:rls     | CRUD e isolamento de tarefas em duas contas     |
| npm run test:storage | Isolamento e limites de anexos no Supabase real |
| npm run format       | Formatação                                      |

Antes do Playwright, execute `npx playwright install chromium`. Os testes usam a porta 3100.

Os testes autenticados precisam de duas contas de teste confirmadas. Configure TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD, TEST_USER_B_EMAIL e TEST_USER_B_PASSWORD **somente no .env.local**. Sem a senha da conta A, os testes autenticados de interface são explicitamente ignorados; os scripts de integração falham informando a variável ausente. Veja [testing.md](docs/testing.md).

## Deploy

A Vercel detecta Next.js automaticamente. Configure as duas variáveis NEXT_PUBLIC_* em Production e em Preview, preferencialmente usando projetos Supabase separados. Aplique as migrações antes de publicar a versão que depende delas.

```powershell
npx vercel login
npx vercel link
npx vercel             # Preview
npx vercel --prod      # Produção, após verificar o preview
```

A criação inicial foi publicada pela CLI. O push ao GitHub, sozinho, não garante deploy automático: isso depende da conexão do repositório em Vercel → Settings → Git. [Detalhes de deploy](docs/deployment.md).

## Escopo e uso de IA

O desafio original incluía Auth, RLS, CRUD, filtros, logout, Git e Vercel. Anexos e estatísticas são **melhorias solicitadas posteriormente**; anexos estavam fora do escopo inicial. Não foram adicionados múltiplos quadros, colaboração em tempo real ou notificações. Áudio é enviado como arquivo; não há gravação pelo microfone.

O Codex auxiliou na implementação, documentação e testes. As decisões e os limites da validação estão descritos em [ai-usage.md](docs/ai-usage.md). A arquitetura e a segurança devem ser avaliadas pelo código e pelos testes, não apenas pela geração por IA.
