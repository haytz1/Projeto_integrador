import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from '/supabase.js';
import "../css/denuncias.css";



const STATUS = {
    pendente: "Pendente",
    analisada: "Analisada",
    resolvida: "Resolvida",
    ignorada: "Ignorada",
};

/*
|--------------------------------------------------------------------------
| DESCOBRIR O TIPO DA DENÚNCIA
|--------------------------------------------------------------------------
|
| A tabela "denuncias" NÃO possui a coluna "tipo".
|
| Portanto:
|
| - id_comentario preenchido = comentário
| - id_postagem preenchido = postagem
|
*/

const obterTipoDenuncia = (denuncia) => {
    if (!denuncia) {
        return null;
    }

    if (denuncia.id_comentario) {
        return "comentario";
    }

    if (denuncia.id_postagem) {
        return "post";
    }

    return null;
};

function Denuncias() {
    const [denuncias, setDenuncias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [denunciaSelecionada, setDenunciaSelecionada] = useState(null);
    const [atualizandoStatus, setAtualizandoStatus] = useState(null);
    const [processandoAlvo, setProcessandoAlvo] = useState(false);

    const [tipoUsuario, setTipoUsuario] = useState(null);
    const [verificandoAcesso, setVerificandoAcesso] = useState(true);

    const usuarioAutorizado =
        tipoUsuario === "admin" || tipoUsuario === "moderador";

    /*
    |--------------------------------------------------------------------------
    | DESCOBRIR O TIPO DO USUÁRIO
    |--------------------------------------------------------------------------
    |
    | O tipo (admin / moderador) é buscado na tabela "usuarios" pelo
    | usuário logado no Supabase Auth. Não usamos o localStorage, porque
    | qualquer pessoa consegue alterar o localStorage pelo navegador.
    |
    */

    useEffect(() => {
        async function buscarTipoUsuario() {
            const { data: authData } = await supabase.auth.getUser();

            if (authData && authData.user) {
                const { data } = await supabase
                    .from("usuarios")
                    .select("tipo_usuario")
                    .eq("auth_id", authData.user.id)
                    .maybeSingle();

                if (data) {
                    setTipoUsuario(data.tipo_usuario);
                }
            }

            setVerificandoAcesso(false);
        }

        buscarTipoUsuario();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | BUSCAR DENÚNCIAS AO ENTRAR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (verificandoAcesso) {
            return;
        }

        if (!usuarioAutorizado) {
            // eslint-disable-next-line react/set-state-in-effect
            setCarregando(false);
            return;
        }

        buscarDenuncias();
    }, [verificandoAcesso, usuarioAutorizado]);

    /*
    |--------------------------------------------------------------------------
    | BUSCAR DENÚNCIAS
    |--------------------------------------------------------------------------
    */

    async function buscarDenuncias() {
        setCarregando(true);
        setErro("");

        try {
            const usuarioIdAtual = localStorage.getItem("usuario_id");

            if (!usuarioIdAtual) {
                throw new Error("Usuário não identificado.");
            }

            const { data: autorizacao, error: erroAutorizacao } =
                await supabase.rpc("usuario_pode_visualizar_denuncias", {
                    usuario_logado: Number(usuarioIdAtual),
                });

            if (erroAutorizacao) {
                throw erroAutorizacao;
            }

            if (!autorizacao) {
                throw new Error(
                    "Você não possui permissão para visualizar as denúncias.",
                );
            }

            /*
             * IMPORTANTE:
             *
             * NÃO buscamos "tipo", pois essa coluna não existe.
             */

            const { data, error } = await supabase
                .from("denuncias")
                .select(
                    `
                    id,
                    id_usuario,
                    id_postagem,
                    id_comentario,
                    motivo,
                    criado_em,
                    status,

                    denunciante:usuarios!denuncias_id_usuario_fkey (
                        id,
                        username,
                        foto
                    ),

                    postagens!denuncias_id_postagem_fkey (
                        id,
                        titulo,
                        conteudo,
                        imagem,
                        categoria,
                        criado_em,
                        id_usuario,
                        oculto,

                        autor:usuarios!postagens_id_usuario_fkey (
                            id,
                            username,
                            foto
                        ),

                        usuario_ocultou:usuarios!postagens_ocultado_por_fkey (
                            id,
                            username,
                            foto
                        )
                    ),

                    comentarios!denuncias_id_comentario_fkey (
                        id,
                        conteudo,
                        criado_em,
                        id_usuario,
                        id_postagem,

                        autor:usuarios!comentarios_id_usuario_fkey (
                            id,
                            username,
                            foto
                        )
                    )
                `,
                )
                .order("criado_em", {
                    ascending: false,
                });

            if (error) {
                throw error;
            }

            setDenuncias(data || []);
        } catch (error) {
            console.error("Erro ao buscar denúncias:", error);

            setErro(error.message || "Não foi possível carregar as denúncias.");

            setDenuncias([]);
        } finally {
            setCarregando(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ALTERAR STATUS
    |--------------------------------------------------------------------------
    */

    const alterarStatus = async (id, novoStatus) => {
        setAtualizandoStatus(id);

        try {
            const usuarioIdAtual = localStorage.getItem("usuario_id");

            if (!usuarioIdAtual) {
                throw new Error("Usuário não identificado.");
            }

            const { error } = await supabase.rpc("alterar_status_denuncia", {
                usuario_logado: Number(usuarioIdAtual),
                denuncia_id: Number(id),
                novo_status: novoStatus,
            });

            if (error) {
                throw error;
            }

            setDenuncias((prev) =>
                prev.map((denuncia) =>
                    denuncia.id === id
                        ? {
                              ...denuncia,
                              status: novoStatus,
                          }
                        : denuncia,
                ),
            );

            setDenunciaSelecionada((prev) =>
                prev?.id === id
                    ? {
                          ...prev,
                          status: novoStatus,
                      }
                    : prev,
            );
        } catch (error) {
            console.error("Erro ao alterar status:", error);

            alert(error.message || "Não foi possível alterar o status.");
        } finally {
            setAtualizandoStatus(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | EXCLUIR DENÚNCIA
    |--------------------------------------------------------------------------
    */

    const excluirDenuncia = async (denuncia) => {
        const confirmou = await window.confirmarNaTela(
            "Tem certeza que deseja excluir esta denúncia?\n\n" +
                "Esta ação não pode ser desfeita.",
        );

        if (!confirmou) {
            return;
        }

        try {
            const usuarioIdAtual = localStorage.getItem("usuario_id");

            if (!usuarioIdAtual) {
                throw new Error("Usuário não identificado.");
            }

            const { error } = await supabase.rpc("excluir_denuncia", {
                usuario_logado: Number(usuarioIdAtual),
                denuncia_id: Number(denuncia.id),
            });

            if (error) {
                throw error;
            }

            setDenuncias((prev) =>
                prev.filter((item) => item.id !== denuncia.id),
            );

            setDenunciaSelecionada(null);

            alert("Denúncia excluída com sucesso.");
        } catch (error) {
            console.error("Erro ao excluir denúncia:", error);

            alert(error.message || "Não foi possível excluir a denúncia.");
        }
    };

    /*
    |--------------------------------------------------------------------------
    | OCULTAR POSTAGEM
    |--------------------------------------------------------------------------
    */

    const ocultarPostagem = async (denuncia) => {
        const tipo = obterTipoDenuncia(denuncia);

        if (tipo !== "post") {
            return;
        }

        const postId = denuncia?.postagens?.id;

        if (!postId) {
            alert("A postagem não está mais disponível.");
            return;
        }

        if (denuncia.postagens.oculto) {
            alert("Esta postagem já está oculta.");
            return;
        }

        const confirmou = await window.confirmarNaTela(
            "Deseja ocultar esta postagem?\n\n" +
                "Ela continuará salva no banco de dados, " +
                "mas não aparecerá para os usuários.",
        );

        if (!confirmou) {
            return;
        }

        try {
            setProcessandoAlvo(true);

            const usuarioIdAtual = localStorage.getItem("usuario_id");

            if (!usuarioIdAtual) {
                throw new Error("Usuário não identificado.");
            }

            const { error } = await supabase.rpc(
                "alterar_visibilidade_postagem",
                {
                    usuario_logado: Number(usuarioIdAtual),
                    postagem_id: Number(postId),
                    nova_visibilidade: false,
                },
            );

            if (error) {
                throw error;
            }

            setDenuncias((prev) =>
                prev.map((item) => {
                    if (item.id !== denuncia.id) {
                        return item;
                    }

                    return {
                        ...item,
                        postagens: item.postagens
                            ? {
                                  ...item.postagens,
                                  oculto: true,
                              }
                            : null,
                    };
                }),
            );

            setDenunciaSelecionada((prev) => {
                if (!prev || prev.id !== denuncia.id) {
                    return prev;
                }

                return {
                    ...prev,
                    postagens: prev.postagens
                        ? {
                              ...prev.postagens,
                              oculto: true,
                          }
                        : null,
                };
            });

            alert("Postagem ocultada com sucesso.");
        } catch (error) {
            console.error("Erro ao ocultar postagem:", error);

            alert(error.message || "Não foi possível ocultar a postagem.");
        } finally {
            setProcessandoAlvo(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | EXCLUIR POSTAGEM
    |--------------------------------------------------------------------------
    */

    const excluirPostagem = async (denuncia) => {
        const tipo = obterTipoDenuncia(denuncia);

        if (tipo !== "post") {
            return;
        }

        const postId = denuncia?.postagens?.id;

        if (!postId) {
            alert("A postagem não está mais disponível.");
            return;
        }

        if (tipoUsuario !== "admin") {
            alert("Somente administradores podem excluir postagens.");
            return;
        }

        const confirmou = await window.confirmarNaTela(
            "ATENÇÃO!\n\n" +
                "Deseja excluir definitivamente esta postagem?\n\n" +
                "Esta ação não pode ser desfeita.",
        );

        if (!confirmou) {
            return;
        }

        try {
            setProcessandoAlvo(true);

            const usuarioIdAtual = localStorage.getItem("usuario_id");

            if (!usuarioIdAtual) {
                throw new Error("Usuário não identificado.");
            }

            const { error } = await supabase.rpc("excluir_postagem_admin", {
                usuario_logado: Number(usuarioIdAtual),
                postagem_id: Number(postId),
            });

            if (error) {
                throw error;
            }

            setDenuncias((prev) =>
                prev.map((item) =>
                    item.id === denuncia.id
                        ? {
                              ...item,
                              postagens: null,
                          }
                        : item,
                ),
            );

            setDenunciaSelecionada((prev) =>
                prev?.id === denuncia.id
                    ? {
                          ...prev,
                          postagens: null,
                      }
                    : prev,
            );

            alert("Postagem excluída definitivamente.");
        } catch (error) {
            console.error("Erro ao excluir postagem:", error);

            alert(error.message || "Não foi possível excluir a postagem.");
        } finally {
            setProcessandoAlvo(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | EXCLUIR COMENTÁRIO
    |--------------------------------------------------------------------------
    */

    const excluirComentario = async (denuncia) => {
        const tipo = obterTipoDenuncia(denuncia);

        if (tipo !== "comentario") {
            return;
        }

        const comentarioId = denuncia?.comentarios?.id;

        if (!comentarioId) {
            alert("O comentário não está mais disponível.");
            return;
        }

        if (tipoUsuario !== "admin") {
            alert("Somente administradores podem excluir comentários.");
            return;
        }

        const confirmou = await window.confirmarNaTela(
            "ATENÇÃO!\n\n" +
                "Deseja excluir definitivamente este comentário?\n\n" +
                "Esta ação não pode ser desfeita.",
        );

        if (!confirmou) {
            return;
        }

        try {
            setProcessandoAlvo(true);

            const usuarioIdAtual = localStorage.getItem("usuario_id");

            if (!usuarioIdAtual) {
                throw new Error("Usuário não identificado.");
            }

            const { error } = await supabase.rpc("excluir_comentario_admin", {
                usuario_logado: Number(usuarioIdAtual),
                comentario_id: Number(comentarioId),
            });

            if (error) {
                throw error;
            }

            setDenuncias((prev) =>
                prev.map((item) =>
                    item.id === denuncia.id
                        ? {
                              ...item,
                              comentarios: null,
                          }
                        : item,
                ),
            );

            setDenunciaSelecionada((prev) =>
                prev?.id === denuncia.id
                    ? {
                          ...prev,
                          comentarios: null,
                      }
                    : prev,
            );

            alert("Comentário excluído definitivamente.");
        } catch (error) {
            console.error("Erro ao excluir comentário:", error);

            alert(error.message || "Não foi possível excluir o comentário.");
        } finally {
            setProcessandoAlvo(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FORMATAR DATA
    |--------------------------------------------------------------------------
    */

    const formatarData = (data) => {
        if (!data) {
            return "Data desconhecida";
        }

        return new Date(data).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /*
    |--------------------------------------------------------------------------
    | FILTROS
    |--------------------------------------------------------------------------
    */

    const denunciasFiltradas = denuncias.filter((denuncia) => {
        const status = denuncia.status || "pendente";

        const tipo = obterTipoDenuncia(denuncia);

        const passaStatus = filtroStatus === "todos" || status === filtroStatus;

        const passaTipo = filtroTipo === "todos" || tipo === filtroTipo;

        return passaStatus && passaTipo;
    });

    const contarStatus = (status) => {
        return denuncias.filter(
            (denuncia) => (denuncia.status || "pendente") === status,
        ).length;
    };

    const contarTipo = (tipo) => {
        return denuncias.filter(
            (denuncia) => obterTipoDenuncia(denuncia) === tipo,
        ).length;
    };

    /*
    |--------------------------------------------------------------------------
    | ACESSO NEGADO
    |--------------------------------------------------------------------------
    */

    if (verificandoAcesso) {
        return null;
    }

    if (!usuarioAutorizado) {
        return (
            <div className="denuncias-acesso-negado">
                <div className="acesso-negado-card">
                    <i className="ph-fill ph-shield-warning"></i>

                    <h1>Acesso restrito</h1>

                    <p>
                        Você não possui permissão para visualizar as denúncias
                        da plataforma.
                    </p>

                    <Link to="/" className="btn-voltar-denuncias">
                        Voltar para o início
                    </Link>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | INTERFACE
    |--------------------------------------------------------------------------
    */

    return (
        <div className="pagina-denuncias">
            <header className="denuncias-header">
                <div>
                    <span className="denuncias-eyebrow">
                        PAINEL DE MODERAÇÃO
                    </span>

                    <h1>
                        <i className="ph-fill ph-flag"></i>
                        Denúncias
                    </h1>

                    <p>
                        Visualize e gerencie as denúncias enviadas pelos
                        usuários.
                    </p>
                </div>

                <div className="denuncias-header-actions">
                    <Link to="/" className="btn-voltar-denuncias">
                        <i className="ph ph-arrow-left"></i>
                        Voltar
                    </Link>

                    <button
                        className="btn-atualizar-denuncias"
                        onClick={buscarDenuncias}
                        disabled={carregando}
                    >
                        <i className="ph ph-arrows-clockwise"></i>

                        {carregando ? "Atualizando..." : "Atualizar"}
                    </button>
                </div>
            </header>

            {/* RESUMO */}

            <section className="denuncias-resumo">
                <div className="resumo-card">
                    <div className="resumo-icon total">
                        <i className="ph-fill ph-list-bullets"></i>
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>{denuncias.length}</strong>
                    </div>
                </div>

                <div className="resumo-card">
                    <div className="resumo-icon pendente">
                        <i className="ph-fill ph-clock"></i>
                    </div>

                    <div>
                        <span>Pendentes</span>
                        <strong>{contarStatus("pendente")}</strong>
                    </div>
                </div>

                <div className="resumo-card">
                    <div className="resumo-icon analisada">
                        <i className="ph-fill ph-eye"></i>
                    </div>

                    <div>
                        <span>Analisadas</span>
                        <strong>{contarStatus("analisada")}</strong>
                    </div>
                </div>

                <div className="resumo-card">
                    <div className="resumo-icon resolvida">
                        <i className="ph-fill ph-check-circle"></i>
                    </div>

                    <div>
                        <span>Resolvidas</span>
                        <strong>{contarStatus("resolvida")}</strong>
                    </div>
                </div>

                <div className="resumo-card">
                    <div className="resumo-icon total">
                        <i className="ph ph-chat-circle"></i>
                    </div>

                    <div>
                        <span>Comentários</span>
                        <strong>{contarTipo("comentario")}</strong>
                    </div>
                </div>
            </section>

            {/* FILTROS */}

            <section className="denuncias-filtros">
                <div className="filtro-label">
                    <i className="ph ph-funnel"></i>
                    Status
                </div>

                {[
                    ["todos", "Todas"],
                    ["pendente", "Pendentes"],
                    ["analisada", "Analisadas"],
                    ["resolvida", "Resolvidas"],
                    ["ignorada", "Ignoradas"],
                ].map(([valor, nome]) => (
                    <button
                        key={valor}
                        className={
                            filtroStatus === valor
                                ? "filtro-status ativo"
                                : "filtro-status"
                        }
                        onClick={() => setFiltroStatus(valor)}
                    >
                        {nome}
                    </button>
                ))}

                <div className="filtro-label" style={{ marginLeft: "20px" }}>
                    <i className="ph ph-files"></i>
                    Tipo
                </div>

                {[
                    ["todos", "Todos"],
                    ["post", "Postagens"],
                    ["comentario", "Comentários"],
                ].map(([valor, nome]) => (
                    <button
                        key={valor}
                        className={
                            filtroTipo === valor
                                ? "filtro-status ativo"
                                : "filtro-status"
                        }
                        onClick={() => setFiltroTipo(valor)}
                    >
                        {nome}
                    </button>
                ))}
            </section>

            {/* ERRO */}

            {erro && (
                <div className="denuncias-erro">
                    <i className="ph-fill ph-warning"></i>
                    {erro}
                </div>
            )}

            {/* TABELA */}

            <section className="denuncias-tabela-container">
                {carregando ? (
                    <div className="denuncias-loading">
                        <i className="ph ph-spinner"></i>
                        <span>Carregando denúncias...</span>
                    </div>
                ) : denunciasFiltradas.length === 0 ? (
                    <div className="denuncias-vazio">
                        <i className="ph ph-check-circle"></i>

                        <h2>Nenhuma denúncia encontrada</h2>

                        <p>
                            Não existem denúncias para os filtros selecionados.
                        </p>
                    </div>
                ) : (
                    <div className="tabela-scroll">
                        <table className="tabela-denuncias">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tipo</th>
                                    <th>Conteúdo denunciado</th>
                                    <th>Denunciante</th>
                                    <th>Autor</th>
                                    <th>Motivo</th>
                                    <th>Data</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {denunciasFiltradas.map((denuncia) => {
                                    const tipo = obterTipoDenuncia(denuncia);

                                    const ehComentario = tipo === "comentario";

                                    const post = denuncia.postagens;
                                    const comentario = denuncia.comentarios;

                                    const autor = ehComentario
                                        ? comentario?.autor
                                        : post?.autor;

                                    const denunciante = denuncia.denunciante;

                                    const status =
                                        denuncia.status || "pendente";

                                    return (
                                        <tr key={denuncia.id}>
                                            <td>
                                                <span className="denuncia-id">
                                                    #{denuncia.id}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`tipo-denuncia ${
                                                        ehComentario
                                                            ? "tipo-comentario"
                                                            : "tipo-post"
                                                    }`}
                                                >
                                                    <i
                                                        className={
                                                            ehComentario
                                                                ? "ph ph-chat-circle"
                                                                : "ph ph-article"
                                                        }
                                                    ></i>

                                                    {ehComentario
                                                        ? "Comentário"
                                                        : "Postagem"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="celula-post">
                                                    {!ehComentario &&
                                                        post?.imagem && (
                                                            <img
                                                                src={
                                                                    post.imagem
                                                                }
                                                                alt=""
                                                            />
                                                        )}

                                                    <div>
                                                        {ehComentario ? (
                                                            <>
                                                                <strong>
                                                                    Comentário #
                                                                    {
                                                                        denuncia.id_comentario
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {comentario?.conteudo ||
                                                                        "Comentário removido"}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <strong>
                                                                    {post?.titulo ||
                                                                        "Postagem removida"}
                                                                </strong>

                                                                {post && (
                                                                    <span>
                                                                        #
                                                                        {
                                                                            post.id
                                                                        }
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <Link
                                                    to={
                                                        denunciante?.id
                                                            ? `/Perfil/${denunciante.id}`
                                                            : "#"
                                                    }
                                                    className="usuario-denuncia"
                                                    onClick={(e) => {
                                                        if (!denunciante?.id) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <span className="avatar-mini">
                                                        {denunciante?.foto ? (
                                                            <img
                                                                src={
                                                                    denunciante.foto
                                                                }
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <i className="ph-fill ph-user"></i>
                                                        )}
                                                    </span>

                                                    <span>
                                                        @
                                                        {denunciante?.username ||
                                                            "Usuário"}
                                                    </span>
                                                </Link>
                                            </td>

                                            <td>
                                                <Link
                                                    to={
                                                        autor?.id
                                                            ? `/Perfil/${autor.id}`
                                                            : "#"
                                                    }
                                                    className="usuario-denuncia"
                                                    onClick={(e) => {
                                                        if (!autor?.id) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <span className="avatar-mini">
                                                        {autor?.foto ? (
                                                            <img
                                                                src={autor.foto}
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <i className="ph-fill ph-user"></i>
                                                        )}
                                                    </span>

                                                    <span>
                                                        @
                                                        {autor?.username ||
                                                            "Usuário"}
                                                    </span>
                                                </Link>
                                            </td>

                                            <td>
                                                <span className="motivo-texto">
                                                    {denuncia.motivo ||
                                                        "Não informado"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="data-denuncia">
                                                    {formatarData(
                                                        denuncia.criado_em,
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <select
                                                    className={`select-status status-${status}`}
                                                    value={status}
                                                    disabled={
                                                        atualizandoStatus ===
                                                        denuncia.id
                                                    }
                                                    onChange={(e) =>
                                                        alterarStatus(
                                                            denuncia.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="pendente">
                                                        Pendente
                                                    </option>

                                                    <option value="analisada">
                                                        Analisada
                                                    </option>

                                                    <option value="resolvida">
                                                        Resolvida
                                                    </option>

                                                    <option value="ignorada">
                                                        Ignorada
                                                    </option>
                                                </select>
                                            </td>

                                            <td>
                                                <div className="acoes-denuncia">
                                                    <button
                                                        className="btn-acao visualizar"
                                                        title="Visualizar denúncia"
                                                        onClick={() =>
                                                            setDenunciaSelecionada(
                                                                denuncia,
                                                            )
                                                        }
                                                    >
                                                        <i className="ph ph-eye"></i>
                                                    </button>

                                                    <button
                                                        className="btn-acao excluir"
                                                        title="Excluir denúncia"
                                                        onClick={() =>
                                                            excluirDenuncia(
                                                                denuncia,
                                                            )
                                                        }
                                                    >
                                                        <i className="ph ph-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* MODAL */}

            {denunciaSelecionada && (
                <div
                    className="modal-denuncia-overlay"
                    onClick={() => setDenunciaSelecionada(null)}
                >
                    <div
                        className="modal-denuncia"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/*
                        =========================================================
                        TIPO DA DENÚNCIA
                        =========================================================
                        */}

                        {(() => {
                            const tipo = obterTipoDenuncia(denunciaSelecionada);

                            const ehComentario = tipo === "comentario";

                            const autor = ehComentario
                                ? denunciaSelecionada.comentarios?.autor
                                : denunciaSelecionada.postagens?.autor;

                            return (
                                <>
                                    {/* HEADER */}

                                    <div className="modal-denuncia-header">
                                        <div>
                                            <span>
                                                DENÚNCIA #
                                                {denunciaSelecionada.id}
                                            </span>

                                            <h2>Detalhes da denúncia</h2>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setDenunciaSelecionada(null)
                                            }
                                            className="btn-fechar-denuncia"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {/* BODY */}

                                    <div className="modal-denuncia-body">
                                        <div className="detalhe-denuncia-grid">
                                            <div className="detalhe-item">
                                                <span>Tipo</span>

                                                <strong>
                                                    {ehComentario
                                                        ? "Comentário"
                                                        : "Postagem"}
                                                </strong>
                                            </div>

                                            <div className="detalhe-item">
                                                <span>Denunciante</span>

                                                <strong>
                                                    @
                                                    {denunciaSelecionada
                                                        .denunciante
                                                        ?.username || "Usuário"}
                                                </strong>
                                            </div>

                                            <div className="detalhe-item">
                                                <span>Autor</span>

                                                <strong>
                                                    @
                                                    {autor?.username ||
                                                        "Usuário"}
                                                </strong>
                                            </div>

                                            <div className="detalhe-item">
                                                <span>Data</span>

                                                <strong>
                                                    {formatarData(
                                                        denunciaSelecionada.criado_em,
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="detalhe-item">
                                                <span>Status</span>

                                                <strong>
                                                    {
                                                        STATUS[
                                                            denunciaSelecionada.status ||
                                                                "pendente"
                                                        ]
                                                    }
                                                </strong>
                                            </div>
                                        </div>

                                        {/* MOTIVO */}

                                        <div className="detalhe-motivo">
                                            <span>Motivo informado</span>

                                            <p>
                                                {denunciaSelecionada.motivo ||
                                                    "Não informado"}
                                            </p>
                                        </div>

                                        {/* =================================================
                                            COMENTÁRIO
                                        ================================================= */}

                                        {ehComentario ? (
                                            <div className="detalhe-post">
                                                <div className="detalhe-post-header">
                                                    <div>
                                                        <span>
                                                            COMENTÁRIO
                                                            DENUNCIADO
                                                        </span>

                                                        <h3>
                                                            Comentário #
                                                            {
                                                                denunciaSelecionada.id_comentario
                                                            }
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div className="conteudo-post-denuncia">
                                                    <span>
                                                        Conteúdo do comentário
                                                    </span>

                                                    <p>
                                                        {denunciaSelecionada
                                                            .comentarios
                                                            ?.conteudo ||
                                                            "O comentário não está mais disponível."}
                                                    </p>
                                                </div>

                                                {denunciaSelecionada.comentarios
                                                    ?.criado_em && (
                                                    <div className="conteudo-post-denuncia">
                                                        <span>
                                                            Publicado em
                                                        </span>

                                                        <p>
                                                            {formatarData(
                                                                denunciaSelecionada
                                                                    .comentarios
                                                                    .criado_em,
                                                            )}
                                                        </p>
                                                    </div>
                                                )}

                                                {denunciaSelecionada.comentarios
                                                    ?.id && (
                                                    <div className="acoes-post-denuncia">
                                                        {tipoUsuario ===
                                                            "admin" && (
                                                            <button
                                                                className="btn-excluir-post"
                                                                disabled={
                                                                    processandoAlvo
                                                                }
                                                                onClick={() =>
                                                                    excluirComentario(
                                                                        denunciaSelecionada,
                                                                    )
                                                                }
                                                            >
                                                                <i className="ph ph-trash"></i>

                                                                {processandoAlvo
                                                                    ? "Processando..."
                                                                    : "Excluir comentário"}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* =================================================
                                               POSTAGEM
                                            ================================================= */

                                            <div className="detalhe-post">
                                                <div className="detalhe-post-header">
                                                    <div>
                                                        <span>
                                                            POSTAGEM DENUNCIADA
                                                        </span>

                                                        <h3>
                                                            {denunciaSelecionada
                                                                .postagens
                                                                ?.titulo ||
                                                                "Postagem não encontrada"}
                                                        </h3>
                                                    </div>

                                                    {denunciaSelecionada
                                                        .postagens?.id && (
                                                        <span className="post-id-modal">
                                                            #
                                                            {
                                                                denunciaSelecionada
                                                                    .postagens
                                                                    .id
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                {/* AÇÕES */}

                                                {denunciaSelecionada.postagens
                                                    ?.id && (
                                                    <div className="acoes-post-denuncia">
                                                        <button
                                                            className="btn-ocultar-post"
                                                            disabled={
                                                                processandoAlvo ||
                                                                denunciaSelecionada
                                                                    .postagens
                                                                    ?.oculto
                                                            }
                                                            onClick={() =>
                                                                ocultarPostagem(
                                                                    denunciaSelecionada,
                                                                )
                                                            }
                                                        >
                                                            <i className="ph ph-eye-slash"></i>

                                                            {denunciaSelecionada
                                                                .postagens
                                                                ?.oculto
                                                                ? "Postagem ocultada"
                                                                : processandoAlvo
                                                                  ? "Processando..."
                                                                  : "Ocultar postagem"}
                                                        </button>

                                                        {tipoUsuario ===
                                                            "admin" && (
                                                            <button
                                                                className="btn-excluir-post"
                                                                disabled={
                                                                    processandoAlvo
                                                                }
                                                                onClick={() =>
                                                                    excluirPostagem(
                                                                        denunciaSelecionada,
                                                                    )
                                                                }
                                                            >
                                                                <i className="ph ph-trash"></i>

                                                                {processandoAlvo
                                                                    ? "Processando..."
                                                                    : "Excluir definitivamente"}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* IMAGEM */}

                                                {denunciaSelecionada.postagens
                                                    ?.imagem && (
                                                    <img
                                                        className="imagem-post-denuncia"
                                                        src={
                                                            denunciaSelecionada
                                                                .postagens
                                                                .imagem
                                                        }
                                                        alt="Post denunciado"
                                                    />
                                                )}

                                                {/* CONTEÚDO */}

                                                <div className="conteudo-post-denuncia">
                                                    <span>Conteúdo</span>

                                                    <p>
                                                        {denunciaSelecionada
                                                            .postagens
                                                            ?.conteudo ||
                                                            "A postagem não está mais disponível."}
                                                    </p>
                                                </div>

                                                {/* LINK */}

                                                {denunciaSelecionada.postagens
                                                    ?.id && (
                                                    <Link
                                                        to="/"
                                                        className="btn-ver-post-denuncia"
                                                        onClick={() =>
                                                            setDenunciaSelecionada(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        <i className="ph ph-arrow-square-out"></i>
                                                        Ir para a página inicial
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* FOOTER */}

                                    <div className="modal-denuncia-footer">
                                        <span>Alterar status:</span>

                                        <div className="status-acoes">
                                            {Object.entries(STATUS).map(
                                                ([valor, nome]) => (
                                                    <button
                                                        key={valor}
                                                        className={`btn-status-modal status-${valor}`}
                                                        disabled={
                                                            atualizandoStatus ===
                                                            denunciaSelecionada.id
                                                        }
                                                        onClick={() =>
                                                            alterarStatus(
                                                                denunciaSelecionada.id,
                                                                valor,
                                                            )
                                                        }
                                                    >
                                                        {nome}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Denuncias;
