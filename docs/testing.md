# Testes

## Preparação

Use preferencialmente um projeto Supabase de teste, com as duas migrações. Crie duas contas diferentes e confirme os e-mails.

No .env.local, adicione:

```dotenv
TEST_USER_A_EMAIL=conta-a@exemplo.com
TEST_USER_A_PASSWORD="senha-da-conta-a"
TEST_USER_B_EMAIL=conta-b@exemplo.com
TEST_USER_B_PASSWORD="senha-da-conta-b"
```

Nunca faça commit desse arquivo. Os testes criam suas próprias tarefas identificadas e tentam limpá-las ao terminar. Interromper o processo pode exigir limpeza manual.

## Comandos

```powershell
npm run build
npm run typecheck
npm run test:unit
npx playwright install chromium
npm test
npm run test:rls
npm run test:storage
```

Playwright usa a porta 3100 e um worker, com projetos desktop e mobile. Os casos autenticados são ignorados se faltar a conta A; isso não representa sucesso dos fluxos autenticados.

## Cobertura

- Visitante redirecionado de /, /tasks e /statistics para /login.
- Endpoints protegidos respondem 401 sem sessão.
- Alternância login/cadastro, favicon e ausência de rolagem horizontal.
- Login real, criação com PNG/WAV, prévias, edição, persistência e exclusão.
- Navegação para estatísticas e persistência do menu recolhido no desktop.
- Menu móvel, logout e bloqueio após sair.
- Script RLS: CRUD, títulos/status inválidos e isolamento entre contas.
- Script Storage: upload privado, acesso negado para outra conta/anônimo, limites e proteção contra exclusão prematura dos registros.

## Checklist manual

- Confirmar cadastro por e-mail e entrar pelo link.
- Criar tarefa com e sem descrição e anexos.
- Reproduzir um áudio real e visualizar uma imagem.
- Filtrar por cada status e buscar pelo título.
- Remover anexo; cancelar e confirmar exclusão de tarefa.
- Conferir gráfico antes e depois de concluir/reabrir/excluir.
- Interromper rede durante upload e tentar novamente sem duplicar tarefa.
- Usar teclado, leitor de tela, Escape nos diálogos e largura de celular.

## Registro de execução

Os resultados relatados na entrega devem indicar quais comandos realmente passaram. Testes ignorados e fluxos que dependem de confirmação de e-mail não devem ser apresentados como validados automaticamente.
