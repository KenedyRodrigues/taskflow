# Banco de dados

## tasks

UUID, user_id padrão auth.uid(), title obrigatório até 160 caracteres após trim, description opcional até 2.000 caracteres, status todo/doing/done, created_at e updated_at. Trigger atualiza updated_at.

O índice (user_id, created_at desc) atende a consulta principal.

## task_attachments

UUID, task_id, user_id padrão auth.uid(), name, mime_type, size em bytes, path único e created_at.

- FK task_id com ON DELETE RESTRICT: remova anexos antes da tarefa.
- Até 5 registros por tarefa. Um trigger bloqueia a linha da tarefa antes de contar, serializando reservas concorrentes.
- Imagens até 5 MB; áudios até 20 MB.
- Path começa com user_id/task_id e termina em identificador aleatório e extensão.
- INSERT exige propriedade da tarefa; UPDATE não é concedido.
- DELETE é bloqueado enquanto houver objeto correspondente no Storage.

O registro nasce antes do upload. Se a conexão cair, ele pode ficar sem objeto; a interface permite removê-lo. Esses registros continuam contando no limite de cinco.

## Storage

Bucket task-attachments privado, limite de 20 MB e lista fechada de MIME types. Upload só pode ocorrer para um registro reservado pelo usuário, com a propriedade verificada antes do envio. Um trigger confere tamanho e MIME reais contra a reserva quando o Storage grava o objeto conclu?do. Não há política de UPDATE; arquivos não são sobrescritos.

A política de SELECT exige registro e proprietário correspondentes. DELETE permite remover objetos na pasta do próprio usuário, inclusive em tentativas de limpeza.

## Migrações

- 202609210001_tasks.sql: tarefas, índices, RLS, grants e updated_at.
- 202609220001_attachments.sql: anexos, limites, prevenção de órfãos e Storage.

Não altere uma migração já aplicada para atualizar um ambiente. Mudanças futuras exigem uma nova migração. Faça backup e use um projeto separado para testes de schema.
