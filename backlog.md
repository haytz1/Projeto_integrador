# Relatório de Modificações - Página de Perfil

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

## Nova Navbar Superior (Navbartestezin.jsx)
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
