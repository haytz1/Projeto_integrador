import React, { useState, useEffect } from 'react';
import '../css/perfil.css';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import NavbarPesquisa from '../components/Navbar_pesquisa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function Perfil() {
    const [userId, setUserId] = useState(null);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [registro, setRegistro] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [plano, setPlano] = useState('');
    const [carregandoUpload, setCarregandoUpload] = useState(false);

    // Estados para os posts do usuário
    const [meusPosts, setMeusPosts] = useState([]);
    const [carregandoPosts, setCarregandoPosts] = useState(true);

    const [activeTab, setActiveTab] = useState('perfil');

    const navigate = useNavigate();

    useEffect(() => {
        async function buscarDadosDoBanco() {
            try {
                const emailSalvo = localStorage.getItem('usuario_email');

                if (!emailSalvo) {
                    navigate('/Login');
                    return;
                }

                // 1. Busca dados do usuário pelo e-mail
                const { data: dadosUsuario, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('email', emailSalvo)
                    .single();

                if (error) throw error;

                if (dadosUsuario) {
                    const idDoUsuario = dadosUsuario.id;
                    setUserId(idDoUsuario);
                    setNome(dadosUsuario.username);
                    setEmail(dadosUsuario.email);

                    if (dadosUsuario.registro) {
                        setRegistro(new Date(dadosUsuario.registro).toLocaleDateString('pt-BR'));
                    }

                    setFotoUrl(dadosUsuario.foto);
                    setPlano(dadosUsuario.plano || 'Gratuito');

                    // 2. Busca os posts criados por este usuário utilizando o ID obtido
                    const { data: dadosPosts, error: erroPosts } = await supabase
                        .from('postagens')
                        .select('*')
                        .eq('id_usuario', idDoUsuario)
                        .order('criado_em', { ascending: false });

                    if (erroPosts) throw erroPosts;
                    setMeusPosts(dadosPosts || []);
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário/posts:', error.message);
            } finally {
                setCarregandoPosts(false);
            }
        }

        buscarDadosDoBanco();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_id');
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
                <div className="profile-layout">
                    {/* SIDEBAR SEPARADA */}
                    <aside className="profile-sidebar">
                        <nav className="sidebar-nav">
                            <button 
                                className={`sidebar-link ${activeTab === 'perfil' ? 'active' : ''}`}
                                onClick={() => setActiveTab('perfil')}
                            >
                                <i className="ph-fill ph-user"></i> Meu Perfil
                            </button>
                            <button 
                                className={`sidebar-link ${activeTab === 'configuracoes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('configuracoes')}
                            >
                                <i className="ph ph-gear"></i> Configurações
                            </button>
                            <button className="sidebar-link" onClick={handleLogout}>
                                <i className="ph ph-sign-out"></i> Sair
                            </button>
                        </nav>
                        <div className="sidebar-art"></div>
                    </aside>

                    {/* CONTEÚDO PRINCIPAL */}
                    <div className="profile-container">
                        {activeTab === 'perfil' && (
                            <>
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
                                    <h2 className="section-title">Perfil de usuário</h2>
                                    <div className="info-item">
                                        <i className="ph-fill ph-user info-icon"></i>
                                        <div>
                                            <span className="info-label">NOME DO USUÁRIO</span>
                                            <span className="info-value">@{nome || 'Carregando...'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="ph-fill ph-envelope-simple info-icon"></i>
                                        <div>
                                            <span className="info-label">E-MAIL</span>
                                            <span className="info-value">{email || 'Carregando...'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="ph-fill ph-calendar-blank info-icon"></i>
                                        <div>
                                            <span className="info-label">DATA DE CADASTRO</span>
                                            <span className="info-value">{registro || 'Carregando...'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="plan-section">
                                <h2 className="plan-title"><i className="ph-fill ph-crown"></i> Plano atual</h2>
                                <div className="plan-badge">
                                    <i className="ph-fill ph-coin"></i> {plano || 'Gratuito'}
                                </div>
                                <p className="plan-desc">Aproveite os recursos mais populares da nossa site.</p>
                                <Link to="/Planos" className="plan-link">Ver planos</Link>
                            </section>
                        </div>
                        
                        <section className="preferences-section">
                            <h2 className="section-title"><i className="ph-fill ph-star"></i> Preferências de animes</h2>
                            <p className="section-subtitle">Personalize suas experiências no site.</p>

                            <div className="prefs-grid">
                                <div className="pref-col">
                                    <i className="ph-fill ph-heart pref-icon" style={{ color: '#c084fc' }}></i>
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
                                    <i className="ph-fill ph-star pref-icon" style={{ color: '#c084fc' }}></i>
                                    <h3 className="pref-title">Gêneros favoritos</h3>
                                    <p className="pref-desc">Escolha os gêneros que você mais gosta.</p>
                                    <div className="tags-container">
                                        <span className="tag">Ação <button className="tag-remove">&times;</button></span>
                                        <span className="tag">Aventura <button className="tag-remove">&times;</button></span>
                                        <span className="tag">Drama <button className="tag-remove">&times;</button></span>
                                        <span className="tag">Fantasia <button className="tag-remove">&times;</button></span>
                                    </div>
                                    <button className="btn-add">+ Adicionar</button>
                                </div>

                                <div className="pref-col">
                                    <i className="ph-fill ph-tag pref-icon" style={{ color: '#c084fc' }}></i>
                                    <h3 className="pref-title">Tags de interesse</h3>
                                    <p className="pref-desc">Escolha as tags que mais te interessam.</p>
                                    <div className="tags-container">
                                        <span className="tag">Shounen <button className="tag-remove">&times;</button></span>
                                        <span className="tag">Seinen <button className="tag-remove">&times;</button></span>
                                        <span className="tag">Slice of Life <button className="tag-remove">&times;</button></span>
                                        <span className="tag">Comédia <button className="tag-remove">&times;</button></span>
                                    </div>
                                    <button className="btn-add">+ Adicionar</button>
                                </div>
                            </div>
                        </section>

                        <div className="meus-posts-secao">
                            <h2 className="section-title"><i className="ph-fill ph-article"></i> Minhas Publicações</h2>

                            {carregandoPosts ? (
                                <p style={{ color: '#a1a1aa', textAlign: 'center' }}>Carregando publicações...</p>
                            ) : (
                                <div className="meus-posts-grid">
                                    {meusPosts.length > 0 ? (
                                        meusPosts.map((post) => (
                                            <div key={post.id} className="meu-post-card">
                                                {post.imagem && (
                                                    <div 
                                                        className="meu-post-imagem" 
                                                        style={{ backgroundImage: `url(${post.imagem})` }} 
                                                    />
                                                )}
                                                <h4 className="meu-post-titulo-card">{post.titulo}</h4>
                                                <p className="meu-post-conteudo">
                                                    {post.conteudo.length > 70 
                                                        ? post.conteudo.substring(0, 70) + '...' 
                                                        : post.conteudo}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="post-mockup-col">
                                                <div className="mockup-header">
                                                    <i className="ph-fill ph-image"></i>
                                                    <div>
                                                        <h4>Destaque da obra</h4>
                                                        <p>Escolha ou apresente elementos que chamam bastante atenção da sua obra.</p>
                                                    </div>
                                                </div>
                                                <div className="mockup-img-placeholder">
                                                    <div className="mockup-circle"></div>
                                                    <div className="mockup-mountain"></div>
                                                </div>
                                                <button className="btn-upload-mockup">Escolher imagem</button>
                                            </div>
                                            <div className="post-mockup-col">
                                                <div className="mockup-header">
                                                    <i className="ph-fill ph-sparkle"></i>
                                                    <div>
                                                        <h4>Reflexões sobre a obra</h4>
                                                        <p>Uma reflexão sobre os elementos, personagens e os significados desta obra.</p>
                                                    </div>
                                                </div>
                                                <textarea className="mockup-textarea" placeholder="Escreva aqui sua reflexão..."></textarea>
                                            </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'configuracoes' && (
                            <div className="settings-container">
                                <div className="settings-section card-bg">
                                    <h2 className="section-title"><i className="ph-fill ph-user-list"></i> Dados Pessoais</h2>
                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Nome e foto</h4>
                                                <p>Atualize seu nome de exibição e imagem de perfil.</p>
                                            </div>
                                            <button className="settings-btn">Editar</button>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>E-mail e telefone</h4>
                                                <p>Gerencie suas informações de contato.</p>
                                            </div>
                                            <button className="settings-btn">Editar</button>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Data de nascimento</h4>
                                                <p>Atualize a data do seu nascimento.</p>
                                            </div>
                                            <button className="settings-btn">Editar</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section card-bg">
                                    <h2 className="section-title"><i className="ph-fill ph-lock-key"></i> Segurança</h2>
                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Senha de acesso</h4>
                                                <p>Altere sua senha de login atual.</p>
                                            </div>
                                            <button className="settings-btn">Mudar senha</button>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Confirmação em duas etapas</h4>
                                                <p>Adicione uma camada extra de segurança.</p>
                                            </div>
                                            <button className="settings-btn">Ativar</button>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Dispositivos conectados</h4>
                                                <p>Gerencie as sessões ativas na sua conta.</p>
                                            </div>
                                            <button className="settings-btn">Visualizar</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section card-bg">
                                    <h2 className="section-title"><i className="ph-fill ph-gear"></i> Preferências</h2>
                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Idioma e região</h4>
                                                <p>Personalize o idioma da interface.</p>
                                            </div>
                                            <button className="settings-btn">Alterar</button>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Tema visual</h4>
                                                <p>Alterne entre o tema escuro e claro.</p>
                                            </div>
                                            <button className="settings-btn">Ajustar</button>
                                        </div>
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Notificações</h4>
                                                <p>Escolha o que deseja receber por e-mail.</p>
                                            </div>
                                            <button className="settings-btn">Configurar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </main>
        </>
    );
}

export default Perfil;