# Uso de IA

O Codex foi usado para auxiliar na implementação da interface, integração Supabase, migrações SQL, testes, documentação e publicação.

## Direcionamento humano

O usuário definiu o desafio, escolheu Next.js, forneceu a configuração pública do Supabase, aplicou as migrações no painel e executou o teste original de RLS. Posteriormente solicitou autenticação obrigatória, reorganização frontend/backend, favicon, anexos, menu retrátil e estatísticas.

## Decisões revisáveis

- Manter src/app por exigência do Next.js, separando a implementação em frontend/backend.
- Autorizar no servidor e no banco; não depender apenas do redirecionamento visual.
- Usar bucket privado e limites definidos no banco/Storage.
- Enviar arquivos diretamente ao Storage para suportar áudio de até 20 MB na Vercel.
- Preservar tarefas em falhas de upload e permitir limpar registros incompletos.
- Calcular estatísticas a partir do estado atual, sem inventar histórico.
- Tratar anexos como expansão posterior ao escopo original.

## Validação e responsabilidade

Build, checagem de tipos, Playwright e scripts de RLS/Storage são as evidências técnicas. O cadastro com confirmação de e-mail também exige verificação manual do recebimento e retorno do link.

A geração por IA não comprova ausência de erros. Revise autenticação, grants, políticas RLS, fluxos de exclusão e custos de Storage antes de ampliar o uso.
