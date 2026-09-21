# TaskFlow

Sistema de tarefas pessoais em **Next.js (App Router), React, TypeScript e Supabase (Postgres + Auth)**. Interface responsiva em português, cadastro/login por e-mail e senha, CRUD com título, descrição opcional e status, filtros, busca e logout.

## Setup local

Requisitos: Node.js 22.13+ e npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Preencha `.env.local` antes de iniciar e abra http://localhost:3000.

| Variável                               | Valor                                      |
| -------------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL do projeto Supabase                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública publishable (ou anon legada) |

As duas variáveis são públicas e incluídas no bundle. **Nunca use service_role ou chave secreta no frontend.** `.env.local` é ignorado pelo Git. Sem configuração, a interface mostra um aviso e não permite autenticação; não há persistência simulada.

## Banco e autenticação

1. Crie um projeto Supabase e copie a URL e a chave pública em Project Settings → API.
2. Execute `supabase/migrations/202609210001_tasks.sql` uma única vez no SQL Editor. Também é possível aplicá-la com o Supabase CLI após vincular o projeto.
3. Habilite o provedor Email em Authentication. O aplicativo suporta confirmação por e-mail: após cadastrar, o usuário confirma o link e entra com sua senha. Configure SMTP para entregas de produção.
4. Em Authentication → URL Configuration, defina a Site URL de produção e permita `http://localhost:3000` e a URL exata do deploy em Redirect URLs. Para testar localmente antes do deploy, use localhost como Site URL.
5. Reinicie o servidor local após editar as variáveis.

A tabela `public.tasks` tem UUID, proprietário (`auth.uid()`), título obrigatório (1–160 caracteres após trim), descrição opcional (até 2.000), status (`todo`, `doing`, `done`) e timestamps. O banco atualiza `updated_at` por trigger.

RLS está habilitado e forçado. Há políticas separadas de SELECT, INSERT, UPDATE e DELETE limitadas a usuários autenticados e `auth.uid() = user_id`. O papel anônimo não recebe acesso. Privilégios de coluna impedem atribuir ou alterar proprietário, ID e timestamps pela API. A aplicação usa o cliente Supabase no navegador e sessões persistidas pelo SDK; a proteção dos dados está no Postgres, não na visibilidade de componentes React. Ao mudar a conta, os dados locais são descartados e respostas de requisições anteriores são ignoradas.

## Verificações

```powershell
npm run build
npm run typecheck
npx playwright install chromium
npm test
```

Para verificar o banco real, crie **duas contas de teste diferentes e confirmadas** e adicione somente em `.env.local`:

```dotenv
TEST_USER_A_EMAIL=conta-a@exemplo.com
TEST_USER_A_PASSWORD=senha-da-conta-a
TEST_USER_B_EMAIL=conta-b@exemplo.com
TEST_USER_B_PASSWORD=senha-da-conta-b
```

```powershell
npm run test:rls
```

O teste cria e limpa sua própria tarefa, verifica CRUD, os três status, restrições de título/status, bloqueio anônimo, isolamento de leitura/edição/exclusão e tentativa de alterar/forjar proprietário. Não usa service_role. Execute contra um projeto de teste. Uma execução interrompida pode deixar a tarefa identificada pelo título `TaskFlow: teste de isolamento`.

Verificação manual: cadastrar, confirmar e-mail, entrar, criar tarefa com e sem descrição, editar título/descrição/status, filtrar, buscar, concluir/reabrir, cancelar/confirmar exclusão, recarregar e sair. Entrar com a segunda conta e confirmar que as tarefas da primeira não aparecem. Testar teclado, Escape nos diálogos e largura de celular.

## Deploy público na Vercel

1. Publique este repositório em seu provedor Git e importe-o em https://vercel.com/new.
2. Selecione o preset **Next.js** e Node.js 22.x ou superior. Use `npm run build` como comando de build; mantenha o output padrão.
3. Adicione as duas variáveis `NEXT_PUBLIC_*` acima para Production (e Preview, se desejado).
4. Faça o deploy e inclua a URL `https://seu-projeto.vercel.app` na configuração de Auth do Supabase.
5. Abra a URL pública e execute o checklist de cadastro/CRUD/logout.

Alternativa pelo terminal: `npx vercel login`, `npx vercel link`, `npx vercel env add NEXT_PUBLIC_SUPABASE_URL production`, `npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production`, `npx vercel --prod`. As variáveis públicas são resolvidas no build: alterações exigem novo deploy.

A publicação requer acesso à sua conta Vercel e a configuração do projeto Supabase. Deploy de produção: https://taskflow-self-six.vercel.app. Configure esse endereço em Authentication → URL Configuration do Supabase, como Site URL e Redirect URL.

## Estrutura

- `app/page.tsx`: painel, autenticação, formulários e operações de tarefas.
- `app/globals.css`: layout responsivo e estilos.
- `lib/supabase.ts`: cliente com chave pública.
- `supabase/migrations/`: schema, grants, políticas RLS e trigger.
- `scripts/test-rls.mjs`: integração com duas contas reais.

Fora do escopo: múltiplos quadros, colaboração em tempo real, notificações e anexos.

Referências: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase Auth](https://supabase.com/docs/guides/auth), [Next.js na Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).

Os testes Playwright verificam o painel sem sessão, busca/filtros, responsividade e diálogo de autenticação em desktop e celular. Eles não substituem o teste de integração RLS contra o Supabase real.
