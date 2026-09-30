import React, { useState, useEffect, useRef } from "react";

import { Link } from "react-router-dom";

import { createClient } from "@supabase/supabase-js";

import "./Navbar_pesquisa.css";

import BarraPesquisa from "./BarraPesquisa";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function NavbarPesquisa() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    const [fotoPerfil, setFotoPerfil] = useState("");

    const [menuAberto, setMenuAberto] = useState(false);

    const menuRef = useRef(null);

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
                    .select("foto")
                    .eq("email", emailSalvo)
                    .single();

                if (data && data.foto) {
                    setFotoPerfil(data.foto);
                }
            }
        }

        verificarSessao();
    }, []);

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

    return (
        <div>
            <nav className="navbar">
                {/* =====================================================
                    LOGO
                ===================================================== */}

                <div className="nav-left">
                    <img
                        src="/logo_animespot.png"
                        alt="Logo AnimeSpot"
                        className="nav-logo-img"
                    />

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
                                        DIVISÓRIA
                                    ================================================= */}

                                    <div className="profile-dropdown-divider"></div>

                                    {/* =================================================
                                        SAIR
                                    ================================================= */}

                                    <button
                                        type="button"
                                        className="profile-dropdown-item profile-logout"
                                        onClick={() => {
                                            localStorage.removeItem(
                                                "usuario_email",
                                            );

                                            setUsuarioLogado(null);

                                            setFotoPerfil("");

                                            setMenuAberto(false);
                                        }}
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
        </div>
    );
}

export default NavbarPesquisa;
