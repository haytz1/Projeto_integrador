import React, { useState, useEffect } from 'react';
import '../css/perfil.css';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importe o useNavigate
import { createClient } from '@supabase/supabase-js';
import NavbarPesquisa from '../components/Navbar_pesquisa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey)

function Perfil() {
    const [userId, setUserId] = useState(null);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [registro, setRegistro] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [carregandoUpload, setCarregandoUpload] = useState(false);

    const navigate = useNavigate(); // 2. Inicialize o hook de navegação

    useEffect(() => {
        async function buscarDadosDoBanco() {
            try {
                // Pega o e-mail que salvamos no localStorage durante o login
                const emailSalvo = localStorage.getItem('usuario_email');

                if (!emailSalvo) {
                    navigate('/Login'); // Se não estiver logado, manda pro login
                    return;
                }

                const { data: dadosUsuario, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('email', emailSalvo)
                    .single();

                if (error) throw error;

                if (dadosUsuario) {
                    setUserId(dadosUsuario.id);
                    setNome(dadosUsuario.username);
                    setEmail(dadosUsuario.email);

                    if (dadosUsuario.registro) {
                        setRegistro(new Date(dadosUsuario.registro).toLocaleDateString('pt-BR'));
                    }

                    setFotoUrl(dadosUsuario.foto);
                }
            } catch (error) {
                console.error('Erro ao buscar usuário:', error.message);
            }
        }

        buscarDadosDoBanco();
    }, [navigate]);

    // 3. FUNÇÃO DE SAIR DA CONTA
    const handleLogout = () => {
        // Remove os dados salvos no navegador
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_id');

        // Redireciona o usuário para a tela de login
        navigate('/Login');
    };

    const handleFileChange = async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo || !userId) return;

        setCarregandoUpload(true);

        try {
            const fileExt = arquivo.name.split('.').pop();
            const nomeDoArquivo = `${userId}_${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars_usuarios')
                .upload(nomeDoArquivo, arquivo);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars_usuarios')
                .getPublicUrl(uploadData.path);

            const linkDaFoto = urlData.publicUrl;

            const { error: dbError } = await supabase
                .from('usuarios')
                .update({ foto: linkDaFoto })
                .eq('id', userId);

            if (dbError) throw dbError;

            setFotoUrl(linkDaFoto);
            alert('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            console.error('Erro no upload:', error.message);
            alert('Não foi possível atualizar a foto.');
        } finally {
            setCarregandoUpload(false);
        }
    };

    return (
        <>
            <NavbarPesquisa />

            <main className="page-wrapper">
                <div className="profile-container">
                    <div className="profile-header-row">

                        <section className="user-info-section">
                            <div className="avatar-col">
                                <div className="avatar-circle" style={{ overflow: 'hidden' }}>
                                    {fotoUrl ? (
                                        <img src={fotoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="ph ph-user"></i>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="fileInput" className="edit-photo-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="ph ph-pencil-simple"></i> {carregandoUpload ? 'Enviando...' : 'Editar foto'}
                                </label>
                            </div>

                            <div className="info-col">
                                <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Perfil de usuário</h2>
                                <div className="info-item">
                                    <span className="info-label">Nome do usuario:</span>
                                    <span className="info-value">@{nome || 'Carregando...'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">E-mail:</span>
                                    <span className="info-value">{email || 'Carregando...'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Data de cadastro:</span>
                                    <span className="info-value">{registro || 'Carregando...'}</span>
                                </div>
                            </div>
                        </section>

                        <section className="plan-section">
                            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Plano atual</h2>
                            <div className="plan-coins">
                                <i className="ph-fill ph-coin"></i>
                                <i className="ph-fill ph-coin"></i>
                            </div>
                            <div className="plan-name">Plano 1</div>
                            <p className="plan-desc">Aproveite os recursos mais populares do nosso site.</p>
                            <Link to="/Planos" className="plan-link">Ver planos</Link>
                        </section>

                    </div>

                    
                    <section class="preferences-section">
                        <h2 class="section-title">Preferências de animes</h2>
                        <p class="section-subtitle">Personalize sua experiência no site</p>

                        <div class="prefs-grid">

                            <div class="pref-col">
                                <h3 class="pref-title">Animes favoritos</h3>
                                <p class="pref-desc">Adicione os animes que você mais gosta.</p>
                                <div class="tags-container">
                                    <span class="tag">Naruto <button class="tag-remove">&times;</button></span>
                                    <span class="tag">One Piece <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Attack on Titan <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Haikyuu <button class="tag-remove">&times;</button></span>
                                </div>
                                <button class="btn-add">+ Adicionar</button>
                            </div>

                            <div class="pref-col">
                                <h3 class="pref-title">Gêneros favoritos</h3>
                                <p class="pref-desc">Selecione seus gêneros favoritos.</p>
                                <div class="tags-container">
                                    <span class="tag">Ação <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Aventura <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Drama <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Fantasia <button class="tag-remove">&times;</button></span>
                                </div>
                                <button class="btn-add">+ Adicionar</button>
                            </div>

                            <div class="pref-col">
                                <h3 class="pref-title">Tags de interesse</h3>
                                <p class="pref-desc">Escolha as tags que mais te interessam.</p>
                                <div class="tags-container">
                                    <span class="tag">Shounen <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Séries longas <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Mundos fantásticos <button class="tag-remove">&times;</button></span>
                                </div>
                                <button class="btn-add">+ Adicionar</button>
                            </div>

                        </div>
                    </section>

                    {/* Seção de Segurança com o Botão de Logout Funcional */}
                    <section className="security-section">
                        <h2 className="section-title"><i className="ph ph-shield-check"></i> Segurança da conta</h2>
                        <p className="pref-desc" style={{ marginBottom: 0 }}>Mantenha sua conta segura.</p>

                        <div className="sec-buttons">
                            <button className="btn-sec btn-password">
                                <i className="ph ph-lock-key"></i> Alterar Senha
                            </button>
                            {/* 4. ADICIONADO O onClick AQUI */}
                            <button className="btn-sec btn-logout" onClick={handleLogout}>
                                <i className="ph ph-door-open"></i> Sair da conta
                            </button>
                        </div>
                    </section>

                </div>
            </main>
        </>
    );
}

export default Perfil;