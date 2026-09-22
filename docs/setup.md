# Setup

1. Instale Node.js 22.13+ e execute npm ci.
2. Copie .env.example para .env.local e preencha URL e chave publishable do Supabase.
3. Execute as duas migraÃ§Ãµes em supabase/migrations na ordem dos nomes.
4. Habilite Email em Authentication. Use confirmaÃ§Ã£o de e-mail; configure SMTP para produÃ§Ã£o.
5. Configure Site URL e Redirect URLs.
6. Inicie com npm run dev.

## URLs

| Ambiente            | URL                                                |
| ------------------- | -------------------------------------------------- |
| Site local          | http://localhost:3000                              |
| Callback local      | http://localhost:3000/auth/callback                |
| Callback de teste   | http://127.0.0.1:3100/auth/callback                |
| Site produÃ§Ã£o     | https://taskflow-self-six.vercel.app               |
| Callback produÃ§Ã£o | https://taskflow-self-six.vercel.app/auth/callback |

Inclua o callback de cada preview que serÃ¡ usado para cadastro. O cÃ³digo tambÃ©m aceita o retorno com code Ã  raiz, mas configurar o callback explicitamente Ã© o fluxo recomendado.

O PKCE usa um verificador mantido no navegador que iniciou o cadastro. Abra a confirmaÃ§Ã£o no mesmo navegador. Se confirmar em outro dispositivo e a troca da sessÃ£o falhar, volte ao login e entre com a senha depois da confirmaÃ§Ã£o.

## Projeto existente

NÃ£o reaplique a primeira migraÃ§Ã£o se tasks jÃ¡ existe. A segunda cria task_attachments, polÃ­ticas e o bucket task-attachments sem modificar tarefas existentes. As migraÃ§Ãµes sÃ£o transacionais e nÃ£o sÃ£o scripts de reset.

## DiagnÃ³stico

- Login sem funcionar: confira as variÃ¡veis e reinicie o servidor apÃ³s editÃ¡-las.
- E-mail nÃ£o chega: confira Auth Users, limites do serviÃ§o e SMTP.
- Anexos indisponÃ­veis: confira a aplicaÃ§Ã£o da segunda migraÃ§Ã£o.
- Falha ao abrir prÃ©via: arquivo incompleto, conteÃºdo nÃ£o permitido ou link expirado. Tente renovar; se persistir, remova e envie novamente.
- SessÃ£o da versÃ£o antiga: saia e entre novamente.
