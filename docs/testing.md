# Testes

## PreparaÃ§Ã£o

Use preferencialmente um projeto Supabase de teste, com as duas migraÃ§Ãµes. Crie duas contas diferentes e confirme os e-mails.

No .env.local, adicione:

```dotenv
TEST_USER_A_EMAIL=conta-a@exemplo.com
TEST_USER_A_PASSWORD="senha-da-conta-a"
TEST_USER_B_EMAIL=conta-b@exemplo.com
TEST_USER_B_PASSWORD="senha-da-conta-b"
```

Nunca faÃ§a commit desse arquivo. Os testes criam suas prÃ³prias tarefas identificadas e tentam limpÃ¡-las ao terminar. Interromper o processo pode exigir limpeza manual.

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

Playwright usa a porta 3100 e um worker, com projetos desktop e mobile. Os casos autenticados sÃ£o ignorados se faltar a conta A; isso nÃ£o representa sucesso dos fluxos autenticados.

## Cobertura

- Visitante redirecionado de /, /tasks e /statistics para /login.
- Endpoints protegidos respondem 401 sem sessÃ£o.
- AlternÃ¢ncia login/cadastro, favicon e ausÃªncia de rolagem horizontal.
- Login real, criaÃ§Ã£o com PNG/WAV, prÃ©vias, ediÃ§Ã£o, persistÃªncia e exclusÃ£o.
- NavegaÃ§Ã£o para estatÃ­sticas e persistÃªncia do menu recolhido no desktop.
- Menu mÃ³vel, logout e bloqueio apÃ³s sair.
- Script RLS: CRUD, tÃ­tulos/status invÃ¡lidos e isolamento entre contas.
- Script Storage: upload privado, acesso negado para outra conta/anÃ´nimo, limites e proteÃ§Ã£o contra exclusÃ£o prematura dos registros.

## Checklist manual

- Confirmar cadastro por e-mail e entrar pelo link.
- Criar tarefa com e sem descriÃ§Ã£o e anexos.
- Reproduzir um Ã¡udio real e visualizar uma imagem.
- Filtrar por cada status e buscar pelo tÃ­tulo.
- Remover anexo; cancelar e confirmar exclusÃ£o de tarefa.
- Conferir grÃ¡fico antes e depois de concluir/reabrir/excluir.
- Interromper rede durante upload e tentar novamente sem duplicar tarefa.
- Usar teclado, leitor de tela, Escape nos diÃ¡logos e largura de celular.

## Registro de execuÃ§Ã£o

Os resultados relatados na entrega devem indicar quais comandos realmente passaram. Testes ignorados e fluxos que dependem de confirmaÃ§Ã£o de e-mail nÃ£o devem ser apresentados como validados automaticamente.
