import './css/app.css'

function App() {
    return (

        <>

            


            <nav class="navbar" role="navigation" aria-label="Navegação principal">
                <div class="nav-left">
                    <a href="#" class="nav-logo" aria-label="Anime Spot - Página inicial">
                        <span class="logo-text"><span class="logo-highlight">Anime</span>Spot</span>
                    </a>
                </div>

                <div class="nav-center">
                    <div class="search-bar">
                        <i class="ph ph-magnifying-glass"></i>
                        <input type="text" id="search-input" placeholder="Buscar animes, mangás, notícias..."
                            aria-label="Buscar conteúdo"/>
                    </div>
                </div>

                <div class="nav-right">
                    <a href="login.html" class="btn-entrar" id="btn-entrar">Entrar</a>
                    <a href="login.html" class="btn-criar-conta" id="btn-criar-conta">
                        Criar conta <i class="ph ph-user"></i>
                    </a>
                </div>
            </nav>

            
            <div class="page-layout">

                
                <aside class="sidebar-left" aria-label="Menu lateral">
                    <a href="./filtro_historias.html" class="sidebar-notif" id="link-notificacoes">
                        <i class="ph-fill ph-bell notif-bell"></i>
                        <span>Notificações<br/><span class="notif-sub">de histórias</span> 🔥</span>
                    </a>

                    <nav class="sidebar-nav">
                        <a href="#" class="sidebar-link active" id="nav-para-voce">
                            <i class="ph-fill ph-house"></i>
                            <span>Para você</span>
                        </a>
                        <a href="#" class="sidebar-link" id="nav-seguindo">
                            <i class="ph ph-user-circle-plus"></i>
                            <span>Seguindo</span>
                        </a>
                        <a href="#" class="sidebar-link" id="nav-explorar">
                            <i class="ph ph-compass"></i>
                            <span>Explorar</span>
                        </a>
                        <a href="#" class="sidebar-link" id="nav-novidades">
                            <i class="ph ph-star"></i>
                            <span>Novidades</span>
                        </a>
                        <a href="#" class="sidebar-link" id="nav-eventos">
                            <i class="ph ph-calendar"></i>
                            <span>Eventos</span>
                        </a>
                        <a href="#" class="sidebar-link" id="nav-favoritos">
                            <i class="ph ph-heart"></i>
                            <span>Favoritos</span>
                        </a>
                        <a href="#" class="sidebar-link" id="nav-historico">
                            <i class="ph ph-clock-counter-clockwise"></i>
                            <span>Histórico</span>
                        </a>
                    </nav>

                    
                    <div class="sidebar-character" aria-hidden="true">
                        <div class="char-glow"></div>
                    </div>

                    
                    <div class="sidebar-apoiador">
                        <p class="apoiador-title">Seja um <strong>apoiador!</strong></p>
                        <p class="apoiador-desc">Apoie criadores independentes e receba benefícios exclusivos!</p>
                        <a href="planos.html" class="btn-assinar" id="btn-assinar">
                            <i class="ph-fill ph-crown"></i> Assinar
                        </a>
                    </div>
                </aside>

               
                <main class="main-content" id="main-content">

                    
                    <section class="hero-banner" aria-label="Destaque principal">
                        <div class="hero-slides">
                            <div class="hero-slide active">
                                <div class="hero-bg hero-bg-1"></div>
                                <div class="hero-overlay"></div>
                                <div class="hero-content">
                                    <span class="hero-badge">DESTAQUE</span>
                                    <h1 class="hero-title">OS GIGANTES<br/>NUNCA PARAM</h1>
                                    <p class="hero-desc">Acompanhe as notícias mais quentes<br/>do mundo dos animes e mangás!</p>
                                    <a href="#" class="btn-ver-mais" id="btn-ver-mais">Ver mais</a>
                                </div>
                            </div>
                            <div class="hero-slide">
                                <div class="hero-bg hero-bg-2"></div>
                                <div class="hero-overlay"></div>
                                <div class="hero-content">
                                    <span class="hero-badge">ANIME</span>
                                    <h1 class="hero-title">NOVOS ARCOS<br/>CHEGANDO</h1>
                                    <p class="hero-desc">As maiores estreias da temporada<br/>estão chegando ao Anime Spot!</p>
                                    <a href="#" class="btn-ver-mais">Ver mais</a>
                                </div>
                            </div>
                            <div class="hero-slide">
                                <div class="hero-bg hero-bg-3"></div>
                                <div class="hero-overlay"></div>
                                <div class="hero-content">
                                    <span class="hero-badge">MANGÁ</span>
                                    <h1 class="hero-title">CAPÍTULOS<br/>EXCLUSIVOS</h1>
                                    <p class="hero-desc">Leia em primeira mão os capítulos<br/>mais aguardados da semana!</p>
                                    <a href="#" class="btn-ver-mais">Ver mais</a>
                                </div>
                            </div>
                        </div>
                        <div class="hero-dots" aria-label="Indicadores do carrossel">
                            <button class="hero-dot active" data-slide="0" aria-label="Slide 1"></button>
                            <button class="hero-dot" data-slide="1" aria-label="Slide 2"></button>
                            <button class="hero-dot" data-slide="2" aria-label="Slide 3"></button>
                            <button class="hero-dot" data-slide="3" aria-label="Slide 4"></button>
                        </div>
                    </section>

                    
                    <section class="posts-section" aria-labelledby="posts-titulo">
                        <h2 id="posts-titulo" class="section-title">🔥 Posts em destaque</h2>

                        <div class="posts-grid">
                            
                            <article class="post-card" id="post-card-1">
                                <div class="post-image post-img-1">
                                    <span class="post-tag tag-news">NEWS</span>
                                </div>
                                <div class="post-body">
                                    <h3 class="post-title">One Piece: Novo arco promete mudar tudo!</h3>
                                    <div class="post-author">
                                        <div class="author-avatar av-1"></div>
                                        <div class="author-info">
                                            <span class="author-name">AnimeSpot News</span>
                                            <span class="author-time">há 3h</span>
                                        </div>
                                        <button class="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div class="post-stats">
                                        <span class="stat"><i class="ph-fill ph-heart stat-heart"></i> 1.2k</span>
                                        <span class="stat"><i class="ph ph-chat-circle"></i> 320</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article class="post-card" id="post-card-2">
                                <div class="post-image post-img-2">
                                    <span class="post-tag tag-manga">MANGÁ</span>
                                </div>
                                <div class="post-body">
                                    <h3 class="post-title">Jujutsu Kaisen: Capítulo mais insano até agora!</h3>
                                    <div class="post-author">
                                        <div class="author-avatar av-2"></div>
                                        <div class="author-info">
                                            <span class="author-name">MangaDaily</span>
                                            <span class="author-time">há 3h</span>
                                        </div>
                                        <button class="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div class="post-stats">
                                        <span class="stat"><i class="ph-fill ph-heart stat-heart"></i> 985</span>
                                        <span class="stat"><i class="ph ph-chat-circle"></i> 210</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article class="post-card" id="post-card-3">
                                <div class="post-image post-img-3">
                                    <span class="post-tag tag-anime">ANIME</span>
                                </div>
                                <div class="post-body">
                                    <h3 class="post-title">Demon Slayer: Filme bate novo recorde no Japão!</h3>
                                    <div class="post-author">
                                        <div class="author-avatar av-3"></div>
                                        <div class="author-info">
                                            <span class="author-name">Kimetsu News</span>
                                            <span class="author-time">há 5h</span>
                                        </div>
                                        <button class="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div class="post-stats">
                                        <span class="stat"><i class="ph-fill ph-heart stat-heart"></i> 1.5k</span>
                                        <span class="stat"><i class="ph ph-chat-circle"></i> 412</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article class="post-card" id="post-card-4">
                                <div class="post-image post-img-4">
                                    <span class="post-tag tag-art">ART</span>
                                </div>
                                <div class="post-body">
                                    <h3 class="post-title">As melhores fanarts da semana — votação aberta!</h3>
                                    <div class="post-author">
                                        <div class="author-avatar av-4"></div>
                                        <div class="author-info">
                                            <span class="author-name">ArtSpot</span>
                                            <span class="author-time">há 7h</span>
                                        </div>
                                        <button class="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div class="post-stats">
                                        <span class="stat"><i class="ph-fill ph-heart stat-heart"></i> 730</span>
                                        <span class="stat"><i class="ph ph-chat-circle"></i> 88</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article class="post-card" id="post-card-5">
                                <div class="post-image post-img-5">
                                    <span class="post-tag tag-teoria">TEORIA</span>
                                </div>
                                <div class="post-body">
                                    <h3 class="post-title">Teoria: O verdadeiro fim de Evangelion explicado</h3>
                                    <div class="post-author">
                                        <div class="author-avatar av-5"></div>
                                        <div class="author-info">
                                            <span class="author-name">TheoryHub</span>
                                            <span class="author-time">há 9h</span>
                                        </div>
                                        <button class="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div class="post-stats">
                                        <span class="stat"><i class="ph-fill ph-heart stat-heart"></i> 620</span>
                                        <span class="stat"><i class="ph ph-chat-circle"></i> 155</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article class="post-card" id="post-card-6">
                                <div class="post-image post-img-6">
                                    <span class="post-tag tag-curiosidade">CURIOSIDADE</span>
                                </div>
                                <div class="post-body">
                                    <h3 class="post-title">Por que Totoro continua sendo o ícone do Studio Ghibli?</h3>
                                    <div class="post-author">
                                        <div class="author-avatar av-6"></div>
                                        <div class="author-info">
                                            <span class="author-name">Ghibli Fan</span>
                                            <span class="author-time">há 12h</span>
                                        </div>
                                        <button class="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div class="post-stats">
                                        <span class="stat"><i class="ph-fill ph-heart stat-heart"></i> 445</span>
                                        <span class="stat"><i class="ph ph-chat-circle"></i> 67</span>
                                    </div>
                                </div>
                            </article>



                        </div>
                    </section>


                </main>

                
                <aside class="sidebar-right" aria-label="Informações adicionais">

                    <span class="widget-title">Mapa do Site</span>
                    
                    <div class="mapa-eventos">

                        <div class="pin pin-1">
                            <span class="pin-icon">📍</span>

                            <div class="map-evento-info">
                                <strong>Anime Friends</strong>
                                <span>📍 São Paulo Expo</span>
                                <span>📅 18 de julho</span>
                                <small>Animes</small>
                            </div>
                        </div>


                        <div class="pin pin-2">
                            <span class="pin-icon">📍</span>

                            <div class="map-evento-info">
                                <strong>Festival de Mangás</strong>
                                <span>📍 Liberdade</span>
                                <span>📅 25 de julho</span>
                                <small>Mangás</small>
                            </div>
                        </div>


                        <div class="pin pin-3">
                            <span class="pin-icon">📍</span>

                            <div class="map-evento-info">
                                <strong>Encontro Otaku</strong>
                                <span>📍 Centro de São Paulo</span>
                                <span>📅 2 de agosto</span>
                                <small>Comunidade</small>
                            </div>
                        </div>

                    </div>


                    
                    <div class="sidebar-widget" id="widget-eventos">
                        <div class="widget-header">
                            <h3 class="widget-title"><i class="ph ph-calendar-blank"></i> Próximos eventos</h3>
                            <a href="#" class="widget-ver-todos" id="link-ver-todos-eventos">Ver todos</a>
                        </div>
                        <div class="eventos-list">
                            <div class="evento-item" id="evento-1">
                                <div class="evento-data">
                                    <span class="evento-dia">25</span>
                                    <span class="evento-mes">MAI</span>
                                </div>
                                <div class="evento-info">
                                    <span class="evento-nome">Anime Summit 2025</span>
                                    <span class="evento-local">São Paulo, SP</span>
                                </div>
                                <span class="evento-badge badge-presencial">Presencial</span>
                            </div>
                            <div class="evento-item" id="evento-2">
                                <div class="evento-data">
                                    <span class="evento-dia">07</span>
                                    <span class="evento-mes">JUN</span>
                                </div>
                                <div class="evento-info">
                                    <span class="evento-nome">Japan Expo 2025</span>
                                    <span class="evento-local">Rio de Janeiro, RJ</span>
                                </div>
                                <span class="evento-badge badge-presencial">Presencial</span>
                            </div>
                            <div class="evento-item" id="evento-3">
                                <div class="evento-data">
                                    <span class="evento-dia">15</span>
                                    <span class="evento-mes">JUN</span>
                                </div>
                                <div class="evento-info">
                                    <span class="evento-nome">Concurso de Cosplay</span>
                                    <span class="evento-local">Online</span>
                                </div>
                                <span class="evento-badge badge-online">Online</span>
                            </div>
                        </div>
                    </div>

                    
                    <div class="sidebar-widget" id="widget-em-alta">
                        <h3 class="widget-title"><i class="ph-fill ph-lightning"></i> Em alta agora</h3>
                        <div class="em-alta-list">
                            <div class="em-alta-item" id="em-alta-1">
                                <span class="em-alta-num">1</span>
                                <span class="em-alta-nome">Solo Leveling 2ª temporada</span>
                                <span class="em-alta-tag">#anime</span>
                            </div>
                            <div class="em-alta-item" id="em-alta-2">
                                <span class="em-alta-num">2</span>
                                <span class="em-alta-nome">Boruto: Two Blue Vortex</span>
                                <span class="em-alta-tag">#mangá</span>
                            </div>
                            <div class="em-alta-item" id="em-alta-3">
                                <span class="em-alta-num">3</span>
                                <span class="em-alta-nome">Oshi no Ko 2ª temporada</span>
                                <span class="em-alta-tag">#anime</span>
                            </div>
                        </div>
                    </div>

                </aside>
            </div>

            
            <footer class="site-footer">
                <div class="footer-container">
                    <div class="footer-about">
                        <h3 class="footer-logo"><span class="logo-highlight">Anime</span>Spot</h3>
                        <p>O seu destino final para ler e descobrir os melhores animes, mangás e autores em um só lugar.</p>
                    </div>
                    <div class="footer-links">
                        <h4>Navegação</h4>
                        <ul>
                            <li><a href="#">Início</a></li>
                            <li><a href="planos.html">Planos</a></li>
                            <li><a href="#">Explorar</a></li>
                            <li><a href="#">Eventos</a></li>
                        </ul>
                    </div>
                    <div class="footer-links">
                        <h4>Suporte</h4>
                        <ul>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Termos de Uso</a></li>
                            <li><a href="#">Privacidade</a></li>
                            <li><a href="#">Contato</a></li>
                        </ul>
                    </div>
                    <div class="footer-social">
                        <h4>Redes Sociais</h4>
                        <div class="social-icons">
                            <a href="#" aria-label="Instagram"><i class="ph ph-instagram-logo"></i></a>
                            <a href="#" aria-label="Twitter"><i class="ph ph-twitter-logo"></i></a>
                            <a href="#" aria-label="Discord"><i class="ph ph-discord-logo"></i></a>
                            <a href="#" aria-label="YouTube"><i class="ph ph-youtube-logo"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 Anime Spot — PI_UC3. Todos os direitos reservados.</p>
                </div>
            </footer>

        </>

    );
}

export default App;