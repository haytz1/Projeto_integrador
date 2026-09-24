import React, { useState, useEffect } from 'react';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import '../css/perfil.css';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey);

// Inicialize o seu cliente Supabase (ou importe do seu arquivo de configuração)
const supabase = createClient( supabaseUrl , supabaseKey);

function Perfil() {
    // Estados para armazenar os dados do usuário e o controle de upload
    const [userId, setUserId] = useState(null);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [registro, setRegistro] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [carregando, setCarregando] = useState(false);

    // 1. Buscar os dados do usuário logado ao carregar a página
    useEffect(() => {
        async function carregarDadosDoUsuario() {
            try {
                // Exemplo usando Supabase Auth para identificar quem está logado
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Busca os dados na sua tabela 'usuarios' usando o e-mail do Auth
                    const { data: dadosUsuario, error } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('email', user.email)
                        .single();

                    if (error) throw error;

                    if (dadosUsuario) {
                        setUserId(dadosUsuario.id);
                        setNome(dadosUsuario.username);
                        setEmail(dadosUsuario.email);
                        setRegistro(new Date(dadosUsuario.registro).toLocaleDateString('pt-BR'));
                        setFotoUrl(dadosUsuario.foto); // Carrega a foto salva no banco
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error.message);
            }
        }

        carregarDadosDoUsuario();
    }, []);

    // 2. Função disparada quando o usuário seleciona uma nova foto
    const handleFileChange = async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo || !userId) return;

        setCarregando(true);

        try {
            // Nome único para o arquivo
            const fileExt = arquivo.name.split('.').pop();
            const nomeDoArquivo = `${userId}_${Date.now()}.${fileExt}`;

            // Envia para o storage 'avatars_usuarios'
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars_usuarios')
                .upload(nomeDoArquivo, arquivo);

            if (uploadError) throw uploadError;

            // Pega a URL pública
            const { data: urlData } = supabase.storage
                .from('avatars_usuarios')
                .getPublicUrl(uploadData.path);

            const linkDaFoto = urlData.publicUrl;

            // Atualiza a coluna 'foto' na tabela 'usuarios'
            const { error: dbError } = await supabase
                .from('usuarios')
                .update({ foto: linkDaFoto })
                .eq('id', userId);

            if (dbError) throw dbError;

            // Atualiza o estado visualmente na hora
            setFotoUrl(linkDaFoto);
            alert('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            console.error('Erro no upload:', error.message);
            alert('Não foi possível atualizar a foto.');
        } finally {
            setCarregando(false);
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

                                {/* Input de arquivo invisível acionado pelo botão */}
                                <input 
                                    type="file" 
                                    id="fileInput" 
                                    style={{ display: 'none' }} 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />
                                <label htmlFor="fileInput" className="edit-photo-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="ph ph-pencil-simple"></i> {carregando ? 'Enviando...' : 'Editar foto'}
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

                    <section className="preferences-section">

                        <h2 className="section-title">Preferências de animes</h2>

                        <p className="section-subtitle">Personalize sua experiência no site</p>



                        <div className="prefs-grid">



                            <div className="pref-col">

                                <h3 className="pref-title">Animes favoritos</h3>

                                <p className="pref-desc">Adicione os animes que você mais gosta.</p>

                                <div className="tags-container">

                                    <span className="tag">Naruto <button className="tag-remove">&times;</button></span>

                                    <span className="tag">One Piece <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Attack on Titan <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Haikyuu <button className="tag-remove">&times;</button></span>

                                </div>

                                <button className="btn-add">+ Adicionar</button>

                            </div>



                            <div className="pref-col">

                                <h3 className="pref-title">Gêneros favoritos</h3>

                                <p className="pref-desc">Selecione seus gêneros favoritos.</p>

                                <div className="tags-container">

                                    <span className="tag">Ação <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Aventura <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Drama <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Fantasia <button className="tag-remove">&times;</button></span>

                                </div>

                                <button className="btn-add">+ Adicionar</button>

                            </div>



                            <div className="pref-col">

                                <h3 className="pref-title">Tags de interesse</h3>

                                <p className="pref-desc">Escolha as tags que mais te interessam.</p>

                                <div className="tags-container">

                                    <span className="tag">Shounen <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Séries longas <button className="tag-remove">&times;</button></span>

                                    <span className="tag">Mundos fantásticos <button className="tag-remove">&times;</button></span>

                                </div>

                                <button className="btn-add">+ Adicionar</button>

                            </div>



                        </div>

                    </section>





                    <section className="security-section">

                        <h2 className="section-title"><i className="ph ph-shield-check"></i> Segurança da conta</h2>

                        <p className="pref-desc" style={{ marginBottom: 0 }}>Mantenha sua conta segura.</p>



                        <div className="sec-buttons">

                            <button className="btn-sec btn-password">

                                <i className="ph ph-lock-key"></i> Alterar Senha

                            </button>

                            <button className="btn-sec btn-logout">

                                <i className="ph ph-door-open"></i> Sair da conta

                            </button>

                        </div>

                    </section>





                    <footer className="actions-footer">

                        <button className="btn-action btn-cancel">Cancelar</button>

                        <button className="btn-action btn-save">Salvar alterações</button>

                    </footer>



               
                    
                </div>
            </main>
        </>
    );
}

export default Perfil;