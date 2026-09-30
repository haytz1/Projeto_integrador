
# Funcionalidades e Correções Implementadas (Recente)

## ObrasMangas.jsx
- Adicionado sistema de filtros por "Gêneros".
- Ao selecionar um ou mais gêneros nos checkboxes do topo, a grade de obras exibe apenas os itens correspondentes.
- A lógica de filtragem utiliza apenas o **gênero principal** (primeiro subgênero) caso a obra tenha múltiplos gêneros cadastrados no banco de dados.
- O select da API do Supabase foi alterado para buscar todos os campos (`*`), garantindo que a coluna de gêneros seja retornada.

## App.jsx
- Correção de rotas duplicadas (`/Leitura` estava declarado 4 vezes em vez de 2).
- Correção de sintaxe na rota `/Denuncias` (adicionada a `/` no caminho inicial).
- **Sistema de Toast global:** `window.alert` foi substituído por um sistema de notificações flutuantes no canto inferior direito, com animação e botão de fechar. Aplica-se automaticamente a todos os `alert()` do projeto. z-index: 9999999.
- **Rotas novas:** `/Seguindo` → `Seguindo.jsx`, `/Favoritos` → `Favoritos.jsx`.

## PaginaInicial.jsx (Navbar Esquerda / Menu Lateral)
- **Para você:** Scroll suave para o topo da página.
- **Seguindo:** Agora é um `<Link>` para `/Seguindo`.
- **Explorar:** Scroll suave para a seção de posts (`#posts-titulo`).
- **Eventos:** Abre o modal de eventos existente (`setModalEventosAberto(true)`).
- **Favoritos:** Agora é um `<Link>` para `/Favoritos`.
- **Obras:** Renomeado de "Histórico" → "Obras", redireciona para `/ObrasMangas`.
- **Novidades:** Removido da sidebar.

## PaginaInicial.jsx (Denúncias)
- Substituído `window.prompt()` por um **modal de denúncia** customizado (usa os mesmos estilos do modal de eventos: `.eventos-modal-overlay`).
- Modal exibe textarea para o usuário descrever o motivo, com botão "Enviar Denúncia" (vermelho) e "Cancelar".
- Funciona tanto para denúncia de post quanto de comentário via `alvoDenuncia.tipo`.
- Estados adicionados: `modalDenunciaAberto`, `alvoDenuncia`, `motivoDenuncia`, `confirmarDenuncia`.

## modal-eventos.css
- `z-index` do `.eventos-modal-overlay` elevado para `999999` para sobrepor todos os outros elementos.

## Seguindo.jsx (novo arquivo)
- Rota: `/Seguindo`
- Página placeholder que exibe mensagem "Você ainda não está seguindo ninguém" com ícone e CTA.
- Usa o layout e CSS do `Historico.jsx` (`historico.css`, `NavbarPesquisa`, `btn-voltar`).

## Favoritos.jsx (novo arquivo)
- Rota: `/Favoritos`
- Página placeholder que exibe mensagem "Você ainda não adicionou nenhum favorito" com ícone e CTA.
- Usa o mesmo padrão de layout de `Seguindo.jsx`.
