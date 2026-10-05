import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '/supabase.js';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/historico.css';
import '../css/seguindo.css';

const AVATAR_PADRAO = 'https://api.dicebear.com/7.x/bottts/svg?seed=DefaultUser';

const IMAGEM_POST_PADRAO =
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop';

const EstadoVazio = ({ icone, titulo, texto, botaoTexto, botaoLink }) => (
    <div className="estado-vazio">
        <i className={`ph ${icone}`}></i>
        <p className="estado-vazio-titulo">{titulo}</p>
        <p className="estado-vazio-texto">{texto}</p>
        <Link to={botaoLink} className="estado-vazio-botao">
            {botaoTexto}
        </Link>
    </div>
);

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

        const confirmou = await window.confirmarNaTela(
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

    

    return (
        <>
            <NavbarPesquisa />

            <main className="container" id="tela-seguindo">
                <header className="cabecalho-historico seguindo-cabecalho">
                    <h1>Autores que você segue</h1>
                    <p>Fique por dentro das novidades dos seus autores favoritos</p>
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
                    <p className="seguindo-carregando">Carregando...</p>
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

                        <section aria-label="Autores seguidos" className="autores-secao">
                            <h2 className="seguindo-subtitulo">
                                Seguindo {autores.length}{' '}
                                {autores.length === 1 ? 'autor' : 'autores'}
                            </h2>

                            <div className="autores-grade">
                                {autores.map((autor) => (
                                    <div key={autor.id} className="autor-card">
                                        <Link to={`/Perfil/${autor.id}`} className="autor-link">
                                            <img
                                                className="autor-foto"
                                                src={autor.foto || AVATAR_PADRAO}
                                                alt={`Foto de @${autor.username}`}
                                            />
                                            <span className="autor-nome">@{autor.username}</span>
                                        </Link>

                                        <button
                                            type="button"
                                            className="btn-deixar-seguir"
                                            onClick={() => deixarDeSeguir(autor)}
                                            disabled={removendoId === autor.id}
                                        >
                                            {removendoId === autor.id ? '...' : 'Seguindo'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* =========================================
                            POSTS DOS AUTORES
                        ========================================= */}

                        <section aria-label="Postagens de quem você segue">
                            <h2 className="seguindo-subtitulo">Novidades</h2>

                            {posts.length === 0 ? (
                                <p className="seguindo-sem-posts">
                                    Os autores que você segue ainda não publicaram nada.
                                </p>
                            ) : (
                                <div className="posts-grade">
                                    {posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            to={`/Perfil/${post.id_usuario}`}
                                            className="post-card-seguindo"
                                        >
                                            <img
                                                className="post-imagem"
                                                src={post.imagem || IMAGEM_POST_PADRAO}
                                                alt={post.titulo}
                                            />

                                            <div className="post-corpo">
                                                <h3>{post.titulo}</h3>

                                                <p className="post-resumo">
                                                    {post.conteudo?.length > 80
                                                        ? post.conteudo.substring(0, 80) + '...'
                                                        : post.conteudo}
                                                </p>

                                                <div className="post-rodape">
                                                    <span>
                                                        @{post.usuarios?.username || 'Usuário'} ·{' '}
                                                        {formatarData(post.criado_em)}
                                                    </span>

                                                    <span className="post-contadores">
                                                        <span>
                                                            <i className="ph ph-heart"></i>{' '}
                                                            {post.curtidas?.[0]?.count || 0}
                                                        </span>
                                                        <span>
                                                            <i className="ph ph-chat-circle"></i>{' '}
                                                            {post.comentarios?.[0]?.count || 0}
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
