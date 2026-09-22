# Setup

1. Instale Node.js 22.13+ e execute npm ci.
2. Copie .env.example para .env.local e preencha URL e chave publishable do Supabase.
3. Execute as duas migrações em supabase/migrations na ordem dos nomes.
4. Habilite Email em Authentication. Use confirmação de e-mail; configure SMTP para produção.
5. Configure Site URL e Redirect URLs.
6. Inicie com npm run dev.

## URLs

| Ambiente          | URL                                                |
| ----------------- | -------------------------------------------------- |
| Site local        | http://localhost:3000                              |
| Callback local    | http://localhost:3000/auth/callback                |
| Callback de teste | http://127.0.0.1:3100/auth/callback                |
| Site produção     | https://taskflow-self-six.vercel.app               |
| Callback produção | https://taskflow-self-six.vercel.app/auth/callback |

Inclua o callback de cada preview que será usado para cadastro. O código também aceita o retorno com code à raiz, mas configurar o callback explicitamente é o fluxo recomendado.

O PKCE usa um verificador mantido no navegador que iniciou o cadastro. Abra a confirmação no mesmo navegador. Se confirmar em outro dispositivo e a troca da sessão falhar, volte ao login e entre com a senha depois da confirmação.

## Projeto existente

Não reaplique a primeira migração se tasks já existe. A segunda cria task_attachments, políticas e o bucket task-attachments sem modificar tarefas existentes. As migrações são transacionais e não são scripts de reset.

## Diagnóstico

- Login sem funcionar: confira as variáveis e reinicie o servidor após editá-las.
- E-mail não chega: confira Auth Users, limites do serviço e SMTP.
- Anexos indisponíveis: confira a aplicação da segunda migração.
- Falha ao abrir prévia: arquivo incompleto, conteúdo não permitido ou link expirado. Tente renovar; se persistir, remova e envie novamente.
- Sessão da versão antiga: saia e entre novamente.
