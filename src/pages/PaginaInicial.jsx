import React, { useState, useEffect } from "react";
import NavbarPesquisa from "../components/Navbar_pesquisa";
import Rodape from "../components/Rodape";
import "../css/paginainicial.css";
import { Link } from "react-router-dom";
import { supabase } from '/supabase.js';
import "../css/modal-eventos.css";
import MiniMapaSP from "../components/MiniMapaSP";

const IMAGEM_POST_PADRAO =
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop";

const AVATAR_PADRAO =
    "https://api.dicebear.com/7.x/bottts/svg?seed=DefaultUser";

const NOME_BUCKET_IMAGENS = "postagens";




// Estilo compartilhado dos botões de ícone (lixeira / bandeira) dos comentários
const estiloBotaoIconeComentario = {
    border: "none",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    padding: "4px 6px",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
};

const hoverBotaoIconeEntrar = (e) => {
    e.currentTarget.style.color = "#ef4444";
    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
};

const hoverBotaoIconeSair = (e) => {
    e.currentTarget.style.color = "#888";
    e.currentTarget.style.background = "transparent";
};

function PaginaInicial() {
    const [posts, setPosts] = useState([]);
    const [postsHero, setPostsHero] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [todosEventos, setTodosEventos] = useState([]);
    const [modalEventosAberto, setModalEventosAberto] = useState(false);
    const [modalCriarPostAberto, setModalCriarPostAberto] = useState(false);

    const [novoPostForm, setNovoPostForm] = useState({
        titulo: "",
        conteudo: "",
        imagem: null,
        categoria: "Fantasia",
    });

    const [carregandoCriarPost, setCarregandoCriarPost] = useState(false);
    const [postSelecionado, setPostSelecionado] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState("");
    const [carregandoComentarios, setCarregandoComentarios] = useState(false);
    const [slideAtual, setSlideAtual] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [menuPostAberto, setMenuPostAberto] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [imagemEdicao, setImagemEdicao] = useState(null);
    
    const [modalDenunciaAberto, setModalDenunciaAberto] = useState(false);
    const [alvoDenuncia, setAlvoDenuncia] = useState(null);
    const [motivoDenuncia, setMotivoDenuncia] = useState("");
    const [postsCurtidos, setPostsCurtidos] = useState([]);
    const [seguindoIds, setSeguindoIds] = useState([]);
    const [curtindo, setCurtindo] = useState(false);
    const [carregandoSeguir, setCarregandoSeguir] = useState(false);

    const POSTS_POR_PAGINA = 6;

    const usuarioLogadoId = localStorage.getItem("usuario_id");

    /*
     * IMPORTANTE:
     *
     * postagens possui DUAS relações com usuarios:
     *
     * postagens_id_usuario_fkey
     * postagens_ocultado_por_fkey
     *
     * Por isso usamos:
     *
     * usuarios!postagens_id_usuario_fkey(...)
     *
     * em todas as consultas de postagens.
     */

    useEffect(() => {
        async function buscarDadosIniciais() {
            setCarregando(true);

            try {
                const usuarioId = localStorage.getItem("usuario_id");

                // =========================================================
                // 1. BUSCAR USUÁRIOS BLOQUEADOS
                // =========================================================

                let bloqueiosIds = [];

                if (usuarioId) {
                    const { data: bloqueios, error: errorBloqueios } =
                        await supabase
                            .from("bloqueios")
                            .select("id_usuario_bloqueado")
                            .eq("id_usuario_bloqueador", Number(usuarioId));

                    if (errorBloqueios) {
                        console.error(
                            "Erro ao buscar bloqueios:",
                            errorBloqueios,
                        );
                    } else {
                        bloqueiosIds =
                            bloqueios?.map((item) =>
                                Number(item.id_usuario_bloqueado),
                            ) || [];

                        setUsuariosBloqueados(bloqueiosIds);
                    }
                }

                if (usuarioId) {
                    const { data: minhasCurtidas } = await supabase
                        .from("curtidas")
                        .select("id_postagem")
                        .eq("id_usuario", Number(usuarioId));

                    setPostsCurtidos(
                        minhasCurtidas?.map((c) => Number(c.id_postagem)) || [],
                    );

                    const { data: meusSeguidos } = await supabase
                        .from("seguidores")
                        .select("id_seguido")
                        .eq("id_seguidor", Number(usuarioId));

                    setSeguindoIds(
                        meusSeguidos?.map((s) => Number(s.id_seguido)) || [],
                    );
                }

                // =========================================================
                // 2. BUSCAR POSTS
                // =========================================================

                const { data: dataPosts, error: errorPosts } = await supabase
                    .from("postagens")
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
                    .order("criado_em", {
                        ascending: false,
                    });

                if (errorPosts) {
                    console.error(
                        "Erro detalhado ao buscar posts:",
                        errorPosts,
                    );

                    throw errorPosts;
                }

                if (dataPosts) {
                    // =====================================================
                    // 3. REMOVER POSTS DE USUÁRIOS BLOQUEADOS
                    // =====================================================

                    const postsVisiveis = dataPosts.filter(
                        (post) =>
                            !bloqueiosIds.includes(Number(post.id_usuario)),
                    );

                    setPosts(postsVisiveis);

                    const postsEmbaralhados = [...postsVisiveis].sort(
                        () => 0.5 - Math.random(),
                    );

                    setPostsHero(postsEmbaralhados.slice(0, 3));
                }

                // =========================================================
                // 4. BUSCAR PRÓXIMOS EVENTOS
                // =========================================================

                const { data: dataEventos, error: errorEventos } =
                    await supabase
                        .from("eventos")
                        .select("*")
                        .order("data_evento", {
                            ascending: true,
                        })
                        .limit(3);

                if (errorEventos) {
                    throw errorEventos;
                }

                if (dataEventos) {
                    setEventos(dataEventos);
                }

                // =========================================================
                // 5. BUSCAR TODOS OS EVENTOS
                // =========================================================

                const { data: dataTodosEventos, error: errorTodosEventos } =
                    await supabase
                        .from("eventos")
                        .select("*")
                        .order("data_evento", {
                            ascending: true,
                        });

                if (errorTodosEventos) {
                    throw errorTodosEventos;
                }

                if (dataTodosEventos) {
                    setTodosEventos(dataTodosEventos);
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setCarregando(false);
            }
        }

        buscarDadosIniciais();
    }, []);

    // =========================================================
    // FECHAR MENU AO CLICAR FORA
    // =========================================================

    useEffect(() => {
        const fecharMenu = () => {
            setMenuPostAberto(null);
        };

        document.addEventListener("click", fecharMenu);

        return () => {
            document.removeEventListener("click", fecharMenu);
        };
    }, []);

    // =========================================================
    // ABRIR DETALHES DO POST
    // =========================================================

    const abrirDetalhesPost = async (post) => {
        setPostSelecionado(post);
        setModoEdicao(false);
        setImagemEdicao(null);
        setMenuPostAberto(null);
        setCarregandoComentarios(true);

        try {
            const { data, error } = await supabase
                .from("comentarios")
                .select(
                    `
                    id,
                    conteudo,
                    criado_em,
                    usuarios (
                        id,
                        username,
                        foto
                    )
                `,
                )
                .eq("id_postagem", post.id)
                .order("criado_em", {
                    ascending: false,
                });

            if (error) {
                throw error;
            }

            setComentarios(data || []);
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);

            setComentarios([]);
        } finally {
            setCarregandoComentarios(false);
        }
    };

    // =========================================================
    // FECHAR MODAL
    // =========================================================

    const fecharModalPost = () => {
        setPostSelecionado(null);
        setComentarios([]);
        setNovoComentario("");
        setModoEdicao(false);
        setImagemEdicao(null);
        setMenuPostAberto(null);
    };

    // =========================================================
    // VERIFICAR DONO
    // =========================================================

    const usuarioEhDono = (post) => {
        if (!post || !usuarioLogadoId) {
            return false;
        }

        return String(post.id_usuario) === String(usuarioLogadoId);
    };

    // =========================================================
    // MENU DO POST
    // =========================================================

    const abrirMenuPost = (e, postId) => {
        e.stopPropagation();

        setMenuPostAberto((prev) => (prev === postId ? null : postId));
    };

    // =========================================================
    // INICIAR EDIÇÃO
    // =========================================================

    const iniciarEdicaoPost = (e, post) => {
        e.stopPropagation();

        if (!usuarioEhDono(post)) {
            alert("Você só pode editar seus próprios posts.");

            return;
        }

        setMenuPostAberto(null);
        setPostSelecionado(post);
        setModoEdicao(true);
        setImagemEdicao(null);
    };

    // =========================================================
    // CANCELAR EDIÇÃO
    // =========================================================

    const cancelarEdicao = () => {
        if (!postSelecionado) {
            return;
        }

        setModoEdicao(false);
        setImagemEdicao(null);
    };

    // =========================================================
    // EXCLUIR POST
    // =========================================================

    const excluirPost = async (e, post) => {
        if (e) {
            e.stopPropagation();
        }

        if (!usuarioEhDono(post)) {
            alert("Você só pode excluir seus próprios posts.");

            return;
        }

        const confirmou = window.confirm(
            "Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.",
        );

        if (!confirmou) {
            return;
        }

        try {
            const { error } = await supabase
                .from("postagens")
                .delete()
                .eq("id", post.id)
                .eq("id_usuario", usuarioLogadoId);

            if (error) {
                throw error;
            }

            setPosts((prevPosts) =>
                prevPosts.filter((item) => item.id !== post.id),
            );

            setPostsHero((prevPosts) =>
                prevPosts.filter((item) => item.id !== post.id),
            );

            if (postSelecionado?.id === post.id) {
                fecharModalPost();
            }

            alert("Postagem excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir postagem:", error);

            alert(
                "Não foi possível excluir a postagem. Verifique as políticas RLS do Supabase.",
            );
        }
    };

    // =========================================================
    // SALVAR EDIÇÃO
    // =========================================================

    const salvarEdicaoPost = async (e) => {
        e.preventDefault();

        if (!postSelecionado) {
            return;
        }

        if (!usuarioEhDono(postSelecionado)) {
            alert("Você só pode editar seus próprios posts.");

            return;
        }

        const titulo = e.currentTarget.titulo.value.trim();

        const conteudo = e.currentTarget.conteudo.value.trim();

        const categoria = e.currentTarget.categoria.value;

        if (!titulo || !conteudo) {
            alert("Título e conteúdo são obrigatórios.");

            return;
        }

        setCarregandoEdicao(true);

        try {
            let imagemUrl = postSelecionado.imagem || IMAGEM_POST_PADRAO;

            // =====================================================
            // UPLOAD DE NOVA IMAGEM
            // =====================================================

            if (imagemEdicao instanceof File) {
                const arquivo = imagemEdicao;

                const extensao =
                    arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

                const nomeArquivo = `${usuarioLogadoId}/${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}.${extensao}`;

                const { error: uploadError } = await supabase.storage
                    .from(NOME_BUCKET_IMAGENS)
                    .upload(nomeArquivo, arquivo, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: arquivo.type,
                    });

                if (uploadError) {
                    throw new Error(
                        `Erro ao enviar imagem: ${uploadError.message}`,
                    );
                }

                const { data: urlData } = supabase.storage
                    .from(NOME_BUCKET_IMAGENS)
                    .getPublicUrl(nomeArquivo);

                imagemUrl = urlData?.publicUrl || imagemUrl;
            }

            // =====================================================
            // ATUALIZAR POST
            // =====================================================

            const { data, error } = await supabase
                .from("postagens")
                .update({
                    titulo,
                    conteudo,
                    categoria,
                    imagem: imagemUrl,
                })
                .eq("id", postSelecionado.id)
                .eq("id_usuario", usuarioLogadoId)
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
                .single();

            if (error) {
                throw error;
            }

            setPosts((prevPosts) =>
                prevPosts.map((post) => (post.id === data.id ? data : post)),
            );

            setPostsHero((prevPosts) =>
                prevPosts.map((post) => (post.id === data.id ? data : post)),
            );

            setPostSelecionado(data);
            setModoEdicao(false);
            setImagemEdicao(null);

            alert("Postagem atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao editar postagem:", error);

            alert(error.message || "Não foi possível editar a postagem.");
        } finally {
            setCarregandoEdicao(false);
        }
    };

    // =========================================================
    // BLOQUEAR USUÁRIO
    // =========================================================

    const bloquearDonoPost = async (e, post) => {
        e.stopPropagation();

        setMenuPostAberto(null);

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para bloquear um usuário.");

            return;
        }

        if (!post?.id_usuario) {
            alert("Não foi possível identificar o usuário desta postagem.");

            return;
        }

        if (usuarioEhDono(post)) {
            alert("Você não pode bloquear a si mesmo.");

            return;
        }

        const username = post.usuarios?.username || "este usuário";

        const confirmou = window.confirm(
            `Deseja bloquear @${username}?\n\nAs postagens desse usuário não aparecerão mais para você.`,
        );

        if (!confirmou) {
            return;
        }

        try {
            const idUsuarioBloqueado = Number(post.id_usuario);

            const { error } = await supabase.from("bloqueios").insert({
                id_usuario_bloqueador: Number(usuarioId),

                id_usuario_bloqueado: idUsuarioBloqueado,
            });

            if (error) {
                if (error.code === "23505") {
                    alert(`Você já bloqueou @${username}.`);

                    return;
                }

                throw error;
            }

            setUsuariosBloqueados((prev) => {
                if (prev.includes(idUsuarioBloqueado)) {
                    return prev;
                }

                return [...prev, idUsuarioBloqueado];
            });

            setPosts((prevPosts) =>
                prevPosts.filter(
                    (item) => Number(item.id_usuario) !== idUsuarioBloqueado,
                ),
            );

            setPostsHero((prevPosts) =>
                prevPosts.filter(
                    (item) => Number(item.id_usuario) !== idUsuarioBloqueado,
                ),
            );

            if (postSelecionado?.id === post.id) {
                fecharModalPost();
            }

            alert(`@${username} foi bloqueado com sucesso!`);
        } catch (error) {
            console.error("Erro ao bloquear usuário:", error);

            alert(error.message || "Não foi possível bloquear o usuário.");
        }
    };

    // =========================================================
    // DENUNCIAR POST
    // =========================================================

    const denunciarPost = async (e, post) => {
        e.stopPropagation();

        setMenuPostAberto(null);

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para denunciar uma postagem.");

            return;
        }

        if (!post?.id) {
            alert("Não foi possível identificar a postagem.");

            return;
        }

        if (usuarioEhDono(post)) {
            alert("Você não pode denunciar seu próprio post.");

            return;
        }

        setAlvoDenuncia({ tipo: "post", item: post });
        setMotivoDenuncia("");
        setModalDenunciaAberto(true);
    };

    const denunciarComentario = async (e, comentario) => {
        e.stopPropagation();

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para denunciar um comentário.");
            return;
        }

        if (!comentario?.id) {
            alert("Não foi possível identificar o comentário.");
            return;
        }

        if (
            comentario.usuarios?.id &&
            Number(comentario.usuarios.id) === Number(usuarioId)
        ) {
            alert("Você não pode denunciar seu próprio comentário.");
            return;
        }

        setAlvoDenuncia({ tipo: "comentario", item: comentario });
        setMotivoDenuncia("");
        setModalDenunciaAberto(true);
    };

    const confirmarDenuncia = async (e) => {
        e.preventDefault();

        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId || !alvoDenuncia) return;

        const motivoFinal = motivoDenuncia.trim() || "Não informado";

        try {
            const payload = {
                id_usuario: Number(usuarioId),
                motivo: motivoFinal,
            };

            if (alvoDenuncia.tipo === "post") {
                payload.id_postagem = Number(alvoDenuncia.item.id);
            } else if (alvoDenuncia.tipo === "comentario") {
                payload.id_comentario = Number(alvoDenuncia.item.id);
            }

            const { error } = await supabase.from("denuncias").insert(payload);

            if (error) {
                if (error.code === "23505") {
                    alert("Você já enviou esta denúncia.");
                    return;
                }
                throw error;
            }

            alert("Denúncia enviada com sucesso. Obrigado!");
            setModalDenunciaAberto(false);
            setAlvoDenuncia(null);
            setMotivoDenuncia("");
        } catch (error) {
            console.error("Erro ao denunciar:", error);
            alert(error.message || "Não foi possível registrar a denúncia.");
        }
    };

    // =========================================================
    // EXCLUIR COMENTÁRIO
    // =========================================================

    const comentarioEhDono = (comentario) => {
        if (!comentario || !usuarioLogadoId) return false;

        return String(comentario.usuarios?.id) === String(usuarioLogadoId);
    };

    const excluirComentario = async (e, comentario) => {
        e.stopPropagation();

        if (!comentarioEhDono(comentario)) {
            alert("Você só pode excluir seus próprios comentários.");
            return;
        }

        const confirmou = window.confirm(
            "Tem certeza que deseja excluir este comentário?",
        );

        if (!confirmou) return;

        try {
            const { error } = await supabase
                .from("comentarios")
                .delete()
                .eq("id", comentario.id)
                .eq("id_usuario", Number(usuarioLogadoId));

            if (error) throw error;

            // Remove da lista local
            setComentarios((prev) =>
                prev.filter((c) => c.id !== comentario.id),
            );

            // Atualiza o contador nos cards e no modal
            const decrementar = (p) => {
                const atual = p.comentarios?.[0]?.count || 0;

                return {
                    ...p,
                    comentarios: [{ count: Math.max(atual - 1, 0) }],
                };
            };

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postSelecionado?.id ? decrementar(p) : p,
                ),
            );

            setPostSelecionado((prev) => (prev ? decrementar(prev) : prev));
        } catch (error) {
            console.error("Erro ao excluir comentário:", error);

            alert(
                "Não foi possível excluir o comentário. Verifique as políticas RLS do Supabase.",
            );
        }
    };

    // =========================================================
    // CURTIR POST
    // =========================================================

    const contarCurtidas = (p) => p?.curtidas?.[0]?.count || 0;

    const postFoiCurtido = (post) =>
        !!post && postsCurtidos.includes(Number(post.id));

    // Atualiza estado local (lista, hero, modal e contador)
    const atualizarCurtidaLocal = (postId, curtiu) => {
        const delta = curtiu ? 1 : -1;

        const aplicar = (p) =>
            Number(p.id) === postId
                ? {
                    ...p,
                    curtidas: [
                        { count: Math.max(contarCurtidas(p) + delta, 0) },
                    ],
                }
                : p;

        setPostsCurtidos((prev) =>
            curtiu
                ? prev.includes(postId)
                    ? prev
                    : [...prev, postId]
                : prev.filter((id) => id !== postId),
        );

        setPosts((prev) => prev.map(aplicar));
        setPostsHero((prev) => prev.map(aplicar));
        setPostSelecionado((prev) => (prev ? aplicar(prev) : prev));
    };

    const alternarCurtida = async (e, post) => {
        e.stopPropagation();

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para curtir!");
            return;
        }

        if (curtindo || !post?.id) return;

        const postId = Number(post.id);
        const jaCurtiu = postsCurtidos.includes(postId);

        setCurtindo(true);

        // Atualiza na hora; se o banco falhar, desfaz
        atualizarCurtidaLocal(postId, !jaCurtiu);

        try {
            if (jaCurtiu) {
                const { error } = await supabase
                    .from("curtidas")
                    .delete()
                    .eq("id_usuario", Number(usuarioId))
                    .eq("id_postagem", postId);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("curtidas").insert({
                    id_usuario: Number(usuarioId),
                    id_postagem: postId,
                });

                if (error) throw error;
            }
        } catch (error) {
            console.error("Erro ao curtir:", error);
            atualizarCurtidaLocal(postId, jaCurtiu);
            alert("Não foi possível registrar a curtida.");
        } finally {
            setCurtindo(false);
        }
    };

    // =========================================================
    // SEGUIR USUÁRIO
    // =========================================================

    const alternarSeguir = async (e, post) => {
        e.stopPropagation();

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para seguir alguém!");
            return;
        }

        if (!post?.id_usuario || carregandoSeguir) return;

        const idSeguido = Number(post.id_usuario);

        if (idSeguido === Number(usuarioId)) return;

        const jaSegue = seguindoIds.includes(idSeguido);

        setCarregandoSeguir(true);

        try {
            if (jaSegue) {
                const { error } = await supabase
                    .from("seguidores")
                    .delete()
                    .eq("id_seguidor", Number(usuarioId))
                    .eq("id_seguido", idSeguido);

                if (error) throw error;

                setSeguindoIds((prev) => prev.filter((id) => id !== idSeguido));
            } else {
                const { error } = await supabase.from("seguidores").insert({
                    id_seguidor: Number(usuarioId),
                    id_seguido: idSeguido,
                });

                // 23505 = já seguia; só sincroniza o estado
                if (error && error.code !== "23505") throw error;

                setSeguindoIds((prev) =>
                    prev.includes(idSeguido) ? prev : [...prev, idSeguido],
                );
            }
        } catch (error) {
            console.error("Erro ao seguir:", error);
            alert("Não foi possível atualizar o seguimento.");
        } finally {
            setCarregandoSeguir(false);
        }
    };

    // =========================================================
    // ENVIAR COMENTÁRIO
    // =========================================================

    const enviarComentario = async (e) => {
        e.preventDefault();

        if (!novoComentario.trim() || !postSelecionado) {
            return;
        }

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para comentar!");

            return;
        }

        try {
            const { data, error } = await supabase
                .from("comentarios")
                .insert([
                    {
                        id_postagem: postSelecionado.id,

                        id_usuario: usuarioId,

                        conteudo: novoComentario.trim(),
                    },
                ])
                .select(
                    `
                    id,
                    conteudo,
                    criado_em,
                    usuarios (
                        id,
                        username,
                        foto
                    )
                `,
                );

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                setComentarios((prevComentarios) => [
                    data[0],
                    ...prevComentarios,
                ]);

                setNovoComentario("");

                setPosts((prevPosts) =>
                    prevPosts.map((p) => {
                        if (p.id !== postSelecionado.id) {
                            return p;
                        }

                        const contadorAtual = p.comentarios?.[0]?.count || 0;

                        return {
                            ...p,
                            comentarios: [
                                {
                                    count: contadorAtual + 1,
                                },
                            ],
                        };
                    }),
                );

                setPostSelecionado((prev) => {
                    if (!prev) {
                        return prev;
                    }

                    const contadorAtual = prev.comentarios?.[0]?.count || 0;

                    return {
                        ...prev,
                        comentarios: [
                            {
                                count: contadorAtual + 1,
                            },
                        ],
                    };
                });
            }
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);

            alert(
                "Erro ao enviar comentário. Verifique sua conexão ou as políticas do banco (RLS).",
            );
        }
    };

    // =========================================================
    // CRIAR NOVA POSTAGEM
    // =========================================================

    const criarNovaPostagem = async (e) => {
        e.preventDefault();

        const usuarioId = localStorage.getItem("usuario_id");

        if (!usuarioId) {
            alert("Você precisa estar logado para criar uma postagem!");

            return;
        }

        if (!novoPostForm.titulo.trim() || !novoPostForm.conteudo.trim()) {
            alert("Título e conteúdo são obrigatórios!");

            return;
        }

        setCarregandoCriarPost(true);

        try {
            let imagemUrl = null;

            // =====================================================
            // UPLOAD
            // =====================================================

            if (novoPostForm.imagem instanceof File) {
                const arquivo = novoPostForm.imagem;

                const extensao =
                    arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

                const nomeArquivo = `${usuarioId}/${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}.${extensao}`;

                const { error: uploadError } = await supabase.storage
                    .from(NOME_BUCKET_IMAGENS)
                    .upload(nomeArquivo, arquivo, {
                        cacheControl: "3600",

                        upsert: false,

                        contentType: arquivo.type,
                    });

                if (uploadError) {
                    console.error("Erro no upload:", uploadError);

                    throw new Error(
                        `Erro ao enviar imagem: ${uploadError.message}`,
                    );
                }

                const { data: urlData } = supabase.storage
                    .from(NOME_BUCKET_IMAGENS)
                    .getPublicUrl(nomeArquivo);

                imagemUrl = urlData?.publicUrl || null;
            }

            // =====================================================
            // CRIAR POST
            // =====================================================

            const { data: postagemCriada, error: errorPostagem } =
                await supabase
                    .from("postagens")
                    .insert([
                        {
                            id_usuario: Number(usuarioId),

                            titulo: novoPostForm.titulo.trim(),

                            conteudo: novoPostForm.conteudo.trim(),

                            categoria: novoPostForm.categoria,

                            imagem: imagemUrl || IMAGEM_POST_PADRAO,
                        },
                    ])
                    .select(
                        `
                    id,
                    id_obra,
                    id_usuario,
                    titulo,
                    conteudo,
                    categoria,
                    imagem,
                    criado_em,

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
                    .single();

            if (errorPostagem) {
                throw errorPostagem;
            }

            if (!postagemCriada) {
                throw new Error("A postagem não foi retornada pelo Supabase.");
            }

            setPosts((prevPosts) => [postagemCriada, ...prevPosts]);

            setPostsHero((prevPostsHero) =>
                [postagemCriada, ...prevPostsHero].slice(0, 3),
            );

            setSlideAtual(0);

            setModalCriarPostAberto(false);

            setNovoPostForm({
                titulo: "",
                conteudo: "",
                imagem: null,
                categoria: "Fantasia",
            });

            alert("Postagem criada com sucesso!");
        } catch (erro) {
            console.error("Erro ao criar postagem:", erro);

            alert(erro.message || "Não foi possível criar a postagem.");
        } finally {
            setCarregandoCriarPost(false);
        }
    };

    // =========================================================
    // SLIDER
    // =========================================================

    useEffect(() => {
        if (postsHero.length === 0) {
            return;
        }

        const intervalo = setInterval(() => {
            setSlideAtual((prevSlide) => (prevSlide + 1) % postsHero.length);
        }, 5000);

        return () => clearInterval(intervalo);
    }, [postsHero]);

    // =========================================================
    // FORMATAR DATA
    // =========================================================

    const formatarData = (dataIso) => {
        if (!dataIso) {
            return "";
        }

        return new Date(dataIso).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // =========================================================
    // FORMATAR DATA EVENTO
    // =========================================================

    const formatarDataEvento = (dataIso) => {
        if (!dataIso) {
            return {
                dia: "",
                mes: "",
                completo: "",
            };
        }

        const data = new Date(dataIso);

        const dia = data.toLocaleDateString("pt-BR", {
            day: "2-digit",
        });

        const mes = data
            .toLocaleDateString("pt-BR", {
                month: "short",
            })
            .replace(".", "")
            .toUpperCase();

        const completo = data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        return {
            dia,
            mes,
            completo,
        };
    };

    return (
        <>
            <NavbarPesquisa />

            <div className="page-layout">
                {/* =====================================================
                    SIDEBAR ESQUERDA
                ===================================================== */}

                <aside className="sidebar-left" aria-label="Menu lateral">
                    <Link
                        to="/ObrasMangas"
                        className="sidebar-notif"
                        id="link-notificacoes"
                    >
                        <i className="ph-fill ph-bell notif-bell"></i>

                        <span>
                            Notificações
                            <br />
                            <span className="notif-sub">de histórias</span> 🔥
                        </span>
                    </Link>

                    <nav className="sidebar-nav">
                        <a
                            href="#"
                            className="sidebar-link active"
                            onClick={(e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            <i className="ph-fill ph-house"></i>
                            <span>Para você</span>
                        </a>

                        <Link to="/Seguindo" className="sidebar-link">
                            <i className="ph ph-user-circle-plus"></i>
                            <span>Seguindo</span>
                        </Link>

                        <a
                            href="#"
                            className="sidebar-link"
                            onClick={(e) => {
                                e.preventDefault();
                                document
                                    .getElementById("posts-titulo")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <i className="ph ph-compass"></i>
                            <span>Explorar</span>
                        </a>

                        <a
                            href="#"
                            className="sidebar-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setModalEventosAberto(true);
                            }}
                        >
                            <i className="ph ph-calendar"></i>
                            <span>Eventos</span>
                        </a>

                        <Link to="/Favoritos" className="sidebar-link">
                            <i className="ph ph-heart"></i>
                            <span>Favoritos</span>
                        </Link>

                        <Link to="/ObrasMangas" className="sidebar-link">
                            <i className="ph ph-book-open"></i>
                            <span>Obras</span>
                        </Link>
                    </nav>

                    <div className="sidebar-character" aria-hidden="true">
                        <div className="char-glow"></div>
                    </div>

                    <div className="sidebar-apoiador">
                        <p className="apoiador-title">
                            Seja um <strong>apoiador!</strong>
                        </p>

                        <p className="apoiador-desc">
                            Apoie criadores independentes e receba benefícios
                            exclusivos!
                        </p>

                        <Link to="/Planos" className="btn-assinar">
                            <i className="ph-fill ph-crown"></i>
                            Assinar
                        </Link>
                    </div>
                </aside>

                {/* =====================================================
                    CONTEÚDO PRINCIPAL
                ===================================================== */}

                <main className="main-content" id="main-content">
                    {/* =================================================
                        HERO
                    ================================================= */}

                    <section
                        className="hero-banner"
                        aria-label="Destaque principal"
                    >
                        <div className="hero-slides">
                            {postsHero.length > 0 ? (
                                postsHero.map((post, index) => {
                                    const imagemHero =
                                        post.imagem || IMAGEM_POST_PADRAO;

                                    return (
                                        <div
                                            className={`hero-slide ${index === slideAtual
                                                ? "active"
                                                : ""
                                                }`}
                                            key={post.id}
                                        >
                                            <div
                                                className="hero-bg"
                                                style={{
                                                    backgroundImage: `url(${imagemHero})`,
                                                }}
                                            ></div>

                                            <div className="hero-overlay"></div>

                                            <div className="hero-content">
                                                <span className="hero-badge">
                                                    {post.categoria ||
                                                        "DESTAQUE"}
                                                </span>

                                                <h1 className="hero-title">
                                                    {post.titulo}
                                                </h1>

                                                <p className="hero-desc">
                                                    {post.conteudo?.length > 100
                                                        ? post.conteudo.substring(
                                                            0,
                                                            100,
                                                        ) + "..."
                                                        : post.conteudo}
                                                </p>

                                                <button
                                                    onClick={() =>
                                                        abrirDetalhesPost(post)
                                                    }
                                                    className="btn-ver-mais"
                                                >
                                                    Ver mais
                                                    <i className="ph ph-arrow-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="hero-slide active">
                                    <div
                                        className="hero-bg"
                                        style={{
                                            backgroundColor: "#1f1c2c",
                                        }}
                                    ></div>

                                    <div className="hero-overlay"></div>

                                    <div className="hero-content">
                                        <span className="hero-badge">
                                            DESTAQUE
                                        </span>

                                        <h1 className="hero-title">
                                            {carregando ? (
                                                <>
                                                    CARREGANDO
                                                    <br />
                                                    DESTAQUES...
                                                </>
                                            ) : (
                                                <>
                                                    NENHUM
                                                    <br />
                                                    POST ENCONTRADO
                                                </>
                                            )}
                                        </h1>
                                    </div>
                                </div>
                            )}
                        </div>

                        {postsHero.length > 1 && (
                            <div className="hero-controls">
                                <button
                                    className="hero-arrow"
                                    onClick={() =>
                                        setSlideAtual((prev) =>
                                            prev === 0
                                                ? postsHero.length - 1
                                                : prev - 1,
                                        )
                                    }
                                    aria-label="Slide anterior"
                                >
                                    <i className="ph ph-caret-left"></i>
                                </button>

                                <div className="hero-dots">
                                    {postsHero.map((_, idx) => (
                                        <button
                                            key={idx}
                                            className={`hero-dot ${idx === slideAtual
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() => setSlideAtual(idx)}
                                            aria-label={`Ir para slide ${idx + 1
                                                }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    className="hero-arrow"
                                    onClick={() =>
                                        setSlideAtual(
                                            (prev) =>
                                                (prev + 1) % postsHero.length,
                                        )
                                    }
                                    aria-label="Próximo slide"
                                >
                                    <i className="ph ph-caret-right"></i>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* =================================================
                        POSTS
                    ================================================= */}

                    <section
                        className="posts-section"
                        aria-labelledby="posts-titulo"
                    >
                        <div className="posts-section-header">
                            <h2 id="posts-titulo" className="section-title">
                                🔥 Posts em destaque
                            </h2>

                            <div className="filtros-wrapper">
                                <div className="filtros-posts-select-container">
                                    <label
                                        htmlFor="filtro-select"
                                        className="sr-only"
                                    >
                                        Filtrar posts por categoria
                                    </label>

                                    <i className="ph-bold ph-funnel filtro-icon"></i>

                                    <select
                                        id="filtro-select"
                                        className="filtro-select-moderno"
                                        value={filtroAtivo}
                                        onChange={(e) => {
                                            setFiltroAtivo(e.target.value);

                                            setPaginaAtual(1);
                                        }}
                                    >
                                        <option value="Todos">
                                            Todos os Posts
                                        </option>

                                        <option value="Fantasia">
                                            Fantasia
                                        </option>

                                        <option value="Cultura">Cultura</option>

                                        <option value="Arte">Arte</option>

                                        <option value="Destaque">
                                            Destaque
                                        </option>

                                        <option value="Historia">
                                            Historia
                                        </option>

                                        <option value="Curiosidades">
                                            Curiosidades
                                        </option>

                                        <option value="Reflexao">
                                            Reflexao
                                        </option>

                                        <option value="Analise">Analise</option>
                                    </select>
                                </div>

                                <button
                                    className="btn-criar-post"
                                    onClick={() =>
                                        setModalCriarPostAberto(true)
                                    }
                                >
                                    <i className="ph-bold ph-plus"></i>
                                    Criar Post
                                </button>
                            </div>
                        </div>

                        <div className="posts-grid">
                            {carregando ? (
                                <p
                                    style={{
                                        color: "#fff",
                                    }}
                                >
                                    Carregando postagens...
                                </p>
                            ) : (
                                (() => {
                                    const postsFiltrados =
                                        filtroAtivo === "Todos"
                                            ? posts
                                            : posts.filter(
                                                (p) =>
                                                    (
                                                        p.categoria || "Geral"
                                                    ).toLowerCase() ===
                                                    filtroAtivo.toLowerCase(),
                                            );

                                    const totalPaginas = Math.ceil(
                                        postsFiltrados.length /
                                        POSTS_POR_PAGINA,
                                    );

                                    const indiceInicial =
                                        (paginaAtual - 1) * POSTS_POR_PAGINA;

                                    const postsDaPagina = postsFiltrados.slice(
                                        indiceInicial,
                                        indiceInicial + POSTS_POR_PAGINA,
                                    );

                                    return postsFiltrados.length > 0 ? (
                                        <>
                                            {postsDaPagina.map((post) => {
                                                const imagemPost =
                                                    post.imagem ||
                                                    IMAGEM_POST_PADRAO;

                                                const fotoPerfil =
                                                    post.usuarios?.foto ||
                                                    AVATAR_PADRAO;

                                                const totalComentarios =
                                                    post.comentarios?.[0]
                                                        ?.count || 0;

                                                return (
                                                    <article
                                                        className="post-card"
                                                        key={post.id}
                                                        onClick={() =>
                                                            abrirDetalhesPost(
                                                                post,
                                                            )
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        <div
                                                            className="post-image"
                                                            style={{
                                                                backgroundImage: `url(${imagemPost})`,
                                                                backgroundSize:
                                                                    "cover",
                                                                backgroundPosition:
                                                                    "center",
                                                                backgroundColor:
                                                                    "#2a2a2a",
                                                            }}
                                                        >
                                                            <span className="post-tag">
                                                                {post.categoria ||
                                                                    "GERAL"}
                                                            </span>
                                                        </div>

                                                        <div className="post-body">
                                                            <h3 className="post-title">
                                                                {post.titulo}
                                                            </h3>

                                                            <div className="post-author">
                                                                <div
                                                                    className="author-avatar"
                                                                    style={{
                                                                        backgroundImage: `url(${fotoPerfil})`,
                                                                        backgroundSize:
                                                                            "cover",
                                                                        backgroundPosition:
                                                                            "center",
                                                                    }}
                                                                ></div>

                                                                <div className="author-info">
                                                                    <Link
                                                                        to={`/Perfil/${post.usuarios?.id}`}
                                                                        className="author-name"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        @
                                                                        {post
                                                                            .usuarios
                                                                            ?.username ||
                                                                            "Usuário"}
                                                                    </Link>

                                                                    <span className="author-time">
                                                                        {formatarData(
                                                                            post.criado_em,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <p
                                                                style={{
                                                                    color: "#aaa",
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    marginTop:
                                                                        "8px",
                                                                }}
                                                            >
                                                                {post.conteudo
                                                                    ?.length >
                                                                    80
                                                                    ? post.conteudo.substring(
                                                                        0,
                                                                        80,
                                                                    ) + "..."
                                                                    : post.conteudo}
                                                            </p>

                                                            <div className="post-stats">
                                                                <span className="stat">
                                                                    <i
                                                                        className={`${postFoiCurtido(post) ? "ph-fill" : "ph"
                                                                            } ph-heart stat-heart`}
                                                                    ></i>
                                                                    {contarCurtidas(post)}
                                                                </span>

                                                                <span className="stat">
                                                                    <i className="ph ph-chat-circle"></i>
                                                                    {
                                                                        totalComentarios
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}

                                            {totalPaginas > 1 && (
                                                <div className="paginacao-posts">
                                                    <button
                                                        className="btn-paginacao"
                                                        onClick={() =>
                                                            setPaginaAtual(
                                                                (prev) =>
                                                                    Math.max(
                                                                        prev -
                                                                        1,
                                                                        1,
                                                                    ),
                                                            )
                                                        }
                                                        disabled={
                                                            paginaAtual === 1
                                                        }
                                                    >
                                                        <i className="ph ph-caret-left"></i>
                                                        Anterior
                                                    </button>

                                                    <div className="paginas-numeros">
                                                        {Array.from(
                                                            {
                                                                length: totalPaginas,
                                                            },
                                                            (_, index) =>
                                                                index + 1,
                                                        ).map((numero) => (
                                                            <button
                                                                key={numero}
                                                                className={`numero-pagina ${paginaAtual ===
                                                                    numero
                                                                    ? "pagina-ativa"
                                                                    : ""
                                                                    }`}
                                                                onClick={() =>
                                                                    setPaginaAtual(
                                                                        numero,
                                                                    )
                                                                }
                                                            >
                                                                {numero}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <button
                                                        className="btn-paginacao"
                                                        onClick={() =>
                                                            setPaginaAtual(
                                                                (prev) =>
                                                                    Math.min(
                                                                        prev +
                                                                        1,
                                                                        totalPaginas,
                                                                    ),
                                                            )
                                                        }
                                                        disabled={
                                                            paginaAtual ===
                                                            totalPaginas
                                                        }
                                                    >
                                                        Próxima
                                                        <i className="ph ph-caret-right"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="filtro-vazio">
                                            Nenhuma postagem encontrada para{" "}
                                            <strong>"{filtroAtivo}"</strong>.
                                        </p>
                                    );
                                })()
                            )}
                        </div>
                    </section>
                </main>

                {/* =====================================================
                    SIDEBAR DIREITA
                ===================================================== */}

                <aside
                    className="sidebar-right"
                    aria-label="Informações adicionais"
                >
                    <span className="widget-title">Mapa do Site</span>

                    <MiniMapaSP />

                    <div className="sidebar-widget" id="widget-eventos">
                        <div className="widget-header">
                            <h3 className="widget-title">
                                <i className="ph ph-calendar-blank"></i>
                                Próximos eventos
                            </h3>

                            <button
                                onClick={() => setModalEventosAberto(true)}
                                className="widget-ver-todos"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#a855f7",
                                }}
                            >
                                Ver todos
                            </button>
                        </div>

                        <div className="eventos-list">
                            {eventos.length > 0 ? (
                                eventos.map((evento) => {
                                    const { dia, mes } = formatarDataEvento(
                                        evento.data_evento,
                                    );

                                    return (
                                        <div
                                            className="evento-item"
                                            key={evento.id}
                                        >
                                            <div className="evento-data">
                                                <span className="evento-dia">
                                                    {dia}
                                                </span>

                                                <span className="evento-mes">
                                                    {mes}
                                                </span>
                                            </div>

                                            <div className="evento-info">
                                                <span className="evento-nome">
                                                    {evento.nome}
                                                </span>

                                                <span className="evento-local">
                                                    {evento.local}
                                                </span>
                                            </div>

                                            <span className="evento-badge badge-presencial">
                                                {evento.tipo || "Presencial"}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p
                                    style={{
                                        color: "#aaa",
                                        fontSize: "0.85rem",
                                        padding: "10px 0",
                                    }}
                                >
                                    Nenhum evento cadastrado.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-widget" id="widget-em-alta">
                        <h3 className="widget-title">
                            <i className="ph-fill ph-lightning"></i>
                            Em alta agora
                        </h3>

                        <div className="em-alta-list">
                            <div className="em-alta-item" id="em-alta-1">
                                <span className="em-alta-num">1</span>

                                <span className="em-alta-nome">
                                    Solo Leveling 2ª temporada
                                </span>

                                <span className="em-alta-tag">#anime</span>
                            </div>

                            <div className="em-alta-item" id="em-alta-2">
                                <span className="em-alta-num">2</span>

                                <span className="em-alta-nome">
                                    Boruto: Two Blue Vortex
                                </span>

                                <span className="em-alta-tag">#mangá</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* =========================================================
                MODAL DE EVENTOS
            ========================================================= */}

            {modalEventosAberto && (
                <div
                    className="eventos-modal-overlay"
                    onClick={() => setModalEventosAberto(false)}
                >
                    <div
                        className="eventos-modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="eventos-modal-header">
                            <h2 className="eventos-modal-title">
                                <i className="ph ph-calendar-blank"></i>
                                Todos os Próximos Eventos
                            </h2>

                            <button
                                onClick={() => setModalEventosAberto(false)}
                                className="eventos-modal-close"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="eventos-modal-body">
                            {todosEventos.length > 0 ? (
                                todosEventos.map((evento) => {
                                    const { dia, mes, completo } =
                                        formatarDataEvento(evento.data_evento);

                                    return (
                                        <div
                                            className="evento-card-modal"
                                            key={evento.id}
                                        >
                                            <div className="evento-card-data">
                                                <span className="evento-card-dia">
                                                    {dia}
                                                </span>

                                                <span className="evento-card-mes">
                                                    {mes}
                                                </span>
                                            </div>

                                            <div className="evento-card-info">
                                                <span className="evento-card-nome">
                                                    {evento.nome}
                                                </span>

                                                <span className="evento-card-local">
                                                    {evento.local} • {completo}
                                                </span>
                                            </div>

                                            <span className="evento-badge badge-presencial">
                                                {evento.tipo || "Presencial"}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p
                                    style={{
                                        color: "#a1a1aa",
                                        textAlign: "center",
                                        padding: "20px",
                                    }}
                                >
                                    Nenhum evento encontrado.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL DO POST
            ========================================================= */}

            {postSelecionado && (
                <div className="instagram-modal-overlay">
                    <button
                        onClick={fecharModalPost}
                        className="instagram-modal-close"
                    >
                        &times;
                    </button>

                    <div
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "70px",
                            zIndex: 1001,
                        }}
                    >
                        <button
                            onClick={(e) =>
                                abrirMenuPost(e, postSelecionado.id)
                            }
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "rgba(20,20,25,0.9)",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            aria-label="Opções da postagem"
                        >
                            <i className="ph-bold ph-dots-three"></i>
                        </button>

                        {menuPostAberto === postSelecionado.id && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: "absolute",
                                    top: "48px",
                                    right: 0,
                                    width: "210px",
                                    background: "#18181b",
                                    border: "1px solid #333",
                                    borderRadius: "12px",
                                    padding: "6px",
                                    boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
                                    zIndex: 1002,
                                }}
                            >
                                {usuarioEhDono(postSelecionado) ? (
                                    <>
                                        <button
                                            onClick={(e) =>
                                                iniciarEdicaoPost(
                                                    e,
                                                    postSelecionado,
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                border: "none",
                                                background: "transparent",
                                                color: "#fff",
                                                padding: "12px",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <i className="ph ph-pencil-simple"></i>{" "}
                                            Editar post
                                        </button>

                                        <button
                                            onClick={(e) =>
                                                excluirPost(e, postSelecionado)
                                            }
                                            style={{
                                                width: "100%",
                                                border: "none",
                                                background: "transparent",
                                                color: "#ef4444",
                                                padding: "12px",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <i className="ph ph-trash"></i>{" "}
                                            Excluir post
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={(e) =>
                                                bloquearDonoPost(
                                                    e,
                                                    postSelecionado,
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                border: "none",
                                                background: "transparent",
                                                color: "#fff",
                                                padding: "12px",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <i className="ph ph-prohibit"></i>{" "}
                                            Bloquear usuário
                                        </button>

                                        <button
                                            onClick={(e) =>
                                                denunciarPost(
                                                    e,
                                                    postSelecionado,
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                border: "none",
                                                background: "transparent",
                                                color: "#ef4444",
                                                padding: "12px",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <i className="ph ph-flag"></i>{" "}
                                            Denunciar post
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="instagram-modal-container">
                        <div className="instagram-modal-image-side">
                            <div
                                className="instagram-modal-image"
                                style={{
                                    backgroundImage: `url(${postSelecionado.imagem ||
                                        IMAGEM_POST_PADRAO
                                        })`,
                                }}
                            ></div>
                        </div>

                        <div className="instagram-modal-info-side">
                            <div className="instagram-modal-header">
                                <div
                                    className="instagram-modal-avatar"
                                    style={{
                                        backgroundImage: `url(${postSelecionado.usuarios?.foto || AVATAR_PADRAO
                                            })`,
                                    }}
                                ></div>

                                <div>
                                    <Link
                                        to={`/Perfil/${postSelecionado.usuarios?.id}`}
                                        className="instagram-modal-username"
                                        style={{ textDecoration: "none" }}
                                    >
                                        @{postSelecionado.usuarios?.username || "Usuário"}
                                    </Link>

                                    <span className="instagram-modal-category">
                                        {postSelecionado.categoria || "GERAL"}
                                    </span>
                                </div>

                                {!usuarioEhDono(postSelecionado) && postSelecionado.id_usuario && (
                                    <button
                                        type="button"
                                        onClick={(e) => alternarSeguir(e, postSelecionado)}
                                        disabled={carregandoSeguir}
                                        style={{
                                            marginLeft: "auto",
                                            padding: "6px 16px",
                                            borderRadius: "999px",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            cursor: carregandoSeguir ? "default" : "pointer",
                                            border: seguindoIds.includes(Number(postSelecionado.id_usuario))
                                                ? "1px solid #444"
                                                : "1px solid #a855f7",
                                            background: seguindoIds.includes(
                                                Number(postSelecionado.id_usuario),
                                            )
                                                ? "transparent"
                                                : "#a855f7",
                                            color: "#fff",
                                        }}
                                    >
                                        {seguindoIds.includes(Number(postSelecionado.id_usuario))
                                            ? "Seguindo"
                                            : "Seguir"}
                                    </button>
                                )}
                            </div>
                        

                        <div className="instagram-modal-scroll">
                            {modoEdicao ? (
                                <form
                                    onSubmit={salvarEdicaoPost}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "15px",
                                    }}
                                >
                                    <h2 className="instagram-modal-title">
                                        Editar postagem
                                    </h2>

                                    <input
                                        name="titulo"
                                        type="text"
                                        defaultValue={
                                            postSelecionado.titulo
                                        }
                                        placeholder="Título"
                                        disabled={carregandoEdicao}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #333",
                                            background: "#18181b",
                                            color: "#fff",
                                        }}
                                    />

                                    <textarea
                                        name="conteudo"
                                        defaultValue={
                                            postSelecionado.conteudo
                                        }
                                        placeholder="Conteúdo"
                                        rows="8"
                                        disabled={carregandoEdicao}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #333",
                                            background: "#18181b",
                                            color: "#fff",
                                            resize: "vertical",
                                        }}
                                    />

                                    <select
                                        name="categoria"
                                        defaultValue={
                                            postSelecionado.categoria ||
                                            "Fantasia"
                                        }
                                        disabled={carregandoEdicao}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #333",
                                            background: "#18181b",
                                            color: "#fff",
                                        }}
                                    >
                                        <option value="Fantasia">
                                            Fantasia
                                        </option>

                                        <option value="Cultura">
                                            Cultura
                                        </option>

                                        <option value="Arte">Arte</option>

                                        <option value="Destaque">
                                            Destaque
                                        </option>

                                        <option value="Historia">
                                            História
                                        </option>

                                        <option value="Curiosidades">
                                            Curiosidades
                                        </option>

                                        <option value="Reflexao">
                                            Reflexão
                                        </option>

                                        <option value="Analise">
                                            Análise
                                        </option>
                                    </select>

                                    <label
                                        style={{
                                            color: "#aaa",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        Trocar imagem
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={carregandoEdicao}
                                        onChange={(e) =>
                                            setImagemEdicao(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        style={{
                                            color: "#fff",
                                        }}
                                    />

                                    {imagemEdicao && (
                                        <span
                                            style={{
                                                color: "#a855f7",
                                                fontSize: "0.85rem",
                                            }}
                                        >
                                            📎 {imagemEdicao.name}
                                        </span>
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            disabled={carregandoEdicao}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                border: "none",
                                                borderRadius: "8px",
                                                background: "#a855f7",
                                                color: "#fff",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {carregandoEdicao
                                                ? "Salvando..."
                                                : "Salvar alterações"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelarEdicao}
                                            disabled={carregandoEdicao}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                border: "1px solid #444",
                                                borderRadius: "8px",
                                                background: "#27272a",
                                                color: "#fff",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div>
                                        <h2 className="instagram-modal-title">{postSelecionado.titulo}</h2>

                                        <p className="instagram-modal-content-text">
                                            {postSelecionado.conteudo}
                                        </p>

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginTop: "12px",
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => alternarCurtida(e, postSelecionado)}
                                                disabled={curtindo}
                                                aria-pressed={postFoiCurtido(postSelecionado)}
                                                aria-label={
                                                    postFoiCurtido(postSelecionado)
                                                        ? "Descurtir post"
                                                        : "Curtir post"
                                                }
                                                style={{
                                                    border: "none",
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                    fontSize: "26px",
                                                    padding: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    color: postFoiCurtido(postSelecionado) ? "#ef4444" : "#ccc",
                                                }}
                                            >
                                                <i
                                                    className={
                                                        postFoiCurtido(postSelecionado)
                                                            ? "ph-fill ph-heart"
                                                            : "ph ph-heart"
                                                    }
                                                ></i>
                                            </button>

                                            <span style={{ color: "#ccc", fontSize: "0.85rem" }}>
                                                {contarCurtidas(postSelecionado)}{" "}
                                                {contarCurtidas(postSelecionado) === 1 ? "curtida" : "curtidas"}
                                            </span>
                                        </div>

                                        <span className="instagram-modal-date">
                                            {formatarData(postSelecionado.criado_em)}
                                        </span>
                                    </div>

                                    <hr className="instagram-modal-divider" />

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                        }}
                                    >
                                        <h3 className="instagram-comments-title">
                                            Comentários
                                        </h3>

                                        {carregandoComentarios ? (
                                            <p
                                                style={{
                                                    color: "#888",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                Carregando comentários...
                                            </p>
                                        ) : comentarios.length > 0 ? (
                                            comentarios.map(
                                                (comentario) => (
                                                    <div
                                                        key={comentario.id}
                                                        className="instagram-comment-item"
                                                        style={{
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        <div
                                                            className="instagram-comment-avatar"
                                                            style={{
                                                                backgroundImage: `url(${comentario
                                                                    .usuarios
                                                                    ?.foto ||
                                                                    AVATAR_PADRAO
                                                                    })`,
                                                            }}
                                                        ></div>

                                                        <div className="instagram-comment-bubble">
                                                            <div
                                                                className="instagram-comment-header"
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "space-between",
                                                                    gap: "10px",
                                                                }}
                                                            >
                                                                <Link
                                                                    to={`/Perfil/${comentario.usuarios?.id}`}
                                                                    className="instagram-comment-user"
                                                                    style={{
                                                                        textDecoration:
                                                                            "none",
                                                                    }}
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    @
                                                                    {comentario
                                                                        .usuarios
                                                                        ?.username ||
                                                                        "Usuário"}
                                                                </Link>

                                                                {/* Data + botão agrupados à direita */}
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: "4px",
                                                                    }}
                                                                >
                                                                    <span className="instagram-comment-time">
                                                                        {formatarData(
                                                                            comentario.criado_em,
                                                                        )}
                                                                    </span>

                                                                    {comentarioEhDono(
                                                                        comentario,
                                                                    ) ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                excluirComentario(
                                                                                    e,
                                                                                    comentario,
                                                                                )
                                                                            }
                                                                            title="Excluir comentário"
                                                                            style={
                                                                                estiloBotaoIconeComentario
                                                                            }
                                                                            onMouseEnter={
                                                                                hoverBotaoIconeEntrar
                                                                            }
                                                                            onMouseLeave={
                                                                                hoverBotaoIconeSair
                                                                            }
                                                                        >
                                                                            <i className="ph ph-trash"></i>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                denunciarComentario(
                                                                                    e,
                                                                                    comentario,
                                                                                )
                                                                            }
                                                                            title="Denunciar comentário"
                                                                            style={
                                                                                estiloBotaoIconeComentario
                                                                            }
                                                                            onMouseEnter={
                                                                                hoverBotaoIconeEntrar
                                                                            }
                                                                            onMouseLeave={
                                                                                hoverBotaoIconeSair
                                                                            }
                                                                        >
                                                                            <i className="ph ph-flag"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <p className="instagram-comment-text">
                                                                {
                                                                    comentario.conteudo
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <p
                                                style={{
                                                    color: "#777",
                                                    fontSize: "0.85rem",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                Nenhum comentário ainda.
                                                Seja o primeiro!
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {!modoEdicao && (
                            <div className="instagram-modal-footer">
                                <form
                                    onSubmit={enviarComentario}
                                    className="instagram-comment-form"
                                >
                                    <input
                                        type="text"
                                        placeholder="Adicione um comentário..."
                                        value={novoComentario}
                                        onChange={(e) =>
                                            setNovoComentario(
                                                e.target.value,
                                            )
                                        }
                                        className="instagram-comment-input"
                                    />

                                    <button
                                        type="submit"
                                        className="instagram-comment-submit"
                                    >
                                        Publicar
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
                </div>

            )
            }

            {/* =========================================================
                MODAL CRIAR POST
            ========================================================= */}

            {
                modalCriarPostAberto && (
                    <div
                        className="modal-criar-post-overlay"
                        onClick={() => setModalCriarPostAberto(false)}
                    >
                        <div
                            className="modal-criar-post-container"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-criar-post-header">
                                <h2 className="modal-criar-post-title">
                                    Criar Nova Postagem
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setModalCriarPostAberto(false)}
                                    className="modal-criar-post-close"
                                >
                                    &times;
                                </button>
                            </div>

                            <form
                                className="modal-criar-post-form"
                                onSubmit={criarNovaPostagem}
                            >
                                <input
                                    type="text"
                                    placeholder="Título da postagem"
                                    value={novoPostForm.titulo}
                                    onChange={(e) =>
                                        setNovoPostForm({
                                            ...novoPostForm,
                                            titulo: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={carregandoCriarPost}
                                />

                                <textarea
                                    placeholder="O que você quer compartilhar?"
                                    value={novoPostForm.conteudo}
                                    onChange={(e) =>
                                        setNovoPostForm({
                                            ...novoPostForm,
                                            conteudo: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={carregandoCriarPost}
                                />

                                <div className="form-group-file">
                                    <label
                                        htmlFor="input-imagem-post"
                                        className="label-upload-imagem"
                                    >
                                        {novoPostForm.imagem
                                            ? "Trocar imagem"
                                            : "Selecionar imagem do computador"}
                                    </label>

                                    <input
                                        id="input-imagem-post"
                                        type="file"
                                        accept="image/*"
                                        style={{
                                            display: "none",
                                        }}
                                        onChange={(e) => {
                                            const arquivo = e.target.files?.[0];

                                            if (arquivo) {
                                                setNovoPostForm({
                                                    ...novoPostForm,
                                                    imagem: arquivo,
                                                });
                                            }
                                        }}
                                        disabled={carregandoCriarPost}
                                    />

                                    {novoPostForm.imagem && (
                                        <div className="preview-container">
                                            <span className="nome-arquivo-selecionado">
                                                📎 {novoPostForm.imagem.name}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn-remover-imagem"
                                                onClick={() =>
                                                    setNovoPostForm({
                                                        ...novoPostForm,
                                                        imagem: null,
                                                    })
                                                }
                                                disabled={carregandoCriarPost}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <select
                                    value={novoPostForm.categoria}
                                    onChange={(e) =>
                                        setNovoPostForm({
                                            ...novoPostForm,
                                            categoria: e.target.value,
                                        })
                                    }
                                    disabled={carregandoCriarPost}
                                >
                                    <option value="Fantasia">Fantasia</option>

                                    <option value="Cultura">Cultura</option>

                                    <option value="Arte">Arte</option>

                                    <option value="Destaque">Destaque</option>

                                    <option value="Historia">História</option>

                                    <option value="Curiosidades">
                                        Curiosidades
                                    </option>

                                    <option value="Reflexao">Reflexão</option>

                                    <option value="Analise">Análise</option>
                                </select>

                                <button
                                    type="submit"
                                    className="modal-criar-post-submit"
                                    disabled={carregandoCriarPost}
                                >
                                    {carregandoCriarPost
                                        ? "Publicando..."
                                        : "Publicar"}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* =========================================================
                MODAL DE DENÚNCIA
            ========================================================= */}

            {
                modalDenunciaAberto && (
                    <div
                        className="eventos-modal-overlay"
                        onClick={() => setModalDenunciaAberto(false)}
                    >
                        <div
                            className="eventos-modal-container"
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: "400px" }}
                        >
                            <div className="eventos-modal-header">
                                <h2 className="eventos-modal-title">Denunciar</h2>

                                <button
                                    onClick={() => setModalDenunciaAberto(false)}
                                    className="eventos-modal-close"
                                >
                                    &times;
                                </button>
                            </div>

                            <form
                                onSubmit={confirmarDenuncia}
                                style={{
                                    padding: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "15px",
                                }}
                            >
                                <p
                                    style={{
                                        color: "#ccc",
                                        fontSize: "0.9rem",
                                        lineHeight: "1.4",
                                    }}
                                >
                                    Por que você deseja denunciar este{" "}
                                    <strong>
                                        {alvoDenuncia?.tipo === "post"
                                            ? "post"
                                            : "comentário"}
                                    </strong>
                                    ?
                                </p>

                                <textarea
                                    value={motivoDenuncia}
                                    onChange={(e) =>
                                        setMotivoDenuncia(e.target.value)
                                    }
                                    placeholder="Ex: Conteúdo ofensivo, spam, assédio, etc."
                                    required
                                    rows={4}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #333",
                                        background: "#18181b",
                                        color: "#fff",
                                        resize: "vertical",
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                />

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginTop: "10px",
                                    }}
                                >
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Enviar Denúncia
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalDenunciaAberto(false)
                                        }
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "#27272a",
                                            color: "#fff",
                                            border: "1px solid #444",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <Rodape />
        </>
    );
}

export default PaginaInicial;
