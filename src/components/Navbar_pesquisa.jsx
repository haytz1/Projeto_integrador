import React, { useState, useEffect, useRef } from "react";

import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../../supabase";

import "./Navbar_pesquisa.css";

import BarraPesquisa from "./BarraPesquisa";

// Links do menu do celular (a barra lateral some em telas pequenas)
const LINKS_MENU_CELULAR = [
    { rota: "/", texto: "Início", icone: "ph-house" },
    { rota: "/ObrasMangas", texto: "Obras", icone: "ph-books" },
    { rota: "/Seguindo", texto: "Seguindo", icone: "ph-users" },
    { rota: "/Favoritos", texto: "Favoritos", icone: "ph-heart" },
    { rota: "/Historico", texto: "Histórico", icone: "ph-clock-counter-clockwise" },
    { rota: "/Notificacoes", texto: "Notificações", icone: "ph-bell" },
    { rota: "/Planos", texto: "Planos", icone: "ph-crown" },
    { rota: "/Moedas", texto: "Moedas", icone: "ph-coins" },
    { rota: "/Sobre", texto: "Ajuda e FAQ", icone: "ph-question" },
];

function NavbarPesquisa() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    const [fotoPerfil, setFotoPerfil] = useState("");

    const [tipoUsuario, setTipoUsuario] = useState("");

    const [naoLidas, setNaoLidas] = useState(0);

    const [menuAberto, setMenuAberto] = useState(false);

    // Menu lateral do celular (no computador ele não aparece)
    const [menuCelularAberto, setMenuCelularAberto] = useState(false);

    const menuRef = useRef(null);

    const navigate = useNavigate();

    // =====================================================
    // VERIFICAR USUÁRIO LOGADO
    // =====================================================

    useEffect(() => {
        async function verificarSessao() {
            const emailSalvo = localStorage.getItem("usuario_email");

            if (emailSalvo) {
                setUsuarioLogado(emailSalvo);

                const { data } = await supabase
                    .from("usuarios")
                    .select("id, foto, tipo_usuario")
                    .eq("email", emailSalvo)
                    .single();

                if (data && data.foto) {
                    setFotoPerfil(data.foto);
                }

                if (data) {
                    setTipoUsuario(data.tipo_usuario || "");

                    // Conta as notificações que ainda não foram lidas
                    const { count } = await supabase
                        .from("notificacoes")
                        .select("id", { count: "exact", head: true })
                        .eq("id_usuario", data.id)
                        .eq("lida", false);

                    setNaoLidas(count || 0);
                }
            }
        }

        verificarSessao();
    }, []);

    // =====================================================
    // SAIR DA CONTA
    // =====================================================

    async function sair() {
        await supabase.auth.signOut();

        localStorage.removeItem("usuario_id");
        localStorage.removeItem("usuario_auth_id");
        localStorage.removeItem("usuario_email");
        localStorage.removeItem("usuario_username");

        setUsuarioLogado(null);
        setFotoPerfil("");
        setTipoUsuario("");
        setNaoLidas(0);
        setMenuAberto(false);

        navigate("/");
    }

    // =====================================================
    // FECHAR MENU AO CLICAR FORA
    // =====================================================

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // =====================================================
    // MENU DO CELULAR: TRAVAR A PÁGINA DE TRÁS
    //
    // Enquanto o menu está aberto, a página de trás não rola.
    // Quando ele fecha (ou a página troca), a rolagem SEMPRE
    // volta ao normal — isso evita a página ficar travada
    // no iPhone.
    // =====================================================

    useEffect(() => {
        if (!menuCelularAberto) return;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuCelularAberto]);

    // Fecha o menu com um pequeno atraso, depois que o dedo
    // já saiu da tela (no iPhone, apagar algo durante o toque
    // pode travar a rolagem).
    function fecharMenuCelular() {
        setTimeout(() => setMenuCelularAberto(false), 50);
    }

    return (
        <div>
            <nav className="navbar">
                {/* =====================================================
                    LOGO
                ===================================================== */}

                <div className="nav-left">
                    {/* Botão do menu (só aparece no celular) */}
                    <button
                        type="button"
                        className="nav-menu-celular"
                        onClick={() => setMenuCelularAberto(true)}
                        aria-label="Abrir menu"
                    >
                        <i className="ph ph-list"></i>
                    </button>

                    <Link to="/">
                        <img
                            src="/logo_animespot.png"
                            alt="Logo AnimeSpot"
                            className="nav-logo-img"
                        />
                    </Link>

                    <Link to="/" className="nav-logo-text">
                        AnimeSpot
                    </Link>
                </div>

                {/* =====================================================
                    PESQUISA
                ===================================================== */}

                <div className="nav-center">
                    <BarraPesquisa />
                </div>

                {/* =====================================================
                    LOGIN / PERFIL
                ===================================================== */}

                <div className="nav-right">
                    {usuarioLogado ? (
                        <div className="nav-profile-dropdown" ref={menuRef}>
                            {/* =================================================
                                FOTO DE PERFIL

                                Clicar na foto vai para o Perfil
                            ================================================= */}

                            <Link
                                to="/Perfil"
                                className="nav-profile-photo-link"
                                onClick={() => setMenuAberto(false)}
                            >
                                <div className="nav-avatar-circle">
                                    {fotoPerfil ? (
                                        <img
                                            src={fotoPerfil}
                                            alt="Perfil"
                                            className="nav-profile-img"
                                        />
                                    ) : (
                                        <i className="ph ph-user"></i>
                                    )}
                                </div>
                            </Link>

                            {/* =================================================
                                SETA

                                Clicar na seta abre/fecha o menu
                            ================================================= */}

                            <button
                                type="button"
                                className="nav-profile-arrow"
                                onClick={() => setMenuAberto(!menuAberto)}
                                aria-label="Abrir menu do perfil"
                            >
                                <i
                                    className={`ph ph-caret-down ${
                                        menuAberto ? "arrow-open" : ""
                                    }`}
                                ></i>
                            </button>

                            {/* =================================================
                                MENU SUSPENSO
                            ================================================= */}

                            {menuAberto && (
                                <div className="profile-dropdown">
                                    {/* =================================================
                                        VER PERFIL
                                    ================================================= */}

                                    <Link
                                        to="/Perfil"
                                        className="profile-dropdown-item"
                                        onClick={() => setMenuAberto(false)}
                                    >
                                        <i className="ph ph-user"></i>

                                        <span>Ver perfil</span>
                                    </Link>

                                    {/* =================================================
                                        CONFIGURAÇÕES

                                        A tela de configurações fica
                                        dentro do Perfil
                                    ================================================= */}

                                    <Link
                                        to="/Perfil?aba=configuracoes"
                                        className="profile-dropdown-item"
                                        onClick={() => setMenuAberto(false)}
                                    >
                                        <i className="ph ph-gear"></i>

                                        <span>Configurações</span>
                                    </Link>

                                    {/* =================================================
                                        NOTIFICAÇÕES
                                    ================================================= */}

                                    <Link
                                        to="/Notificacoes"
                                        className="profile-dropdown-item"
                                        onClick={() => setMenuAberto(false)}
                                    >
                                        <i className="ph ph-bell"></i>

                                        <span>Notificações</span>

                                        {naoLidas > 0 && (
                                            <span className="nav-notif-contador">
                                                {naoLidas}
                                            </span>
                                        )}
                                    </Link>

                                    {/* =================================================
                                        DENÚNCIAS (só admin e moderador)
                                    ================================================= */}

                                    {(tipoUsuario === "admin" ||
                                        tipoUsuario === "moderador") && (
                                        <Link
                                            to="/Denuncias"
                                            className="profile-dropdown-item"
                                            onClick={() => setMenuAberto(false)}
                                        >
                                            <i className="ph ph-shield-warning"></i>

                                            <span>Denúncias</span>
                                        </Link>
                                    )}

                                    {/* =================================================
                                        DIVISÓRIA
                                    ================================================= */}

                                    <div className="profile-dropdown-divider"></div>

                                    {/* =================================================
                                        SAIR
                                    ================================================= */}

                                    <button
                                        type="button"
                                        className="profile-dropdown-item profile-logout"
                                        onClick={sair}
                                    >
                                        <i className="ph ph-sign-out"></i>

                                        <span>Sair</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* =================================================
                           BOTÕES DE LOGIN
                        ================================================= */

                        <div
                            className="nav-auth-buttons"
                            style={{
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            <Link
                                to="/Login"
                                className="btn-entrar"
                                id="btn-entrar"
                            >
                                Entrar
                            </Link>

                            <Link
                                to="/Cadastro"
                                className="btn-criar-conta"
                                id="btn-criar-conta"
                            >
                                Criar conta
                                <i className="ph ph-user"></i>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* =====================================================
                MENU DO CELULAR (gaveta que abre pela esquerda)
            ===================================================== */}

            {/* Sempre na página; só aparece com a classe "aberto" */}
                <div
                    className={menuCelularAberto ? "menu-celular-fundo aberto" : "menu-celular-fundo"}
                    onClick={fecharMenuCelular}
                >
                    <aside
                        className="menu-celular"
                        aria-hidden={!menuCelularAberto}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="menu-celular-topo">
                            <span className="menu-celular-titulo">AnimeSpot</span>

                            <button
                                type="button"
                                className="menu-celular-fechar"
                                onClick={fecharMenuCelular}
                                aria-label="Fechar menu"
                            >
                                <i className="ph ph-x"></i>
                            </button>
                        </div>

                        <nav className="menu-celular-links">
                            {LINKS_MENU_CELULAR.map((item) => (
                                <Link
                                    key={item.rota}
                                    to={item.rota}
                                    className="menu-celular-link"
                                    onClick={fecharMenuCelular}
                                >
                                    <i className={`ph ${item.icone}`}></i>
                                    <span>{item.texto}</span>

                                    {item.rota === "/Notificacoes" && naoLidas > 0 && (
                                        <span className="nav-notif-contador">{naoLidas}</span>
                                    )}
                                </Link>
                            ))}

                            {(tipoUsuario === "admin" || tipoUsuario === "moderador") && (
                                <Link
                                    to="/Denuncias"
                                    className="menu-celular-link"
                                    onClick={fecharMenuCelular}
                                >
                                    <i className="ph ph-shield-warning"></i>
                                    <span>Denúncias</span>
                                </Link>
                            )}
                        </nav>

                        <div className="menu-celular-rodape">
                            {usuarioLogado ? (
                                <>
                                    <Link
                                        to="/Perfil"
                                        className="menu-celular-link"
                                        onClick={fecharMenuCelular}
                                    >
                                        <i className="ph ph-user"></i>
                                        <span>Meu perfil</span>
                                    </Link>

                                    <button
                                        type="button"
                                        className="menu-celular-link menu-celular-sair"
                                        onClick={() => {
                                            fecharMenuCelular();
                                            sair();
                                        }}
                                    >
                                        <i className="ph ph-sign-out"></i>
                                        <span>Sair</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/Login"
                                        className="menu-celular-link"
                                        onClick={fecharMenuCelular}
                                    >
                                        <i className="ph ph-sign-in"></i>
                                        <span>Entrar</span>
                                    </Link>

                                    <Link
                                        to="/Cadastro"
                                        className="menu-celular-link"
                                        onClick={fecharMenuCelular}
                                    >
                                        <i className="ph ph-user-plus"></i>
                                        <span>Criar conta</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </aside>
                </div>

        </div>
    );
}

export default NavbarPesquisa;
