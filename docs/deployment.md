# Deploy na Vercel

Projeto: taskflow. Produção: https://taskflow-self-six.vercel.app.

## Antes de publicar

1. Aplicar migrações pendentes no Supabase.
2. Configurar NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
3. Conferir URL de callback no Supabase.
4. Executar build, tipos, testes de interface e integração.
5. Fazer um deploy de preview e conferir login, proteção de rotas e favicon.
6. Publicar produção e repetir a conferência da URL pública.

Use Supabase separado para Preview sempre que possível. As chaves públicas entram no build; mudar variáveis exige redeploy. Nunca adicione senhas TEST_USER_* às variáveis públicas.

## CLI

```powershell
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
npx vercel
npx vercel --prod
```

Ao vincular uma pasta, a CLI pode atualizar .env.local com variáveis próprias. Esse arquivo deve continuar ignorado pelo Git.

## Git

Repositório: https://github.com/KenedyRodrigues/taskflow. O deploy inicial é feito pela CLI. Para deploy automático a cada push, conecte o GitHub em Settings → Git na Vercel.

## Reversão

Mantenha o deploy anterior disponível. A migração de anexos é aditiva; não remova bucket/tabelas com dados para reverter apenas a interface. O trigger de proteção de anexos e a FK impedem exclusões de tarefas que ainda têm anexos, inclusive por versões antigas.
