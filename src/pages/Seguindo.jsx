import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '/supabase.js';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/historico.css';

const AVATAR_PADRAO = 'https://api.dicebear.com/7.x/bottts/svg?seed=DefaultUser';

const IMAGEM_POST_PADRAO =
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop';

function Seguindo() {
    const meuId = Number(localStorage.getItem('usuario_id')) || null;

    const [autores, setAutores] = useState([]);
    const [posts, setPosts] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [removendoId, setRemovendoId] = useState(null);

    // =========================================
    // BUSCAR QUEM EU SIGO + POSTS DELES
    // =========================================

    useEffect(() => {
        async function buscarDados() {
            if (!meuId) {
                setCarregando(false);
                return;
            }

            try {
                const { data: seguidos, error: erroSeguidos } = await supabase
                    .from('seguidores')
                    .select(
                        `
                        id_seguido,
                        criado_em,
                        usuarios!seguidores_id_seguido_fkey (
                            id,
                            username,
                            foto
                        )
                    `,
                    )
                    .eq('id_seguidor', meuId)
                    .order('criado_em', { ascending: false });

                if (erroSeguidos) throw erroSeguidos;

                const listaAutores = (seguidos || [])
                    .map((s) => s.usuarios)
                    .filter(Boolean);

                setAutores(listaAutores);

                if (listaAutores.length === 0) {
                    setPosts([]);
                    return;
                }

                const ids = listaAutores.map((a) => a.id);

                const { data: dataPosts, error: erroPosts } = await supabase
                    .from('postagens')
                    .select(
                        `
                        id,
                        titulo,
                        conteudo,
                        categoria,
                        imagem,
                        criado_em,
                        id_usuario,

                        usuarios!postagens_id_usuario_fkey (
                            id,
                            username,
                            foto
                        ),

                        comentarios (
                            count
                        ),

                        curtidas (
                            count
                        )
                    `,
                    )
                    .in('id_usuario', ids)
                    .order('criado_em', { ascending: false });

                if (erroPosts) throw erroPosts;

                setPosts(dataPosts || []);
            } catch (error) {
                console.error('Erro ao buscar seguindo:', error);
            } finally {
                setCarregando(false);
            }
        }

        buscarDados();
    }, [meuId]);

    // =========================================
    // DEIXAR DE SEGUIR
    // =========================================

    const deixarDeSeguir = async (autor) => {
        if (!meuId || removendoId) return;

        const confirmou = window.confirm(
            `Deixar de seguir @${autor.username}?`,
        );

        if (!confirmou) return;

        setRemovendoId(autor.id);

        try {
            const { error } = await supabase
                .from('seguidores')
                .delete()
                .eq('id_seguidor', meuId)
                .eq('id_seguido', autor.id);

            if (error) throw error;

            setAutores((prev) => prev.filter((a) => a.id !== autor.id));
            setPosts((prev) => prev.filter((p) => p.id_usuario !== autor.id));
        } catch (error) {
            console.error('Erro ao deixar de seguir:', error);
            alert('Não foi possível deixar de seguir.');
        } finally {
            setRemovendoId(null);
        }
    };

    const formatarData = (dataIso) =>
        dataIso
            ? new Date(dataIso).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
              })
            : '';

    // =========================================
    // ESTADO VAZIO (reaproveitado)
    // =========================================

    const EstadoVazio = ({ icone, titulo, texto, botaoTexto, botaoLink }) => (
        <div
            style={{
                background: 'rgba(168, 85, 247, 0.07)',
                border: '1px dashed rgba(168, 85, 247, 0.3)',
                padding: '4rem 2rem',
                borderRadius: '16px',
                textAlign: 'center',
            }}
        >
            <i
                className={`ph ${icone}`}
                style={{
                    fontSize: '4.5rem',
                    color: '#a855f7',
                    display: 'block',
                    marginBottom: '1.2rem',
                }}
            ></i>

            <p
                style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                }}
            >
                {titulo}
            </p>

            <p
                style={{
                    color: '#888',
                    fontSize: '0.95rem',
                    marginBottom: '1.5rem',
                }}
            >
                {texto}
            </p>

            <Link
                to={botaoLink}
                style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                }}
            >
                {botaoTexto}
            </Link>
        </div>
    );

    return (
        <>
            <NavbarPesquisa />

            <main
                className="container"
                style={{
                    padding: '2rem 2rem 4rem',
                    paddingTop: 'calc(64px + 2rem)',
                    minHeight: '80vh',
                }}
            >
                <header
                    className="cabecalho-historico"
                    style={{ marginBottom: '2rem' }}
                >
                    <h1
                        style={{
                            color: '#fff',
                            fontSize: '2rem',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Autores que você segue
                    </h1>

                    <p style={{ color: '#aaa', fontSize: '1rem' }}>
                        Fique por dentro das novidades dos seus autores
                        favoritos
                    </p>
                </header>

                {/* =========================================
                    NÃO LOGADO
                ========================================= */}

                {!meuId ? (
                    <EstadoVazio
                        icone="ph-sign-in"
                        titulo="Entre para ver quem você segue"
                        texto="Faça login para acompanhar os autores que você segue."
                        botaoTexto="Fazer login"
                        botaoLink="/Login"
                    />
                ) : carregando ? (
                    <p style={{ color: '#aaa' }}>Carregando...</p>
                ) : autores.length === 0 ? (
                    <EstadoVazio
                        icone="ph-user-circle-plus"
                        titulo="Você ainda não está seguindo ninguém"
                        texto="Explore postagens e comece a seguir autores para ver o conteúdo deles aqui!"
                        botaoTexto="Explorar postagens"
                        botaoLink="/"
                    />
                ) : (
                    <>
                        {/* =========================================
                            AUTORES
                        ========================================= */}

                        <section
                            aria-label="Autores seguidos"
                            style={{ marginBottom: '2.5rem' }}
                        >
                            <h2
                                style={{
                                    color: '#fff',
                                    fontSize: '1.1rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                Seguindo {autores.length}{' '}
                                {autores.length === 1 ? 'autor' : 'autores'}
                            </h2>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: '12px',
                                }}
                            >
                                {autores.map((autor) => (
                                    <div
                                        key={autor.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 14px',
                                            background: '#161b22',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '12px',
                                        }}
                                    >
                                        <Link
                                            to={`/Perfil/${autor.id}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                flex: 1,
                                                minWidth: 0,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '50%',
                                                    flexShrink: 0,
                                                    backgroundImage: `url(${
                                                        autor.foto ||
                                                        AVATAR_PADRAO
                                                    })`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition:
                                                        'center',
                                                    backgroundColor: '#444',
                                                }}
                                            ></div>

                                            <span
                                                style={{
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                @{autor.username}
                                            </span>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deixarDeSeguir(autor)
                                            }
                                            disabled={
                                                removendoId === autor.id
                                            }
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '999px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                cursor:
                                                    removendoId === autor.id
                                                        ? 'default'
                                                        : 'pointer',
                                                border: '1px solid #444',
                                                background: 'transparent',
                                                color: '#fff',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {removendoId === autor.id
                                                ? '...'
                                                : 'Seguindo'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* =========================================
                            POSTS DOS AUTORES
                        ========================================= */}

                        <section aria-label="Postagens de quem você segue">
                            <h2
                                style={{
                                    color: '#fff',
                                    fontSize: '1.1rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                Novidades
                            </h2>

                            {posts.length === 0 ? (
                                <p style={{ color: '#888' }}>
                                    Os autores que você segue ainda não
                                    publicaram nada.
                                </p>
                            ) : (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fill, minmax(260px, 1fr))',
                                        gap: '16px',
                                    }}
                                >
                                    {posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            to={`/Perfil/${post.id_usuario}`}
                                            style={{
                                                background: '#161b22',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '14px',
                                                overflow: 'hidden',
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '160px',
                                                    backgroundImage: `url(${
                                                        post.imagem ||
                                                        IMAGEM_POST_PADRAO
                                                    })`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition:
                                                        'center',
                                                    backgroundColor:
                                                        '#2a2a2a',
                                                }}
                                            ></div>

                                            <div
                                                style={{
                                                    padding: '12px 14px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        color: '#fff',
                                                        fontSize: '0.95rem',
                                                        fontWeight: 600,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {post.titulo}
                                                </h3>

                                                <p
                                                    style={{
                                                        color: '#aaa',
                                                        fontSize: '0.85rem',
                                                        margin: 0,
                                                    }}
                                                >
                                                    {post.conteudo?.length > 80
                                                        ? post.conteudo.substring(
                                                              0,
                                                              80,
                                                          ) + '...'
                                                        : post.conteudo}
                                                </p>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems: 'center',
                                                        color: '#8b949e',
                                                        fontSize: '0.78rem',
                                                    }}
                                                >
                                                    <span>
                                                        @
                                                        {post.usuarios
                                                            ?.username ||
                                                            'Usuário'}{' '}
                                                        ·{' '}
                                                        {formatarData(
                                                            post.criado_em,
                                                        )}
                                                    </span>

                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            gap: '10px',
                                                        }}
                                                    >
                                                        <span>
                                                            <i className="ph ph-heart"></i>{' '}
                                                            {post
                                                                .curtidas?.[0]
                                                                ?.count || 0}
                                                        </span>

                                                        <span>
                                                            <i className="ph ph-chat-circle"></i>{' '}
                                                            {post
                                                                .comentarios?.[0]
                                                                ?.count || 0}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <Rodape />
        </>
    );
}

export default Seguindo;
