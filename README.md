# TaskFlow

AplicaÃ§Ã£o de tarefas pessoais com **Next.js 16, React 19, TypeScript e Supabase**. Login obrigatÃ³rio, dados isolados por usuÃ¡rio, imagens e Ã¡udios privados e estatÃ­sticas por status.

- **AplicaÃ§Ã£o:** https://taskflow-self-six.vercel.app
- **CÃ³digo-fonte:** https://github.com/KenedyRodrigues/taskflow
- **DocumentaÃ§Ã£o:** [docs/README.md](docs/README.md)

## Funcionalidades

- Cadastro, confirmaÃ§Ã£o por e-mail, login e logout com Supabase Auth.
- Rotas protegidas no servidor; visitantes sÃ£o direcionados para login.
- CRUD de tarefas: tÃ­tulo obrigatÃ³rio, descriÃ§Ã£o opcional e status a fazer/em andamento/concluÃ­da.
- Busca, filtro por status e conclusÃ£o/reabertura.
- AtÃ© cinco anexos opcionais por tarefa: imagens JPEG/PNG/WebP (5 MB) e Ã¡udios MP3/M4A/WAV/OGG (20 MB).
- Storage privado, prÃ©via de imagens e reproduÃ§Ã£o de Ã¡udio por links temporÃ¡rios.
- Menu lateral retrÃ¡til, preferÃªncia persistida e navegaÃ§Ã£o mÃ³vel.
- EstatÃ­sticas das tarefas atuais, com contadores e grÃ¡fico acessÃ­vel.
- RLS para tarefas, registros de anexos e arquivos.

## Executar localmente

Requisitos: Node.js **22.13+**, npm e projeto Supabase.

```powershell
git clone https://github.com/KenedyRodrigues/taskflow.git
cd taskflow
npm ci
Copy-Item .env.example .env.local
```

Preencha as variÃ¡veis pÃºblicas:

| VariÃ¡vel                            | Valor                            |
| ------------------------------------ | -------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL             | URL do projeto Supabase          |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable key (ou anon legada) |

NÃ£o use service_role. O arquivo .env.local nÃ£o Ã© versionado. NÃ£o Ã© necessÃ¡rio colocar senha do banco ou chave administrativa no aplicativo.

No SQL Editor do Supabase, aplique **na ordem, uma vez cada**:

1. [Tabela tasks e RLS](supabase/migrations/202609210001_tasks.sql).
2. [Anexos e Storage privado](supabase/migrations/202609220001_attachments.sql).
3. [Valida??o de uploads](supabase/migrations/202609220002_storage_upload_validation.sql).
4. [Compatibilidade do upload no navegador](supabase/migrations/202609220004_storage_browser_compatibility.sql).

Se vocÃª jÃ¡ usa a versÃ£o original, execute **somente a segunda migraÃ§Ã£o**. Elas preservam as tarefas existentes.

Em Authentication, habilite Email e configure:

- Site URL: endereÃ§o do aplicativo.
- Redirect URLs: http://localhost:3000/auth/callback, http://127.0.0.1:3100/auth/callback e https://taskflow-self-six.vercel.app/auth/callback.
- Mantenha a confirmaÃ§Ã£o por e-mail ativa. Para produÃ§Ã£o, configure SMTP adequado.

```powershell
npm run dev
```

Abra http://localhost:3000. Veja o [setup detalhado](docs/setup.md) para autenticaÃ§Ã£o e retorno dos links de e-mail.

## OrganizaÃ§Ã£o

```text
src/
  app/          # Entradas de rotas, layouts, APIs e favicon do Next.js
  backend/      # AutorizaÃ§Ã£o, cliente do servidor, serviÃ§os e validaÃ§Ã£o
  frontend/     # Interface, componentes, hooks, cliente do navegador e estilos
  proxy.ts      # RenovaÃ§Ã£o dos cookies da sessÃ£o
supabase/
  migrations/   # Schema, permissÃµes, RLS e bucket privado
scripts/        # Testes de integraÃ§Ã£o do banco e Storage
tests/          # Playwright: interface e fluxos autenticados
docs/           # Arquitetura, seguranÃ§a, setup, testes e deploy
```

As duas Ã¡reas principais sÃ£o backend e frontend. src/app Ã© mantida separada por convenÃ§Ã£o do App Router e delega autenticaÃ§Ã£o e validaÃ§Ã£o ao backend e renderizaÃ§Ã£o ao frontend. Um Ãºnico projeto Ã© publicado na Vercel.

## Comandos

| Comando              | Objetivo                                        |
| -------------------- | ----------------------------------------------- |
| npm run dev          | Desenvolvimento                                 |
| npm run build        | Build de produÃ§Ã£o e checagem de tipos         |
| npm run start        | Servir o build                                  |
| npm run test:unit    | Valida??o de dados e limites de anexos          |
| npm run typecheck    | TypeScript                                      |
| npm test             | Playwright desktop/celular                      |
| npm run test:rls     | CRUD e isolamento de tarefas em duas contas     |
| npm run test:storage | Isolamento e limites de anexos no Supabase real |
| npm run format       | FormataÃ§Ã£o                                    |

Antes do Playwright, execute `npx playwright install chromium`. Os testes usam a porta 3100.

Os testes autenticados precisam de duas contas de teste confirmadas. Configure TEST_USER_A_EMAIL, TEST_USER_A_PASSWORD, TEST_USER_B_EMAIL e TEST_USER_B_PASSWORD **somente no .env.local**. Sem a senha da conta A, os testes autenticados de interface sÃ£o explicitamente ignorados; os scripts de integraÃ§Ã£o falham informando a variÃ¡vel ausente. Veja [testing.md](docs/testing.md).

## Deploy

A Vercel detecta Next.js automaticamente. Configure as duas variÃ¡veis NEXT_PUBLIC_* em Production e em Preview, preferencialmente usando projetos Supabase separados. Aplique as migraÃ§Ãµes antes de publicar a versÃ£o que depende delas.

```powershell
npx vercel login
npx vercel link
npx vercel             # Preview
npx vercel --prod      # ProduÃ§Ã£o, apÃ³s verificar o preview
```

A criaÃ§Ã£o inicial foi publicada pela CLI. O push ao GitHub, sozinho, nÃ£o garante deploy automÃ¡tico: isso depende da conexÃ£o do repositÃ³rio em Vercel â†’ Settings â†’ Git. [Detalhes de deploy](docs/deployment.md).

## Escopo e uso de IA

O desafio original incluÃ­a Auth, RLS, CRUD, filtros, logout, Git e Vercel. Anexos e estatÃ­sticas sÃ£o **melhorias solicitadas posteriormente**; anexos estavam fora do escopo inicial. NÃ£o foram adicionados mÃºltiplos quadros, colaboraÃ§Ã£o em tempo real ou notificaÃ§Ãµes. Ãudio Ã© enviado como arquivo; nÃ£o hÃ¡ gravaÃ§Ã£o pelo microfone.

O Codex auxiliou na implementaÃ§Ã£o, documentaÃ§Ã£o e testes. As decisÃµes e os limites da validaÃ§Ã£o estÃ£o descritos em [ai-usage.md](docs/ai-usage.md). A arquitetura e a seguranÃ§a devem ser avaliadas pelo cÃ³digo e pelos testes, nÃ£o apenas pela geraÃ§Ã£o por IA.
