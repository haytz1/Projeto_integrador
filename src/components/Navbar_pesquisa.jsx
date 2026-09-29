import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import './Navbar.css';
import BarraPesquisa from './BarraPesquisa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function NavbarPesquisa() {

    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState('');

    useEffect(() => {

        async function verificarSessao() {

            const emailSalvo = localStorage.getItem('usuario_email');

            if (emailSalvo) {

                setUsuarioLogado(emailSalvo);

                const { data } = await supabase
                    .from('usuarios')
                    .select('foto')
                    .eq('email', emailSalvo)
                    .single();

                if (data && data.foto) {
                    setFotoPerfil(data.foto);
                }
            }
        }

        verificarSessao();

    }, []);

    return (

        <div>

            <nav className="navbar">

                {/* LOGO */}

                <div className="nav-left">

                    <img
                        src="/logo_animespot.png"
                        alt="Logo AnimeSpot"
                        className="nav-logo-img"
                    />

                    <Link
                        to="/"
                        className="nav-logo-text"
                    >
                        AnimeSpot
                    </Link>

                </div>


                {/* PESQUISA */}

                <div className="nav-center">

                    <BarraPesquisa />

                </div>


                {/* LOGIN / PERFIL */}

                <div className="nav-right">

                    {usuarioLogado ? (

                        <Link
                            to="/Perfil"
                            className="nav-profile-link"
                            title="Ir para o perfil"
                        >

                            <div
                                className="nav-avatar-circle"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#ccc'
                                }}
                            >

                                {fotoPerfil ? (

                                    <img
                                        src={fotoPerfil}
                                        alt="Perfil"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />

                                ) : (

                                    <i
                                        className="ph ph-user"
                                        style={{
                                            fontSize: '20px',
                                            color: '#333'
                                        }}
                                    ></i>

                                )}

                            </div>

                        </Link>

                    ) : (

                        <div
                            className="nav-auth-buttons"
                            style={{
                                display: 'flex',
                                gap: '10px'
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