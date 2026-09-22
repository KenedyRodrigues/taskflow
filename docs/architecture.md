# Arquitetura

## Organização

O TaskFlow tem um único deploy Next.js. Não existe um processo backend independente.

- src/app: arquivos reconhecidos pelo App Router. Páginas delegam a renderização ao frontend; route handlers expõem a API HTTP.
- src/backend/auth: verificação de usuário com auth.getUser(), rejeição de acesso sem sessão e validação de origem das mutações.
- src/backend/supabase: cliente por requisição, com cookies e chave pública, sujeito a RLS.
- src/backend/services: remoção coordenada de objetos e registros de anexos.
- src/backend/validation: validação de tarefa e metadados de arquivo.
- src/frontend/components: navegação compartilhada e menu retrátil.
- src/frontend/features: login/cadastro, tarefas e estatísticas.
- src/frontend/hooks: carregamento compartilhado da lista de tarefas.
- src/frontend/lib: cliente Supabase do navegador, chamadas HTTP e tipos de apresentação.

Módulos do servidor importam server-only para evitar inclusão acidental no bundle do navegador.

## Sessões e rotas

1. / verifica o usuário no servidor e redireciona para /login ou /tasks.
2. /login usa Supabase Auth; o SDK SSR armazena a sessão em cookies.
3. src/proxy.ts renova cookies. A autorização definitiva também ocorre nas páginas privadas e em cada API.
4. /auth/callback troca o código de confirmação por sessão. Se o Supabase retornar à raiz com code, a raiz encaminha ao callback.
5. /tasks e /statistics exigem usuário validado.
6. Ao sair, o SDK limpa a sessão e a aplicação retorna ao login.

A versão anterior armazenava sessões no localStorage. Usuários podem precisar entrar novamente após a atualização para cookies.

## Dados

O frontend acessa /api/tasks para CRUD. As APIs utilizam o token do próprio usuário, sem service_role. O Postgres aplica RLS a todas as operações. A leitura pagina o banco internamente em lotes de 1.000 para não truncar os contadores no limite padrão da API.

A visualização das tarefas pode alternar entre lista e Kanban. O modo escolhido fica salvo no navegador. Ao mover um cartão entre colunas, a interface atualiza imediatamente e envia o novo status à mesma API protegida; se a operação falhar, o cartão retorna à coluna anterior. Em telas touch, o cartão também oferece um seletor de status.

As estatísticas refletem as tarefas atuais: não são um histórico diário. Excluir ou reabrir uma tarefa altera os números.

## Upload

A API reserva um registro; o navegador envia o conteúdo diretamente ao Storage com a sessão do usuário. Assim, arquivos de até 20 MB não passam pelo limite de corpo da função Vercel. A API de prévia baixa e identifica o conteúdo por assinatura binária antes de liberar um link temporário.

A exclusão usa Storage primeiro, metadados depois e tarefa por último. Uma FK restritiva impede excluir tarefas com registros de anexos restantes.
