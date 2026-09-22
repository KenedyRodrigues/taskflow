# Imagens, áudios e vídeos

## Regras

| Conteúdo | Formatos           | Tamanho máximo por arquivo |
| -------- | ------------------ | -------------------------- |
| Imagem   | JPEG, PNG, WebP    | 5 MB                       |
| Áudio    | MP3, M4A, WAV, OGG | 20 MB                      |
| Vídeo    | MP4, WebM, MOV     | 20 MB                      |

Até cinco arquivos por tarefa, combinando imagens, áudios e vídeos. Upload pelo seletor do dispositivo; gravação pelo microfone não está implementada. A compatibilidade de reprodução do áudio depende do navegador e do codec do arquivo.

## Uso

Abra Nova tarefa ou Editar tarefa. Selecione arquivos no campo opcional e salve. Na edição, use Abrir prévia para ver a imagem, o vídeo ou o player de áudio. No Kanban, a primeira imagem ou vídeo e o primeiro áudio aparecem no cartão. Clicar no conteúdo do cartão abre uma visualização somente leitura com título, descrição e todos os arquivos; a edição abre apenas pelo botão de lápis. Renovar link gera um novo endereço temporário.

Remover um anexo exige confirmação própria e é uma alteração imediata. Cancelar o formulário não restaura um anexo já removido.

## Protocolo

1. Salvar tarefa.
2. POST /api/tasks/:id/attachments reserva metadados.
3. SDK do navegador envia bytes diretamente para o Storage privado.
4. GET /api/attachments/:id valida os bytes e gera um link temporário.
5. Se houver falha, a interface tenta remover arquivo/reserva e mantém a tarefa salva.

Envios parciais não recriam a tarefa. Arquivos já enviados são mantidos; os restantes ficam selecionados para nova tentativa. Se o navegador fechar durante o upload, reabra a tarefa e remova o registro incompleto.

## Custos

Gerar cada prévia faz download do arquivo para validar o conteúdo no servidor. Para maior escala, considerar processamento assíncrono e uma marca de validação protegida no banco. Não há compartilhamento público de arquivos.
