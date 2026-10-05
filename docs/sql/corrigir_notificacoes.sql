-- =====================================================================
-- CORREÇÃO: comentar, curtir e seguir davam erro
-- =====================================================================
-- Problema:
--   A tabela "notificacoes" ficou com RLS LIGADO no Supabase.
--   Quando alguém comenta, curte ou segue, um gatilho (trigger) tenta
--   criar uma notificação. O RLS bloqueava essa gravação e o banco
--   cancelava a ação inteira (o comentário/curtida/seguir não era salvo).
--
-- Como usar:
--   1. Abra o painel do Supabase > SQL Editor > New query
--   2. Cole TODO este arquivo e clique em "Run"
--
-- Pode rodar mais de uma vez sem problema.
-- =====================================================================


-- 1. Desliga o RLS da tabela, igual às outras tabelas do projeto
alter table public.notificacoes disable row level security;


-- 2. Garantia extra: se o Supabase religar o RLS sozinho,
--    esta regra libera ler, criar, marcar como lida e apagar.
drop policy if exists "notificacoes_liberado" on public.notificacoes;
create policy "notificacoes_liberado"
    on public.notificacoes
    for all
    to anon, authenticated
    using (true)
    with check (true);


-- 3. Os gatilhos passam a rodar com permissão do dono do banco.
--    Assim, mesmo se um dia o RLS for ligado, comentar/curtir/seguir
--    nunca mais é bloqueado por causa da notificação.
alter function public.notificar_novo_seguidor()   security definer set search_path = public;
alter function public.notificar_novo_capitulo()   security definer set search_path = public;
alter function public.notificar_novo_comentario() security definer set search_path = public;
alter function public.notificar_nova_curtida()    security definer set search_path = public;
