
import NavbarPesquisa from '../components/Navbar_pesquisa';
import '../css/paginainicial.css'
import { Link } from 'react-router-dom'

function PaginaInicial() {
    return (

        <>
            <NavbarPesquisa/>

            
            <div className="page-layout">

                
                <aside className="sidebar-left" aria-label="Menu lateral">
                    <Link to="/ObrasMangas" className="sidebar-notif" id="link-notificacoes">
                        <i className="ph-fill ph-bell notif-bell"></i>
                        <span>Notificações<br/><span className="notif-sub">de histórias</span> 🔥</span>
                    </Link>

                    <nav className="sidebar-nav">
                        <a href="#" className="sidebar-link active" id="nav-para-voce">
                            <i className="ph-fill ph-house"></i>
                            <span>Para você</span>
                        </a>
                        <a href="#" className="sidebar-link" id="nav-seguindo">
                            <i className="ph ph-user-circle-plus"></i>
                            <span>Seguindo</span>
                        </a>
                        <a href="#" className="sidebar-link" id="nav-explorar">
                            <i className="ph ph-compass"></i>
                            <span>Explorar</span>
                        </a>
                        <a href="#" className="sidebar-link" id="nav-novidades">
                            <i className="ph ph-star"></i>
                            <span>Novidades</span>
                        </a>
                        <a href="#" className="sidebar-link" id="nav-eventos">
                            <i className="ph ph-calendar"></i>
                            <span>Eventos</span>
                        </a>
                        <a href="#" className="sidebar-link" id="nav-favoritos">
                            <i className="ph ph-heart"></i>
                            <span>Favoritos</span>
                        </a>
                        <Link to="/Historico" className="sidebar-link" id="nav-historico">
                            <i className="ph ph-clock-counter-clockwise"></i>
                            <span>Histórico</span>
                        </Link>
                    </nav>

                    
                    <div className="sidebar-character" aria-hidden="true">
                        <div className="char-glow"></div>
                    </div>

                    
                    <div className="sidebar-apoiador">
                        <p className="apoiador-title">Seja um <strong>apoiador!</strong></p>
                        <p className="apoiador-desc">Apoie criadores independentes e receba benefícios exclusivos!</p>
                        <Link to="/Planos" className="btn-assinar" id="btn-assinar">
                            <i className="ph-fill ph-crown"></i> Assinar
                        </Link>
                    </div>
                </aside>

               
                <main className="main-content" id="main-content">

                    
                    <section className="hero-banner" aria-label="Destaque principal">
                        <div className="hero-slides">
                            <div className="hero-slide active">
                                <div className="hero-bg hero-bg-1"></div>
                                <div className="hero-overlay"></div>
                                <div className="hero-content">
                                    <span className="hero-badge">DESTAQUE</span>
                                    <h1 className="hero-title">OS GIGANTES<br/>NUNCA PARAM</h1>
                                    <p className="hero-desc">Acompanhe as notícias mais quentes<br/>do mundo dos animes e mangás!</p>
                                    <a href="#" className="btn-ver-mais" id="btn-ver-mais">Ver mais</a>
                                </div>
                            </div>
                            <div className="hero-slide">
                                <div className="hero-bg hero-bg-2"></div>
                                <div className="hero-overlay"></div>
                                <div className="hero-content">
                                    <span className="hero-badge">ANIME</span>
                                    <h1 className="hero-title">NOVOS ARCOS<br/>CHEGANDO</h1>
                                    <p className="hero-desc">As maiores estreias da temporada<br/>estão chegando ao Anime Spot!</p>
                                    <a href="#" className="btn-ver-mais">Ver mais</a>
                                </div>
                            </div>
                            <div className="hero-slide">
                                <div className="hero-bg hero-bg-3"></div>
                                <div className="hero-overlay"></div>
                                <div className="hero-content">
                                    <span className="hero-badge">MANGÁ</span>
                                    <h1 className="hero-title">CAPÍTULOS<br/>EXCLUSIVOS</h1>
                                    <p className="hero-desc">Leia em primeira mão os capítulos<br/>mais aguardados da semana!</p>
                                    <a href="#" className="btn-ver-mais">Ver mais</a>
                                </div>
                            </div>
                        </div>
                        <div className="hero-dots" aria-label="Indicadores do carrossel">
                            <button className="hero-dot active" data-slide="0" aria-label="Slide 1"></button>
                            <button className="hero-dot" data-slide="1" aria-label="Slide 2"></button>
                            <button className="hero-dot" data-slide="2" aria-label="Slide 3"></button>
                            <button className="hero-dot" data-slide="3" aria-label="Slide 4"></button>
                        </div>
                    </section>

                    
                    <section className="posts-section" aria-labelledby="posts-titulo">
                        <h2 id="posts-titulo" className="section-title">🔥 Posts em destaque</h2>

                        <div className="posts-grid">
                            
                            <article className="post-card" id="post-card-1">
                                <div className="post-image post-img-1">
                                    <span className="post-tag tag-news">NEWS</span>
                                </div>
                                <div className="post-body">
                                    <h3 className="post-title">One Piece: Novo arco promete mudar tudo!</h3>
                                    <div className="post-author">
                                        <div className="author-avatar av-1"></div>
                                        <div className="author-info">
                                            <span className="author-name">AnimeSpot News</span>
                                            <span className="author-time">há 3h</span>
                                        </div>
                                        <button className="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div className="post-stats">
                                        <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 1.2k</span>
                                        <span className="stat"><i className="ph ph-chat-circle"></i> 320</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article className="post-card" id="post-card-2">
                                <div className="post-image post-img-2">
                                    <span className="post-tag tag-manga">MANGÁ</span>
                                </div>
                                <div className="post-body">
                                    <h3 className="post-title">Jujutsu Kaisen: Capítulo mais insano até agora!</h3>
                                    <div className="post-author">
                                        <div className="author-avatar av-2"></div>
                                        <div className="author-info">
                                            <span className="author-name">MangaDaily</span>
                                            <span className="author-time">há 3h</span>
                                        </div>
                                        <button className="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div className="post-stats">
                                        <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 985</span>
                                        <span className="stat"><i className="ph ph-chat-circle"></i> 210</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article className="post-card" id="post-card-3">
                                <div className="post-image post-img-3">
                                    <span className="post-tag tag-anime">ANIME</span>
                                </div>
                                <div className="post-body">
                                    <h3 className="post-title">Demon Slayer: Filme bate novo recorde no Japão!</h3>
                                    <div className="post-author">
                                        <div className="author-avatar av-3"></div>
                                        <div className="author-info">
                                            <span className="author-name">Kimetsu News</span>
                                            <span className="author-time">há 5h</span>
                                        </div>
                                        <button className="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div className="post-stats">
                                        <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 1.5k</span>
                                        <span className="stat"><i className="ph ph-chat-circle"></i> 412</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article className="post-card" id="post-card-4">
                                <div className="post-image post-img-4">
                                    <span className="post-tag tag-art">ART</span>
                                </div>
                                <div className="post-body">
                                    <h3 className="post-title">As melhores fanarts da semana — votação aberta!</h3>
                                    <div className="post-author">
                                        <div className="author-avatar av-4"></div>
                                        <div className="author-info">
                                            <span className="author-name">ArtSpot</span>
                                            <span className="author-time">há 7h</span>
                                        </div>
                                        <button className="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div className="post-stats">
                                        <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 730</span>
                                        <span className="stat"><i className="ph ph-chat-circle"></i> 88</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article className="post-card" id="post-card-5">
                                <div className="post-image post-img-5">
                                    <span className="post-tag tag-teoria">TEORIA</span>
                                </div>
                                <div className="post-body">
                                    <h3 className="post-title">Teoria: O verdadeiro fim de Evangelion explicado</h3>
                                    <div className="post-author">
                                        <div className="author-avatar av-5"></div>
                                        <div className="author-info">
                                            <span className="author-name">TheoryHub</span>
                                            <span className="author-time">há 9h</span>
                                        </div>
                                        <button className="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div className="post-stats">
                                        <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 620</span>
                                        <span className="stat"><i className="ph ph-chat-circle"></i> 155</span>
                                    </div>
                                </div>
                            </article>

                            
                            <article className="post-card" id="post-card-6">
                                <div className="post-image post-img-6">
                                    <span className="post-tag tag-curiosidade">CURIOSIDADE</span>
                                </div>
                                <div className="post-body">
                                    <h3 className="post-title">Por que Totoro continua sendo o ícone do Studio Ghibli?</h3>
                                    <div className="post-author">
                                        <div className="author-avatar av-6"></div>
                                        <div className="author-info">
                                            <span className="author-name">Ghibli Fan</span>
                                            <span className="author-time">há 12h</span>
                                        </div>
                                        <button className="post-more-btn" aria-label="Mais opções">···</button>
                                    </div>
                                    <div className="post-stats">
                                        <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 445</span>
                                        <span className="stat"><i className="ph ph-chat-circle"></i> 67</span>
                                    </div>
                                </div>
                            </article>



                        </div>
                    </section>


                </main>

                
                <aside className="sidebar-right" aria-label="Informações adicionais">

                    <span className="widget-title">Mapa do Site</span>
                    
                    <div className="mapa-eventos">

                        <div className="pin pin-1">
                            <span className="pin-icon">📍</span>

                            <div className="map-evento-info">
                                <strong>Anime Friends</strong>
                                <span>📍 São Paulo Expo</span>
                                <span>📅 18 de julho</span>
                                <small>Animes</small>
                            </div>
                        </div>


                        <div className="pin pin-2">
                            <span className="pin-icon">📍</span>

                            <div className="map-evento-info">
                                <strong>Festival de Mangás</strong>
                                <span>📍 Liberdade</span>
                                <span>📅 25 de julho</span>
                                <small>Mangás</small>
                            </div>
                        </div>


                        <div className="pin pin-3">
                            <span className="pin-icon">📍</span>

                            <div className="map-evento-info">
                                <strong>Encontro Otaku</strong>
                                <span>📍 Centro de São Paulo</span>
                                <span>📅 2 de agosto</span>
                                <small>Comunidade</small>
                            </div>
                        </div>

                    </div>


                    
                    <div className="sidebar-widget" id="widget-eventos">
                        <div className="widget-header">
                            <h3 className="widget-title"><i className="ph ph-calendar-blank"></i> Próximos eventos</h3>
                            <a href="#" className="widget-ver-todos" id="link-ver-todos-eventos">Ver todos</a>
                        </div>
                        <div className="eventos-list">
                            <div className="evento-item" id="evento-1">
                                <div className="evento-data">
                                    <span className="evento-dia">25</span>
                                    <span className="evento-mes">MAI</span>
                                </div>
                                <div className="evento-info">
                                    <span className="evento-nome">Anime Summit 2025</span>
                                    <span className="evento-local">São Paulo, SP</span>
                                </div>
                                <span className="evento-badge badge-presencial">Presencial</span>
                            </div>
                            <div className="evento-item" id="evento-2">
                                <div className="evento-data">
                                    <span className="evento-dia">07</span>
                                    <span className="evento-mes">JUN</span>
                                </div>
                                <div className="evento-info">
                                    <span className="evento-nome">Japan Expo 2025</span>
                                    <span className="evento-local">Rio de Janeiro, RJ</span>
                                </div>
                                <span className="evento-badge badge-presencial">Presencial</span>
                            </div>
                            <div className="evento-item" id="evento-3">
                                <div className="evento-data">
                                    <span className="evento-dia">15</span>
                                    <span className="evento-mes">JUN</span>
                                </div>
                                <div className="evento-info">
                                    <span className="evento-nome">Concurso de Cosplay</span>
                                    <span className="evento-local">Online</span>
                                </div>
                                <span className="evento-badge badge-online">Online</span>
                            </div>
                        </div>
                    </div>

                    
                    <div className="sidebar-widget" id="widget-em-alta">
                        <h3 className="widget-title"><i className="ph-fill ph-lightning"></i> Em alta agora</h3>
                        <div className="em-alta-list">
                            <div className="em-alta-item" id="em-alta-1">
                                <span className="em-alta-num">1</span>
                                <span className="em-alta-nome">Solo Leveling 2ª temporada</span>
                                <span className="em-alta-tag">#anime</span>
                            </div>
                            <div className="em-alta-item" id="em-alta-2">
                                <span className="em-alta-num">2</span>
                                <span className="em-alta-nome">Boruto: Two Blue Vortex</span>
                                <span className="em-alta-tag">#mangá</span>
                            </div>
                            <div className="em-alta-item" id="em-alta-3">
                                <span className="em-alta-num">3</span>
                                <span className="em-alta-nome">Oshi no Ko 2ª temporada</span>
                                <span className="em-alta-tag">#anime</span>
                            </div>
                        </div>
                    </div>

                </aside>
            </div>

            
            <footer className="site-footer">
                <div className="footer-container">
                    <div className="footer-about">
                        <h3 className="footer-logo"><span className="logo-highlight">Anime</span>Spot</h3>
                        <p>O seu destino final para ler e descobrir os melhores animes, mangás e autores em um só lugar.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Navegação</h4>
                        <ul>
                            <li><Link to="/">Início</Link></li>
                            <li><Link to="/Planos">Planos</Link></li>
                            <li><a href="#">Explorar</a></li>
                            <li><a href="#">Eventos</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Suporte</h4>
                        <ul>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Termos de Uso</a></li>
                            <li><a href="#">Privacidade</a></li>
                            <li><a href="#">Contato</a></li>
                        </ul>
                    </div>
                    <div className="footer-social">
                        <h4>Redes Sociais</h4>
                        <div className="social-icons">
                            <a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo"></i></a>
                            <a href="#" aria-label="Twitter"><i className="ph ph-twitter-logo"></i></a>
                            <a href="#" aria-label="Discord"><i className="ph ph-discord-logo"></i></a>
                            <a href="#" aria-label="YouTube"><i className="ph ph-youtube-logo"></i></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Anime Spot — PI_UC3. Todos os direitos reservados.</p>
                </div>
            </footer>

        </>

    );
}

export default PaginaInicial;