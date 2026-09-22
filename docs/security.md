# Segurança

## Camadas

1. Páginas privadas verificam usuário com Supabase auth.getUser() no servidor.
2. Cada endpoint HTTP repete a autenticação; requisições sem sessão recebem 401.
3. Mutações verificam o header Origin quando presente e recusam origem diferente.
4. Clientes servidor/navegador usam somente chave pública e a sessão do usuário.
5. Postgres e Storage aplicam RLS, independentemente de como a API foi chamada.

Nenhum token administrativo é necessário no runtime. Variáveis locais com senhas de teste não são versionadas.

## Tarefas

Quatro políticas específicas de SELECT/INSERT/UPDATE/DELETE usam auth.uid() = user_id. O papel anon não recebe acesso. Grants por coluna impedem alterar proprietário, ID e timestamps.

## Anexos

Registros de anexos só podem ser criados para tarefas pertencentes à sessão. O caminho inclui proprietário e tarefa. O bucket é privado e suas políticas verificam esse vínculo.

A API valida metadados. O bucket valida MIME/tamanho, e a política de upload exige correspondência com a reserva. Antes de gerar a prévia, o servidor confere assinatura binária, tamanho e MIME detectado. SVG, HTML e executáveis não fazem parte dos formatos aceitos. Essa detecção não é um antivírus.

Links de prévia expiram em 5 minutos. Um link já emitido é uma credencial temporária: quem o receber poderá usá-lo até expirar. Não existe acesso público permanente ao bucket.

## Exclusão e falhas

A remoção do objeto usa a API oficial do Storage. Não se excluem linhas de storage.objects diretamente. Um trigger SECURITY DEFINER, com search_path vazio, consulta somente a existência do objeto para impedir metadados órfãos. Ele não concede leitura de arquivos ao usuário.

Falhas intermediárias mantêm o registro/tarefa para permitir nova tentativa. Não existe transação distribuída entre Postgres e Storage. A interface informa erros e permite limpar reservas de uploads interrompidos.

## Limites conhecidos

Sem antivírus, quotas totais por usuário ou processamento/transcodificação de mídia. Sessões estão em cookies acessíveis ao SDK no navegador; RLS permanece obrigatório. A aplicação não deve inserir HTML fornecido pelo usuário. Logout encerra a sessão local; URLs assinadas emitidas anteriormente expiram no prazo normal.
