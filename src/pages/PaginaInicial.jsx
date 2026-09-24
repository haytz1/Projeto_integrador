import React, { useState, useEffect } from 'react';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import '../css/paginainicial.css';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function PaginaInicial() {
    const [posts, setPosts] = useState([]);
    const [postsHero, setPostsHero] = useState([]); // Posts aleatórios para o carrossel
    const [slideAtual, setSlideAtual] = useState(0); // Índice do slide ativo
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscarPostagens() {
            try {
                const { data, error } = await supabase
                    .from('postagens')
                    .select(`
                        id,
                        titulo,
                        conteudo,
                        categoria,
                        imagem,
                        criado_em,
                        usuarios (
                            username,
                            foto
                        )
                    `)
                    .order('criado_em', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    setPosts(data);

                    // Seleciona até 3 posts aleatórios para o carrossel do Hero
                    const postsEmbaralhados = [...data].sort(() => 0.5 - Math.random());
                    setPostsHero(postsEmbaralhados.slice(0, 3));
                }
            } catch (error) {
                console.error('Erro ao buscar postagens:', error.message);
            } finally {
                setCarregando(false);
            }
        }

        buscarPostagens();
    }, []);

    // Efeito para trocar o slide do carrossel automaticamente a cada 5 segundos
    useEffect(() => {
        if (postsHero.length === 0) return;

        const intervalo = setInterval(() => {
            setSlideAtual((prevSlide) => (prevSlide + 1) % postsHero.length);
        }, 5000);

        return () => clearInterval(intervalo);
    }, [postsHero]);

    const formatarData = (dataIso) => {
        if (!dataIso) return '';
        const data = new Date(dataIso);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <>
            <NavbarPesquisa />

            <div className="page-layout">
                
                {/* SIDEBAR ESQUERDA */}
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

                {/* CONTEÚDO PRINCIPAL */}
                <main className="main-content" id="main-content">

                    {/* HERO BANNER DINÂMICO E AUTOMÁTICO */}
                    <section className="hero-banner" aria-label="Destaque principal">
                        <div className="hero-slides">
                            {postsHero.length > 0 ? (
                                postsHero.map((post, index) => (
                                    <div 
                                        className={`hero-slide ${index === slideAtual ? 'active' : ''}`} 
                                        key={post.id}
                                    >
                                        <div 
                                            className="hero-bg" 
                                            style={{ 
                                                backgroundImage: post.imagem ? `url(${post.imagem})` : undefined,
                                                backgroundColor: '#1f1c2c'
                                            }}
                                        ></div>
                                        <div className="hero-overlay"></div>
                                        <div className="hero-content">
                                            <span className="hero-badge">{post.categoria || 'DESTAQUE'}</span>
                                            <h1 className="hero-title">{post.titulo}</h1>
                                            <p className="hero-desc">
                                                {post.conteudo.length > 100 ? post.conteudo.substring(0, 100) + '...' : post.conteudo}
                                            </p>
                                            <Link to={`/post/${post.id}`} className="btn-ver-mais">Ver mais</Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="hero-slide active">
                                    <div className="hero-bg" style={{ backgroundColor: '#1f1c2c' }}></div>
                                    <div className="hero-overlay"></div>
                                    <div className="hero-content">
                                        <span className="hero-badge">DESTAQUE</span>
                                        <h1 className="hero-title">CARREGANDO<br/>DESTAQUES...</h1>
                                        <p className="hero-desc">Aguarde enquanto buscamos as melhores histórias.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Indicadores (Bolinhas) dinâmicos */}
                        <div className="hero-dots" aria-label="Indicadores do carrossel">
                            {postsHero.map((_, index) => (
                                <button 
                                    key={index}
                                    className={`hero-dot ${index === slideAtual ? 'active' : ''}`} 
                                    onClick={() => setSlideAtual(index)}
                                    aria-label={`Slide ${index + 1}`}
                                ></button>
                            ))}
                        </div>
                    </section>

                    {/* SEÇÃO DE POSTS DINÂMICOS DO BANCO */}
                    <section className="posts-section" aria-labelledby="posts-titulo">
                        <h2 id="posts-titulo" className="section-title">🔥 Posts em destaque</h2>

                        <div className="posts-grid">
                            {carregando ? (
                                <p style={{ color: '#fff' }}>Carregando postagens...</p>
                            ) : posts.length > 0 ? (
                                posts.map((post) => (
                                    <article className="post-card" key={post.id}>
                                        <div 
                                            className="post-image" 
                                            style={{ 
                                                backgroundImage: post.imagem ? `url(${post.imagem})` : 'none',
                                                backgroundColor: '#2a2a2a' 
                                            }}
                                        >
                                            <span className="post-tag">{post.categoria || 'GERAL'}</span>
                                        </div>

                                        <div className="post-body">
                                            <h3 className="post-title">{post.titulo}</h3>
                                            
                                            <div className="post-author">
                                                <div 
                                                    className="author-avatar" 
                                                    style={{ 
                                                        backgroundImage: post.usuarios?.foto ? `url(${post.usuarios.foto})` : 'none',
                                                        backgroundSize: 'cover',
                                                        backgroundColor: '#444'
                                                    }}
                                                ></div>
                                                
                                                <div className="author-info">
                                                    <span className="author-name">
                                                        @{post.usuarios?.username || 'Usuário'}
                                                    </span>
                                                    <span className="author-time">{formatarData(post.criado_em)}</span>
                                                </div>
                                                <button className="post-more-btn" aria-label="Mais opções">···</button>
                                            </div>

                                            <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '8px' }}>
                                                {post.conteudo.length > 80 ? post.conteudo.substring(0, 80) + '...' : post.conteudo}
                                            </p>

                                            <div className="post-stats">
                                                <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 0</span>
                                                <span className="stat"><i className="ph ph-chat-circle"></i> 0</span>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <p style={{ color: '#fff' }}>Nenhuma postagem encontrada no momento.</p>
                            )}
                        </div>
                    </section>

                </main>

                {/* SIDEBAR DIREITA */}
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
                        </div>
                    </div>
                </aside>
            </div>

            {/* FOOTER */}
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