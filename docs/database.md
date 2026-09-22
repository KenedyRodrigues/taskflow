# Banco de dados

## tasks

UUID, user_id padrÃ£o auth.uid(), title obrigatÃ³rio atÃ© 160 caracteres apÃ³s trim, description opcional atÃ© 2.000 caracteres, status todo/doing/done, created_at e updated_at. Trigger atualiza updated_at.

O Ã­ndice (user_id, created_at desc) atende a consulta principal.

## task_attachments

UUID, task_id, user_id padrÃ£o auth.uid(), name, mime_type, size em bytes, path Ãºnico e created_at.

- FK task_id com ON DELETE RESTRICT: remova anexos antes da tarefa.
- AtÃ© 5 registros por tarefa. Um trigger bloqueia a linha da tarefa antes de contar, serializando reservas concorrentes.
- Imagens atÃ© 5 MB; Ã¡udios atÃ© 20 MB.
- Path comeÃ§a com user_id/task_id e termina em identificador aleatÃ³rio e extensÃ£o.
- INSERT exige propriedade da tarefa; UPDATE nÃ£o Ã© concedido.
- DELETE Ã© bloqueado enquanto houver objeto correspondente no Storage.

O registro nasce antes do upload. Se a conexÃ£o cair, ele pode ficar sem objeto; a interface permite removÃª-lo. Esses registros continuam contando no limite de cinco.

## Storage

Bucket task-attachments privado, limite de 20 MB e lista fechada de MIME types. Upload sÃ³ pode ocorrer para um registro reservado pelo usuÃ¡rio, com a propriedade verificada antes do envio. Um trigger confere tamanho e MIME reais contra a reserva quando o Storage grava o objeto conclu?do. NÃ£o hÃ¡ polÃ­tica de UPDATE; arquivos nÃ£o sÃ£o sobrescritos.

A polÃ­tica de SELECT exige registro e proprietÃ¡rio correspondentes. DELETE permite remover objetos na pasta do prÃ³prio usuÃ¡rio, inclusive em tentativas de limpeza.

## MigraÃ§Ãµes

- 202609210001_tasks.sql: tarefas, Ã­ndices, RLS, grants e updated_at.
- 202609220001_attachments.sql: anexos, limites, prevenÃ§Ã£o de Ã³rfÃ£os e Storage.

NÃ£o altere uma migraÃ§Ã£o jÃ¡ aplicada para atualizar um ambiente. MudanÃ§as futuras exigem uma nova migraÃ§Ã£o. FaÃ§a backup e use um projeto separado para testes de schema.

- 202609220005_video_attachments.sql: adiciona MP4, WebM e MOV aos anexos e ao bucket privado.
