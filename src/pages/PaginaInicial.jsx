import React, { useState, useEffect } from 'react';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape'
import '../css/paginainicial.css';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import '../css/modal-eventos.css';

const IMAGEM_POST_PADRAO = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop';
const AVATAR_PADRAO = 'https://api.dicebear.com/7.x/bottts/svg?seed=DefaultUser';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function PaginaInicial() {
    const [posts, setPosts] = useState([]);
    const [postsHero, setPostsHero] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [todosEventos, setTodosEventos] = useState([]);
    const [modalEventosAberto, setModalEventosAberto] = useState(false);

    // Estados do Modal e Comentários
    const [postSelecionado, setPostSelecionado] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [carregandoComentarios, setCarregandoComentarios] = useState(false);

    const [slideAtual, setSlideAtual] = useState(0);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscarDadosIniciais() {
            try {
                // 1. Buscar Postagens com contagem de comentários
                const { data: dataPosts, error: errorPosts } = await supabase
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
                        ),
                        comentarios (count)
                    `)
                    .order('criado_em', { ascending: false });

                if (errorPosts) throw errorPosts;

                if (dataPosts && dataPosts.length > 0) {
                    setPosts(dataPosts);
                    const postsEmbaralhados = [...dataPosts].sort(() => 0.5 - Math.random());
                    setPostsHero(postsEmbaralhados.slice(0, 3));
                }

                // 2. Buscar Eventos para a Sidebar
                const { data: dataEventos, error: errorEventos } = await supabase
                    .from('eventos')
                    .select('*')
                    .order('data_evento', { ascending: true })
                    .limit(3);

                if (errorEventos) throw errorEventos;
                if (dataEventos) setEventos(dataEventos);

                // 3. Buscar Todos os Eventos para o Modal
                const { data: dataTodosEventos, error: errorTodosEventos } = await supabase
                    .from('eventos')
                    .select('*')
                    .order('data_evento', { ascending: true });

                if (errorTodosEventos) throw errorTodosEventos;
                if (dataTodosEventos) setTodosEventos(dataTodosEventos);

            } catch (error) {
                console.error('Erro ao buscar dados:', error.message);
            } finally {
                setCarregando(false);
            }
        }

        buscarDadosIniciais();
    }, []);

    // Função para abrir o post e carregar os comentários vinculados
    const abrirDetalhesPost = async (post) => {
        setPostSelecionado(post);
        setCarregandoComentarios(true);
        try {
            const { data, error } = await supabase
                .from('comentarios')
                .select(`
                    id,
                    conteudo,
                    criado_em,
                    usuarios (
                        username,
                        foto
                    )
                `)
                .eq('id_postagem', post.id)
                .order('criado_em', { ascending: false });

            if (error) throw error;
            setComentarios(data || []);
        } catch (error) {
            console.error('Erro ao buscar comentários:', error.message);
        } finally {
            setCarregandoComentarios(false);
        }
    };

    // Função para enviar o comentário utilizando o usuario_id gravado no login
    const enviarComentario = async (e) => {
        e.preventDefault();
        if (!novoComentario.trim() || !postSelecionado) return;

        const usuarioId = localStorage.getItem('usuario_id');

        if (!usuarioId) {
            alert('Você precisa estar logado para comentar!');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('comentarios')
                .insert([
                    {
                        id_postagem: postSelecionado.id,
                        id_usuario: usuarioId,
                        conteudo: novoComentario.trim()
                    }
                ])
                .select(`
                    id,
                    conteudo,
                    criado_em,
                    usuarios (
                        username,
                        foto
                    )
                `);

            if (error) throw error;

            if (data && data.length > 0) {
                setComentarios([data[0], ...comentarios]);
                setNovoComentario('');

                setPosts(prevPosts =>
                    prevPosts.map(p => {
                        if (p.id === postSelecionado.id) {
                            const contadorAtual = p.comentarios?.[0]?.count || 0;
                            return {
                                ...p,
                                comentarios: [{ count: contadorAtual + 1 }]
                            };
                        }
                        return p;
                    })
                );
            }
        } catch (error) {
            console.error('Erro ao enviar comentário:', error.message);
            alert('Erro ao enviar comentário. Verifique sua conexão ou as políticas do banco (RLS).');
        }
    };

    // Timer do carrossel
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
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatarDataEvento = (dataIso) => {
        if (!dataIso) return { dia: '', mes: '', completo: '' };
        const data = new Date(dataIso);
        const dia = data.toLocaleDateString('pt-BR', { day: '2-digit' });
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
        const completo = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        return { dia, mes, completo };
    };

    return (
        <>
            <NavbarPesquisa />

            <div className="page-layout">
                {/* SIDEBAR ESQUERDA */}
                <aside className="sidebar-left" aria-label="Menu lateral">
                    <Link to="/ObrasMangas" className="sidebar-notif" id="link-notificacoes">
                        <i className="ph-fill ph-bell notif-bell"></i>
                        <span>Notificações<br /><span className="notif-sub">de histórias</span> 🔥</span>
                    </Link>

                    <nav className="sidebar-nav">
                        <a href="#" className="sidebar-link active"><i className="ph-fill ph-house"></i><span>Para você</span></a>
                        <a href="#" className="sidebar-link"><i className="ph ph-user-circle-plus"></i><span>Seguindo</span></a>
                        <a href="#" className="sidebar-link"><i className="ph ph-compass"></i><span>Explorar</span></a>
                        <a href="#" className="sidebar-link"><i className="ph ph-star"></i><span>Novidades</span></a>
                        <a href="#" className="sidebar-link"><i className="ph ph-calendar"></i><span>Eventos</span></a>
                        <a href="#" className="sidebar-link"><i className="ph ph-heart"></i><span>Favoritos</span></a>
                        <Link to="/Historico" className="sidebar-link"><i className="ph ph-clock-counter-clockwise"></i><span>Histórico</span></Link>
                    </nav>

                    <div className="sidebar-character" aria-hidden="true">
                        <div className="char-glow"></div>
                    </div>

                    <div className="sidebar-apoiador">
                        <p className="apoiador-title">Seja um <strong>apoiador!</strong></p>
                        <p className="apoiador-desc">Apoie criadores independentes e receba benefícios exclusivos!</p>
                        <Link to="/Planos" className="btn-assinar"><i className="ph-fill ph-crown"></i> Assinar</Link>
                    </div>
                </aside>

                {/* CONTEÚDO PRINCIPAL */}
                <main className="main-content" id="main-content">
                    <section className="hero-banner" aria-label="Destaque principal">
                        <div className="hero-slides">
                            {postsHero.length > 0 ? (
                                postsHero.map((post, index) => {
                                    const imagemHero = post.imagem ? post.imagem : IMAGEM_POST_PADRAO;
                                    return (
                                        <div className={`hero-slide ${index === slideAtual ? 'active' : ''}`} key={post.id}>
                                            <div className="hero-bg" style={{ backgroundImage: `url(${imagemHero})` }}></div>
                                            <div className="hero-overlay"></div>
                                            <div className="hero-content">
                                                <span className="hero-badge">{post.categoria || 'DESTAQUE'}</span>
                                                <h1 className="hero-title">{post.titulo}</h1>
                                                <p className="hero-desc">
                                                    {post.conteudo.length > 100 ? post.conteudo.substring(0, 100) + '...' : post.conteudo}
                                                </p>
                                                <button onClick={() => abrirDetalhesPost(post)} className="btn-ver-mais">
                                                    Ver mais <i className="ph ph-arrow-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="hero-slide active">
                                    <div className="hero-bg" style={{ backgroundColor: '#1f1c2c' }}></div>
                                    <div className="hero-overlay"></div>
                                    <div className="hero-content">
                                        <span className="hero-badge">DESTAQUE</span>
                                        <h1 className="hero-title">CARREGANDO<br />DESTAQUES...</h1>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controles manuais do carrossel */}
                        {postsHero.length > 1 && (
                            <div className="hero-controls">
                                <button
                                    className="hero-arrow"
                                    onClick={() => setSlideAtual((prev) => (prev === 0 ? postsHero.length - 1 : prev - 1))}
                                    aria-label="Slide anterior"
                                >
                                    <i className="ph ph-caret-left"></i>
                                </button>
                                <div className="hero-dots">
                                    {postsHero.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`hero-dot ${idx === slideAtual ? 'active' : ''}`}
                                            onClick={() => setSlideAtual(idx)}
                                            aria-label={`Ir para slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                                <button
                                    className="hero-arrow"
                                    onClick={() => setSlideAtual((prev) => (prev + 1) % postsHero.length)}
                                    aria-label="Próximo slide"
                                >
                                    <i className="ph ph-caret-right"></i>
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="posts-section" aria-labelledby="posts-titulo">
                        <h2 id="posts-titulo" className="section-title">🔥 Posts em destaque</h2>

                        <div className="posts-grid">
                            {carregando ? (
                                <p style={{ color: '#fff' }}>Carregando postagens...</p>
                            ) : posts.length > 0 ? (
                                posts.map((post) => {
                                    const imagemPost = post.imagem ? post.imagem : IMAGEM_POST_PADRAO;
                                    const fotoPerfil = post.usuarios?.foto ? post.usuarios.foto : AVATAR_PADRAO;
                                    const totalComentarios = post.comentarios?.[0]?.count || 0;

                                    return (
                                        <article className="post-card" key={post.id} onClick={() => abrirDetalhesPost(post)} style={{ cursor: 'pointer' }}>
                                            <div className="post-image" style={{ backgroundImage: `url(${imagemPost})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#2a2a2a' }}>
                                                <span className="post-tag">{post.categoria || 'GERAL'}</span>
                                            </div>

                                            <div className="post-body">
                                                <h3 className="post-title">{post.titulo}</h3>

                                                <div className="post-author">
                                                    <div className="author-avatar" style={{ backgroundImage: `url(${fotoPerfil})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                                    <div className="author-info">
                                                        <span className="author-name">@{post.usuarios?.username || 'Usuário'}</span>
                                                        <span className="author-time">{formatarData(post.criado_em)}</span>
                                                    </div>
                                                </div>

                                                <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '8px' }}>
                                                    {post.conteudo.length > 80 ? post.conteudo.substring(0, 80) + '...' : post.conteudo}
                                                </p>

                                                <div className="post-stats">
                                                    <span className="stat"><i className="ph-fill ph-heart stat-heart"></i> 0</span>
                                                    <span className="stat"><i className="ph ph-chat-circle"></i> {totalComentarios}</span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
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
                            <button
                                onClick={() => setModalEventosAberto(true)}
                                className="widget-ver-todos"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7' }}
                            >
                                Ver todos
                            </button>
                        </div>
                        <div className="eventos-list">
                            {eventos.length > 0 ? (
                                eventos.map((evento) => {
                                    const { dia, mes } = formatarDataEvento(evento.data_evento);
                                    return (
                                        <div className="evento-item" key={evento.id}>
                                            <div className="evento-data">
                                                <span className="evento-dia">{dia}</span>
                                                <span className="evento-mes">{mes}</span>
                                            </div>
                                            <div className="evento-info">
                                                <span className="evento-nome">{evento.nome}</span>
                                                <span className="evento-local">{evento.local}</span>
                                            </div>
                                            <span className="evento-badge badge-presencial">{evento.tipo || 'Presencial'}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: '#aaa', fontSize: '0.85rem', padding: '10px 0' }}>Nenhum evento cadastrado.</p>
                            )}
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

            {/* MODAL DE TODOS OS EVENTOS (VER TODOS) */}
            {modalEventosAberto && (
                <div className="eventos-modal-overlay" onClick={() => setModalEventosAberto(false)}>
                    <div className="eventos-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="eventos-modal-header">
                            <h2 className="eventos-modal-title">
                                <i className="ph ph-calendar-blank"></i> Todos os Próximos Eventos
                            </h2>
                            <button onClick={() => setModalEventosAberto(false)} className="eventos-modal-close">&times;</button>
                        </div>
                        <div className="eventos-modal-body">
                            {todosEventos.length > 0 ? (
                                todosEventos.map((evento) => {
                                    const { dia, mes, completo } = formatarDataEvento(evento.data_evento);
                                    return (
                                        <div className="evento-card-modal" key={evento.id}>
                                            <div className="evento-card-data">
                                                <span className="evento-card-dia">{dia}</span>
                                                <span className="evento-card-mes">{mes}</span>
                                            </div>
                                            <div className="evento-card-info">
                                                <span className="evento-card-nome">{evento.nome}</span>
                                                <span className="evento-card-local">{evento.local} • {completo}</span>
                                            </div>
                                            <span className="evento-badge badge-presencial">{evento.tipo || 'Presencial'}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '20px' }}>Nenhum evento encontrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ESTILO INSTAGRAM PARA O POST E COMENTÁRIOS */}
            {postSelecionado && (
                <div className="instagram-modal-overlay">
                    <button onClick={() => setPostSelecionado(null)} className="instagram-modal-close">&times;</button>

                    <div className="instagram-modal-container">
                        {/* Lado Esquerdo: Imagem */}
                        <div className="instagram-modal-image-side">
                            <div className="instagram-modal-image" style={{ backgroundImage: `url(${postSelecionado.imagem || IMAGEM_POST_PADRAO})` }}></div>
                        </div>

                        {/* Lado Direito: Informações e Comentários */}
                        <div className="instagram-modal-info-side">
                            <div className="instagram-modal-header">
                                <div className="instagram-modal-avatar" style={{ backgroundImage: `url(${postSelecionado.usuarios?.foto || AVATAR_PADRAO})` }}></div>
                                <div>
                                    <span className="instagram-modal-username">@{postSelecionado.usuarios?.username || 'Usuário'}</span>
                                    <span className="instagram-modal-category">{postSelecionado.categoria || 'GERAL'}</span>
                                </div>
                            </div>

                            <div className="instagram-modal-scroll">
                                <div>
                                    <h2 className="instagram-modal-title">{postSelecionado.titulo}</h2>
                                    <p className="instagram-modal-content-text">{postSelecionado.conteudo}</p>
                                    <span className="instagram-modal-date">{formatarData(postSelecionado.criado_em)}</span>
                                </div>

                                <hr className="instagram-modal-divider" />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <h3 className="instagram-comments-title">Comentários</h3>

                                    {carregandoComentarios ? (
                                        <p style={{ color: '#888', fontSize: '0.85rem' }}>Carregando comentários...</p>
                                    ) : comentarios.length > 0 ? (
                                        comentarios.map((comentario) => (
                                            <div key={comentario.id} className="instagram-comment-item">
                                                <div className="instagram-comment-avatar" style={{ backgroundImage: `url(${comentario.usuarios?.foto || AVATAR_PADRAO})` }}></div>
                                                <div className="instagram-comment-bubble">
                                                    <div className="instagram-comment-header">
                                                        <span className="instagram-comment-user">@{comentario.usuarios?.username || 'Usuário'}</span>
                                                        <span className="instagram-comment-time">{formatarData(comentario.criado_em)}</span>
                                                    </div>
                                                    <p className="instagram-comment-text">{comentario.conteudo}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#777', fontSize: '0.85rem', fontStyle: 'italic' }}>Nenhum comentário ainda. Seja o primeiro!</p>
                                    )}
                                </div>
                            </div>

                            <div className="instagram-modal-footer">
                                <form onSubmit={enviarComentario} className="instagram-comment-form">
                                    <input
                                        type="text"
                                        placeholder="Adicione um comentário..."
                                        value={novoComentario}
                                        onChange={(e) => setNovoComentario(e.target.value)}
                                        className="instagram-comment-input"
                                    />
                                    <button type="submit" className="instagram-comment-submit">Publicar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Rodape/>
        </>
    );
}

export default PaginaInicial;