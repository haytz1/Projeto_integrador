import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Navbar.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient( supabaseUrl, supabaseKey )

function NavbarPesquisa() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function verificarSessao() {
            // Verifica se há um e-mail salvo no localStorage (ou ajuste para o seu método de login)
            const emailSalvo = localStorage.getItem('usuario_email');

            if (emailSalvo) {
                setUsuarioLogado(emailSalvo);

                // Opcional: Buscar a foto atualizada do banco para exibir na Navbar
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
                <div className="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <Link to="/" className="nav-logo-text">AnimeSpot</Link>
                </div>

                <div className="nav-center">
                    <div className="search-bar">
                        <i className="ph ph-magnifying-glass"></i>
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="Buscar animes, mangás, notícias..."
                            aria-label="Buscar conteúdo"
                        />
                    </div>
                </div>

                <div className="nav-right">
                    {/* Condicional: Se estiver logado mostra o avatar, senão mostra os botões de Entrar/Criar conta */}
                    {usuarioLogado ? (
                        <Link to="/Perfil" className="nav-profile-link" title="Ir para o perfil">
                            <div className="nav-avatar-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccc' }}>
                                {fotoPerfil ? (
                                    <img src={fotoPerfil} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <i className="ph ph-user" style={{ fontSize: '20px', color: '#333' }}></i>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <div className="nav-auth-buttons" style={{ display: 'flex', gap: '10px' }}>
                            <Link to="/Login" className="btn-entrar" id="btn-entrar">Entrar</Link>
                            <Link to="/Cadastro" className="btn-criar-conta" id="btn-criar-conta">
                                Criar conta <i className="ph ph-user"></i>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
     );
}

export default NavbarPesquisa;