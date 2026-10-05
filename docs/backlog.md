
# Funcionalidades e Correções Implementadas (Recente)

## 2026-10-03 — Rodada de "completar o site"

### App.jsx (rotas)
- `RotaProtegida` (função dentro do próprio App.jsx): checa `supabase.auth.getSession()`; sem sessão → `alert` + `<Navigate to="/Login">`.
- Rotas PROTEGIDAS: `/Historico`, `/Moedas`, `/Perfil`, `/Denuncias`, `/Seguindo`, `/Favoritos`, `/Notificacoes`.
- Rotas PÚBLICAS (de propósito, para navegar sem conta): `/`, `/ObrasMangas`, `/Leitura`, `/Leitura/:tituloObra`, `/Login`, `/Cadastro`, `/Planos`, `/Perfil/:id`, `/anime/:id`, `/Sobre`.
- Rota `*` → `NaoEncontrada.jsx` (404, CSS `naoencontrada.css`, id `#tela-nao-encontrada`).

### Denuncias.jsx (segurança)
- `tipo_usuario` NÃO vem mais do localStorage (era falsificável e nunca era gravado por ninguém). Agora: `auth.getUser()` → `usuarios.select('tipo_usuario').eq('auth_id', ...)`.
- Estado `verificandoAcesso` evita mostrar "Acesso restrito" enquanto carrega. Autorizados: `admin` e `moderador`; excluir post/comentário só `admin`.

### Navbar_pesquisa.jsx
- Botão "Sair" agora chama `supabase.auth.signOut()` e limpa `usuario_id`, `usuario_auth_id`, `usuario_email`, `usuario_username` (antes só limpava o e-mail e a sessão continuava ativa).
- Novo item "Notificações" no menu do perfil com contador de não lidas (`.nav-notif-contador` em `Navbar_pesquisa.css`).
- Novo item "Denúncias" no menu, visível só para `tipo_usuario` admin/moderador.

### Notificações (novo)
- Tabela `notificacoes` (id, id_usuario → usuarios.id, tipo, mensagem, link, lida, criado_em). SQL em `docs/sql/notificacoes.sql` — PRECISA SER RODADO MANUALMENTE no SQL Editor do Supabase.
- Triggers no banco geram notificações: novo seguidor (`seguidores`), novo capítulo de obra favoritada (`capitulos` × `favoritos`), comentário e curtida em postagem própria (`comentarios`, `curtidas`). O front só lê/atualiza/apaga.
- `Notificacoes.jsx` (rota `/Notificacoes`, CSS `notificacoes.css`, id `#tela-notificacoes`): lista, filtro Todas/Não lidas, marcar todas como lidas, clicar marca como lida e navega para `link`, apagar.
- Sidebar da PaginaInicial ("Notificações de histórias") agora aponta para `/Notificacoes` (antes ia para `/ObrasMangas`).

### Sobre.jsx (novo) e Rodape.jsx
- `/Sobre` com seções `#faq`, `#termos`, `#privacidade`, `#contato` (CSS `sobre.css`, id `#tela-sobre`). `useEffect` rola até o hash da URL.
- Rodapé: links FAQ/Contato/Termos/Privacidade apontam para `/Sobre#...`. Coluna de redes sociais removida (não havia contas reais) e substituída por coluna "Legal" para manter o grid de 4 colunas.

### Cadastro.jsx
- Botões "Continuar com o Google" e "Continuar com a Apple" exibem aviso "em breve" (OAuth não configurado no Supabase).

### Moedas.jsx / Planos.jsx
- (Revertido a pedido da usuária) O `window.confirm` de pagamento simulado foi removido: a compra/assinatura acontece direto no clique.
- Moedas: removido o limite de 150 moedas. A compra soma `quantidade` ao saldo atual (`usuarios.moedas`), sem teto.
- SEM alert nas duas telas: estado `aviso` renderiza faixa na página (`.aviso-compra-sucesso/-erro` em moedas.css, `.aviso-plano-sucesso/-erro` em planos.css).
  - Moedas: mostra "Seu saldo: X moedas" (`.saldo-atual`) no topo; após comprar: "Compra concluída! R$ 5,00 cobrados (pagamento simulado) · +50 moedas · Saldo atual: N moedas". Preços em `PRECOS = {50:5, 100:10, 150:15}`. Botões ficam "Comprando..." e desabilitados durante a compra.
  - Planos: mostra "Seu plano atual: X" (`.plano-atual`); após assinar Premium: "R$ 15,00 cobrados por mês (pagamento simulado)"; Gratuito: "Nenhum valor será cobrado". Botão do plano atual fica desabilitado com texto "Seu plano atual".
  - ATENÇÃO: `usuarios.plano` no banco tem valores misturados ("Premium", "premium", "Gratuito", "gratuito", "'gratuito'::text"). Planos.jsx normaliza na leitura (contém "premium" → premium, senão gratuito) e grava sempre minúsculo.

### Leitura.jsx — desbloqueio VIP por moedas (RECUPERADO)
- O desbloqueio por moedas (commit 0407d0d, Lorena) e o timer grátis (d0cc046, Gui) foram PERDIDOS no merge ec3c4c3 (02/10), que manteve a versão antiga de 433 linhas. Reimplementado POR CIMA do arquivo atual (sem sobrescrever), usando a versão de d0cc046 como referência.
- Banco (já existia, não foi alterado): tabela `leitura` (id_usuario, id_capitulo, desbloqueado) e RPC `desbloquear_capitulo({ p_capitulo_id })` → retorna `{ sucesso, mensagem, moedas }` e desconta as moedas no servidor.
- Capítulo com `e_vip = true` e sem registro em `leitura` mostra cartão `.vip-bloqueado`: preço (`valor_moeda`, padrão 10), saldo atual, saldo depois do desbloqueio, botão "Desbloquear por X moedas" (ou "Comprar moedas" se saldo insuficiente, ou "Entrar para desbloquear" se deslogado).
- Timer de 60s (`TIMER_DURACAO`): ao zerar, faz upsert em `leitura` com `desbloqueado: true` e libera sem gastar moedas.
- SEM alert no fluxo de moedas: estado `avisoMoedas` renderiza `.aviso-moedas.aviso-sucesso` ("−X moedas descontadas pelo Capítulo N. Saldo atual: Y moedas.") ou `.aviso-erro`. Estilos no fim de `leitura.css`.
- Outras correções: "+ Novo Capítulo" só aparece se `obras.autor_id === usuario_id`; modal de novo capítulo tem campo "Preço em moedas" quando VIP; seletor não repete "Capítulo N - Capítulo N" e mostra "🔒 VIP (X moedas)"; barra de progresso real (posição/total); removida a função `handleCapituloChange` duplicada.

### ObrasMangas.jsx — grade vazia (CORRIGIDO)
- O commit f7d4b59 criou um segundo `CardObra` dentro de `ObrasMangas` sem `return`, que escondia o `CardObra` real → nenhum card aparecia. Removido; a contagem de visualizações (`rpc incrementar_visualizacao_obra`, 1x por sessão via sessionStorage) foi movida para o `onClick` do `<Link>` do `CardObra` original.

### Rodada 3 (2026-10-03) — celular, confirmações, Leitura, histórico, favoritos
- **notificacoes.sql já foi rodado no Supabase** (confirmado pela usuária).
- **index.html:** `lang="pt-BR"`; favicon agora é `/logo_animespot.png` (o `/favicon.svg` não existia).
- **Confirmação na tela (App.jsx):** `window.confirmarNaTela(mensagem)` retorna Promise<boolean> e abre modal no estilo do site (Cancelar/Confirmar, clique fora = cancelar). Todos os 8 `window.confirm` foram trocados por `await window.confirmarNaTela(...)` (Denuncias ×4, PaginaInicial ×3, Seguindo ×1). NÃO usar `window.confirm` em código novo.
- **Toast:** largura máxima `min(400px, calc(100vw - 40px))` para caber no celular.
- **Celular (testado emulando 390×844 via CDP; todas as páginas públicas sem rolagem horizontal):**
  - `Navbar_pesquisa.css` @media ≤768px: esconde `.nav-logo-text` e `.btn-criar-conta`; `.nav-center` deixa de ser absolute e vira `flex:1`.
  - `paginainicial.css`: `.post-card { min-width:0 }` + `minmax(0,1fr)` no `.posts-grid` (título com nowrap estourava o card para 482px); paginação quebra linha ≤480px.
  - `obras_mangas.css` @media ≤600px: textos dos botões do topo ficam em `<span class="texto-botao">` e somem no celular (só ícones), busca vira flex:1.
  - `leitura.css`: `.container-voltar .btn-voltar { position: static }` — o `historico.css` define `.btn-voltar` com `position: fixed` e, como todo CSS importado é global, ele ficava por cima do título da Leitura. Media query ≤768px para larguras e botões.
- **Leitura.jsx — topo da obra:** seção `.obra-info` com capa, @autor (link para `/Perfil/:autor_id`), gênero, status, nº de capítulos e sinopse (4 linhas + "Ver mais").
- **Histórico no banco:** Leitura faz `upsert` em `leitura` (id_usuario, id_capitulo, email_usuario, obra_titulo, ultimo_capitulo, status 'lendo') com `ignoreDuplicates: true` sempre que um capítulo é exibido liberado — não sobrescreve linhas de desbloqueio. `Historico.jsx`: logado → lê `leitura`, agrupa por obra (maior capítulo), busca capa e capítulos em `obras`, marca "Concluído" se leu o último capítulo; visitante → localStorage como antes. Itens agora são links para `/Leitura/:titulo`. (A sidebar "Obras lidas" do ObrasMangas continua lendo o localStorage.)
- **Perfil.jsx:** nova seção "Obras favoritadas" (tabela `favoritos` + `obras`) logo abaixo da "Minha lista" (que continua com `biblioteca`). Reusa as classes `.minha-lista-section`, `.minha-lista-grid`, `.obra-card`. Clique abre `/Leitura/:titulo`.
- **Menu do celular (Navbar_pesquisa.jsx):** no celular a `.sidebar-left` some (`display:none` ≤700px) e Planos/Moedas só existiam nela e no rodapé. Agora há botão ☰ (`.nav-menu-celular`, visível só ≤768px) que abre gaveta `.menu-celular` com `LINKS_MENU_CELULAR` (Início, Obras, Seguindo, Favoritos, Histórico, Notificações + contador, Planos, Moedas, Ajuda e FAQ), Denúncias para admin/moderador, e no rodapé Meu perfil/Sair (logado) ou Entrar/Criar conta. A logo da navbar agora também é link para `/`.
- NÃO feito por decisão da usuária: RLS e dividir Perfil/PaginaInicial.

### Organização
- Conexão Supabase unificada: Moedas, Planos, Anime, BarraPesquisa e Navbar_pesquisa agora importam de `supabase.js` (raiz) em vez de criar `createClient` próprio.
- Removidos arquivos sem uso: `fix.cjs`, `src/AtualizarFoto.jsx`, `src/components/Navbartestezin.jsx`, `src/css/navbartestezin.css`.
- `/backlog.md` da raiz foi mesclado no final deste arquivo e apagado.
- Removidos `console.log` de depuração do Login/Cadastro (vazavam dados da sessão); erros continuam com `console.error`.

### Rodada 4 (2026-10-05)
- **ObrasMangas.jsx — sidebar "Obras lidas":** nova função `procurar_historico()` — logado lê a tabela `leitura` (mesma lógica de agrupamento/"Concluído" do Historico.jsx); visitante ou erro → `procurar_historico_local()` (localStorage, como antes). Listeners de focus/storage/historicoAtualizado apontam para a nova função.
- Cada item da lista agora é `<Link className="obra-lida-link">` para `/Leitura/:titulo` (antes tinha cursor de mão mas não fazia nada). Estilo em `obras_mangas.css`.
- Seguindo.jsx JÁ ESTÁ FUNCIONAL (lista autores de `seguidores`, posts deles de `postagens`, deixar de seguir). A seção "Seguindo.jsx (novo arquivo)" mais abaixo, que diz "placeholder", está desatualizada.

- **Toasts com tipo (App.jsx):** `window.alert` JÁ É SOBRESCRITO no App.jsx e vira toast no site (não abre popup do navegador) — por isso os ~113 `alert()` das páginas NÃO precisam ser trocados. Agora `tipoDoToast(message)` classifica pelo texto: começa com "Erro" / contém "não foi possível" / "ocorreu um erro" → `erro` (vermelho, `ph-x-circle`, 6s); contém "sucesso" → `sucesso` (verde, `ph-check-circle`); resto → `aviso` (roxo, `ph-info`). Cores/ícones em `ESTILO_TOAST`. Em código novo, escreva as mensagens seguindo esse padrão para pegar a cor certa.

- **Revisão automática (2026-10-05):** todas as rotas públicas abertas no Edge headless (PC 1366px e celular 390px), deslogado. Sem erros de console nem rolagem horizontal. Achados e correções abaixo. NÃO foi testado logado (sem conta de teste).
- **Perfil.jsx — perfil público:** `/Perfil/:id` é rota pública, mas `buscarDadosDoBanco` mandava visitante para `/Login`. Agora só redireciona se NÃO tem login E NÃO tem `routeId`; `idUsuarioLogado` é `let ... = null` e só é buscado se houver sessão. `buscarContagens` não exige mais `loggedUserId` (visitante vê nº de seguidores); a checagem "eu sigo essa pessoa" só roda se `loggedUserId !== null`.
- **Perfil.jsx — privacidade:** bloco E-MAIL e seção "Minhas moedas" agora só aparecem com `isMeuPerfil` (antes qualquer um via o e-mail e o saldo dos outros). Texto do plano fica em 3ª pessoa no perfil alheio ("Este usuário é um apoiador...").
- **PaginaInicial.jsx — lentidão:** `buscarDadosIniciais` faz 5–7 consultas em sequência (~0,5–1s cada) e só tirava o "Carregando postagens..." no `finally`. Agora `setCarregando(false)` logo após `setPosts/setPostsHero`; obras e eventos continuam carregando depois.
- Observado e NÃO corrigido: uma imagem na home falha com `ERR_BLOCKED_BY_ORB` (link de imagem que não é imagem, provavelmente URL de página colada em `postagens.imagem` ou `eventos`).

- **BUG GRAVE corrigido (precisa rodar SQL):** comentar, curtir e seguir falhavam ("Erro ao enviar comentário... RLS"). Causa: a tabela `notificacoes` ficou com RLS LIGADO no Supabase (apesar do `disable` no script) e sem policy; os triggers de notificação rodam como o usuário, eram barrados, e o Postgres cancelava o INSERT original. Confirmado via REST: `42501 new row violates row-level security policy for table "notificacoes"`. Correção em `docs/sql/corrigir_notificacoes.sql` (desliga RLS + policy `notificacoes_liberado` for all using true + funções `security definer set search_path = public`). `notificacoes.sql` também foi atualizado. JÁ FOI RODADO (2026-10-05) e confirmado: comentar/curtir/seguir funcionam e as notificações são criadas.

- **CSS por tela (regra do arquitetura.md):** Favoritos.jsx e Seguindo.jsx não têm mais `style={{}}`. Novos `src/css/favoritos.css` (`#tela-favoritos`) e `src/css/seguindo.css` (`#tela-seguindo`), todo seletor prefixado pelo ID. Seguindo: avatar e imagem do post viraram `<img>` (antes `div` com background-image). Visual igual; NÃO conferido logado (rotas protegidas).
- **Login social Google/Apple (Login.jsx + Cadastro.jsx):** botões voltaram (a usuária quer funcionando). `entrarComProvedor(provedor)` primeiro faz `fetch(VITE_SUPABASE_URL + '/auth/v1/settings')` e, se `external[provedor]` for false, mostra toast "ainda não foi ativado no Supabase" (evita cair na página JSON de erro do Supabase). Se ativado: grava `localStorage.login_social` e chama `signInWithOAuth({ provider, options: { redirectTo: origin + '/Login' } })`.
  - Volta sempre em `/Login`: `useEffect` `voltarDoLoginSocial` lê o flag `login_social`, mostra `error_description` da URL se houver, senão `getSession()` → `carregarPerfilEEntrar(user, true)`.
  - `carregarPerfilEEntrar(user, criarSeFaltar)` (extraída do handleLogin): busca `usuarios` por auth_id, depois por email; no login social cria a linha (`auth_id, email, username, foto = user_metadata.avatar_url/picture`) se não existir, ou completa `username` vazio. `gerarUsernameLivre` = nome do Google sem acento/espaço (máx 20) ou prefixo do e-mail, + 4 dígitos se já existir.
  - Estilo `.btn-social` em login.css.
  - STATUS (2026-10-05): provedores google e apple DESLIGADOS no Supabase (`/auth/v1/settings`). Usuária precisa configurar: Google = Google Cloud OAuth client (grátis), redirect URI `https://mhxlnijdbqkternzlzho.supabase.co/auth/v1/callback`; Apple = exige Apple Developer Program (US$ 99/ano). Também adicionar `http://localhost:5173/**` em Authentication > URL Configuration > Redirect URLs.
  - RISCO não verificado: pode existir trigger em `auth.users` que cria a linha em `usuarios` a partir de `raw_user_meta_data.username`; no login social não há username. Se aparecer "Database error saving new user", ver esse trigger.
- **Apple removida (2026-10-05):** a pedido da usuária, os botões "Continuar com a Apple" saíram do Login.jsx e do Cadastro.jsx (Apple exige conta paga de desenvolvedor). Só o Google ficou. `entrarComProvedor('google')` continua genérico, mas `nomeProvedor` é fixo 'Google'. O Google continua DESLIGADO no Supabase (a usuária desistiu de configurar por enquanto), então o botão mostra o toast "O login com Google ainda não foi ativado no Supabase." — isso é o comportamento esperado. Quando ativarem o provedor no Supabase, o botão passa a funcionar sem mudar código.
- **Imagem quebrada (ERR_BLOCKED_BY_ORB):** causa = 6 usuários de teste com `foto` = `https://example.com/fotos/*.jpg` (ids 4, 6, 7, 8, 9, 10: AnaCosta, JuliaMartins, GabrielSouza, LarissaOliveira, RafaelSantos, BeatrizLima). Correção = `update usuarios set foto = null where foto like 'https://example.com/fotos/%';` (front já cai no AVATAR_PADRAO). A IA não pôde rodar (bloqueio de permissão) — usuária precisa rodar no SQL Editor.

### Pendências conhecidas (NÃO feitas)
- RLS continua desligado em todas as tabelas (decisão do arquitetura.md). Ligar exige criar policies para cada tabela.
- (RESOLVIDO na Rodada 3/4) Histórico de leitura agora vem da tabela `leitura` no Historico.jsx e na sidebar do ObrasMangas.
- Perfil.jsx (~4.400 linhas) e PaginaInicial.jsx (~3.200) não foram divididos para evitar conflitos de merge com o grupo.

## Leitura.jsx e Favoritos.jsx (Sistema de Favoritos)
- Criado o botão "Favoritar" na tela de leitura de uma obra (`Leitura.jsx`), ao lado do título.
- A função de favoritar verifica se o usuário está logado, insere ou remove a relação na tabela `favoritos` do Supabase e altera a interface (coração cheio ou vazio) imediatamente.
- A página `Favoritos.jsx` foi remodelada para buscar diretamente no banco de dados todas as obras que o usuário logado favoritou, apresentando-as com a mesma grade visual de obras (`CardObra`).

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


# Histórico anterior (movido do antigo /backlog.md da raiz)


## 🔍 Filtros de Posts (PaginaInicial.jsx)
- Adicionado estado `filtroAtivo` com valor padrão `'Todos'`.
- Adicionado header `posts-section-header` com `flex + space-between` para alinhar o título "Posts em destaque" à esquerda e os botões de filtro à direita na mesma linha.
- Filtros disponíveis: **Todos, Anime, Mangá, Cosplay, Arte, Geral** — gerados dinamicamente via `.map()`.
- Botão ativo destacado em roxo com `box-shadow` de brilho.
- Filtragem aplicada em tempo real: posts são filtrados por `categoria` antes de renderizar.
- Mensagem de estado vazio exibida caso nenhum post corresponda ao filtro selecionado.
- Adicionados estilos no `paginainicial.css`: `.posts-section-header`, `.filtros-posts`, `.filtro-btn`, `.filtro-btn.ativo`, `.filtro-vazio`.

## 🗺️ Mini Mapa Interativo de São Paulo (PaginaInicial.jsx)
- Instalação das bibliotecas `leaflet` e `react-leaflet`.
- Criação do componente isolado [`MiniMapaSP.jsx`](src/components/MiniMapaSP.jsx) com:
  - **Mini mapa** na sidebar direita (tema dark CartoDB), clicável, sem zoom/drag.
  - **Efeito hover** com ícone de expansão e glow roxo.
  - **Modal expandido** ao clicar: mapa full-size com controles, pins coloridos por categoria e lista lateral de eventos.
  - **5 pins de eventos reais** com coordenadas de SP (SP Expo, Liberdade, Ibirapuera, Centro, Vila Mariana).
  - **Popups** ao clicar nos pins com nome, local, data e categoria estilizados no tema dark.
- Criação do [`minimapa.css`](src/css/minimapa.css) com todos os estilos (modal, lista, pins, popup, scrollbar).
- Substituição do antigo bloco `mapa-eventos` (HTML estático) pelo `<MiniMapaSP />` em `PaginaInicial.jsx`.


## Alterações na Estrutura (Perfil.jsx)
- Criação de uma estrutura de Layout (`profile-layout`) englobando uma nova Sidebar (`profile-sidebar`) e o contêiner principal (`profile-container`).
- Adição da barra lateral de navegação (Sidebar) contendo os itens "Meu Perfil", "Configurações" e "Sair" com ícones, mantendo-a separada da Navbar principal.
- Criação de um sistema de abas utilizando estado (`activeTab`) no React para alternar entre a visão de Perfil e Configurações de forma reativa.
- Atualização da estrutura HTML interna das seções para corresponder ao layout do design proposto (painel escuro, cartões individuais).
- Construção estrutural da aba de Configurações, separada em três blocos: "Dados Pessoais", "Segurança" e "Preferências", contendo todos os sub-itens descritos.

## Alterações de Estilo (perfil.css)
- Implementação de um Dark Theme completo baseado na referência visual.
- Alteração das cores de fundo para os tons escuros da imagem, aplicando classes utilitárias como `card-bg`.
- Estilização da nova Sidebar (`profile-sidebar`) com fundo transparente/escuro e highlight dinâmico no item ativo da aba.
- Adição da classe de animação `fade-in` para transições mais suaves ao alternar entre as abas.
- Estilização completa do conteúdo da aba Configurações (classes `settings-container`, `settings-section`, `settings-group`, etc.) mantendo as cores, bordas e botões no padrão Dark Premium do perfil.

## Nova Navbar Superior (Navbartestezin.jsx) — REMOVIDA em 2026-10-03 (não era usada em nenhuma página)
- Criação do componente isolado `Navbartestezin.jsx` para representar a Navbar do topo.
- Inclui o logotipo estilizado com Kanji ("ANIME 夢").
- Links de navegação (Início, Eventos, Mapa, Comunidade) com ícones.
- Criação do arquivo de estilo `navbartestezin.css` exclusivo, aplicando o design dark e responsividade da navbar.

## 📝 Botão e Modal de Criar Post (PaginaInicial.jsx)
- Adicionado botão "Criar Post" ao lado dos filtros na tela principal.
- Melhorada a aparência dos filtros para integrar visualmente o botão "Criar Post" em um contêiner `.filtros-wrapper`.
- Adicionado estado e modal para inserção de Título, Conteúdo, URL de Imagem e Categoria.
- As categorias no modal foram limitadas a (Geral, Anime, Mangá, Cosplay, Arte) para manter consistência com o filtro.
- Integrada a funcionalidade de submit com a tabela `postagens` do Supabase.
- Adicionados os estilos para o modal e botões no arquivo `paginainicial.css`.

## 👤 Visualização de Perfis Públicos (App.jsx, Perfil.jsx, PaginaInicial.jsx)
- **App.jsx:** Adicionada a rota dinâmica `/Perfil/:username` para permitir acessar o perfil de outros usuários através do link na URL.
- **Perfil.jsx:** Integrado `useParams` para ler o usuário da URL. Adicionada a flag `isMeuPerfil` para ocultar o menu lateral (Configurações, Sair) e o botão "Editar foto" quando se está visitando o perfil de outra pessoa.
- **PaginaInicial.jsx:** Transformados os nomes de usuário no feed, no modal da postagem e nos comentários em links (`<Link>`) que direcionam para o perfil daquele usuário. Adicionado `e.stopPropagation()` para impedir que ao clicar no nome, o modal abra simultaneamente.
