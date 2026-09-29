import React, { useEffect, useState } from 'react';

import '../css/perfil.css';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { createClient } from '@supabase/supabase-js';

import NavbarPesquisa from '../components/Navbar_pesquisa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

function Perfil() {
    const [userId, setUserId] = useState(null);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [registro, setRegistro] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [plano, setPlano] = useState('');
    const [moedas, setMoedas] = useState(0);

    const [carregandoUpload, setCarregandoUpload] = useState(false);

    const [meusPosts, setMeusPosts] = useState([]);
    const [carregandoPosts, setCarregandoPosts] = useState(true);

    const [minhasObras, setMinhasObras] = useState([]);
    const [carregandoObras, setCarregandoObras] = useState(true);

    const [novoTitulo, setNovoTitulo] = useState('');
    const [novoConteudo, setNovoConteudo] = useState('');
    const [novaImagem, setNovaImagem] = useState('');
    const [publicando, setPublicando] = useState(false);

    const [activeTab, setActiveTab] = useState('perfil');

    const navigate = useNavigate();

    const { id: routeId } = useParams();

    const isMeuPerfil =
        !routeId || routeId === localStorage.getItem('usuario_id');

    useEffect(() => {
        async function buscarDadosDoBanco() {
            try {

                let query = supabase
                    .from('usuarios')
                    .select('*');

                if (routeId) {

                    query = query.eq('id', routeId);

                } else {
                    const emailSalvo = localStorage.getItem('usuario_email');

                    if (!emailSalvo) {

                        navigate('/Login');

                        return;
                    }

                    query = query.eq('email', emailSalvo);
                }

                const { data: dadosUsuario, error } = await query.single();

                if (error) {
                    throw error;
                }

                if (dadosUsuario) {
                    const idDoUsuario = dadosUsuario.id;

                    setUserId(idDoUsuario);
                    setNome(dadosUsuario.username);
                    setEmail(dadosUsuario.email);

                    if (dadosUsuario.registro) {
                        setRegistro(
                            new Date(
                                dadosUsuario.registro
                            ).toLocaleDateString(
                                'pt-BR'
                            )
                        );
                    }

                    setFotoUrl(dadosUsuario.foto);
                    setPlano(dadosUsuario.plano || 'Gratuito');
                    setMoedas(dadosUsuario.moedas || 0);

                    // Busca as publicações do usuário
                    const {
                        data: dadosPosts,
                        error: erroPosts
                    } = await supabase
                        .from('postagens')
                        .select('*')
                        .eq(
                            'id_usuario',
                            idDoUsuario
                        )
                        .order(
                            'criado_em',
                            {
                                ascending: false
                            }
                        );

                    if (erroPosts) {
                        throw erroPosts;
                    }

                    setMeusPosts(dadosPosts || []);
                }
            } catch (error) {
                console.error(
                    'Erro ao buscar dados do usuário/posts:',
                    error.message
                );
            } finally {
                setCarregandoPosts(false);
            }
        }

        buscarDadosDoBanco();
    }, [navigate, routeId]);

    const handleLogout = () => {
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('username');

        navigate('/Login');
    };

    // Upload da foto de perfil
    const handleFileChange = async (e) => {
        const arquivo = e.target.files[0];

        if (!arquivo || !userId) {
            return;
        }

        setCarregandoUpload(true);

        try {
            const fileExt = arquivo.name.split('.').pop();

            const nomeDoArquivo = `${userId}_${Date.now()}.${fileExt}`;

            const {
                data: uploadData,
                error: uploadError
            } = await supabase.storage
                .from('avatars_usuarios')
                .upload(
                    nomeDoArquivo,
                    arquivo
                );

            if (uploadError) {
                throw uploadError;
            }

            const { data: urlData } =
                supabase.storage
                    .from('avatars_usuarios')
                    .getPublicUrl(
                        uploadData.path
                    );

            const linkDaFoto = urlData.publicUrl;

            const { error: dbError } = await supabase
                .from('usuarios')
                .update({
                    foto: linkDaFoto
                })
                .eq(
                    'id',
                    userId
                );

            if (dbError) {
                throw dbError;
            }

            setFotoUrl(
                linkDaFoto
            );

            alert('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            console.error('Erro no upload:', error.message);

            alert('Não foi possível atualizar a foto.');
        } finally {
            setCarregandoUpload(false);
        }
    };

    // Criar uma nova publicação
    const handlePublicar = async () => {
        if (!userId) {
            alert('Usuário não encontrado.');
            return;
        }

        if (!novoTitulo.trim() || !novoConteudo.trim()) {
            alert(
                'Preencha o título e o conteúdo da publicação.'
            );
            return;
        }

        setPublicando(true);

        try {
            const {
                data,
                error
            } = await supabase
                .from('postagens')
                .insert([
                    {
                        id_usuario:
                            userId,

                        titulo:
                            novoTitulo.trim(),

                        conteudo:
                            novoConteudo.trim(),

                        imagem:
                            linkImagem
                    }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            setMeusPosts(
                (postsAtuais) => [
                    data,
                    ...postsAtuais
                ]
            );

            // Limpa o formulário
            setNovoTitulo('');
            setNovoConteudo('');
            setNovaImagem('');

            alert('Publicação criada com sucesso!');
        } catch (error) {
            console.error('Erro ao publicar:', error);

            alert(
                'Não foi possível criar a publicação.'
            );
        } finally {
            setPublicando(false);
        }
    };

    return (
        <>
            <NavbarPesquisa />

            <main className="page-wrapper">
                <div className="profile-layout">
                    {/* SIDEBAR */}
                    {isMeuPerfil && (
                        <aside className="profile-sidebar">
                            <nav className="sidebar-nav">
                                <button
                                    className={`sidebar-link ${
                                        activeTab === 'perfil'
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setActiveTab('perfil')
                                    }
                                >
                                    <i className="ph-fill ph-user"></i>
                                    Meu Perfil
                                </button>

                                <button
                                    className={`sidebar-link ${
                                        activeTab === 'configuracoes'
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setActiveTab('configuracoes')
                                    }
                                >
                                    <i className="ph ph-gear"></i>
                                    Configurações
                                </button>

                                <button
                                    className="sidebar-link"
                                    onClick={handleLogout}
                                >
                                    <i className="ph ph-sign-out"></i>
                                    Sair
                                </button>
                            </nav>

                            <div className="sidebar-art"></div>
                        </aside>
                    )}

                    {/* CONTEÚDO PRINCIPAL */}
                    <div className="profile-container">
                        {/* ========================= */}
                        {/* PERFIL */}
                        {/* ========================= */}

                        {activeTab === 'perfil' && (
                            <>
                                <div className="profile-header-row">
                                    {/* DADOS DO USUÁRIO */}
                                    <section className="user-info-section">
                                        <div className="avatar-col">
                                            <div
                                                className="avatar-circle"
                                                style={{
                                                    overflow:
                                                        'hidden'
                                                }}
                                            >
                                                {fotoUrl ? (
                                                    <img
                                                        src={fotoUrl}
                                                        alt="Avatar"
                                                        style={{
                                                            width:
                                                                '100%',

                                                            height:
                                                                '100%',

                                                            objectFit:
                                                                'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <i className="ph ph-user"></i>
                                                )}
                                            </div>

                                            {isMeuPerfil && (
                                                <>
                                                    <input
                                                        type="file"
                                                        id="fileInput"
                                                        style={{
                                                            display: 'none'
                                                        }}
                                                        accept="image/*"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />

                                                    <label
                                                        htmlFor="fileInput"
                                                        className="edit-photo-btn"
                                                        style={{
                                                            cursor: 'pointer',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center'
                                                        }}
                                                    >
                                                        <i className="ph ph-pencil-simple"></i>

                                                        {carregandoUpload
                                                            ? 'Enviando...'
                                                            : 'Editar foto'}
                                                    </label>
                                                </>
                                            )}
                                        </div>

                                        <div className="info-col">
                                            <h2 className="section-title">
                                                Perfil de usuário
                                            </h2>

                                            <div className="info-item">
                                                <i className="ph-fill ph-user info-icon"></i>

                                                <div>
                                                    <span className="info-label">
                                                        NOME DO USUÁRIO
                                                    </span>

                                                    <span className="info-value">
                                                        @{nome ||
                                                            'Carregando...'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-item">
                                                <i className="ph-fill ph-envelope-simple info-icon"></i>

                                                <div>
                                                    <span className="info-label">
                                                        E-MAIL
                                                    </span>

                                                    <span className="info-value">
                                                        {email ||
                                                            'Carregando...'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="info-item">
                                                <i className="ph-fill ph-calendar-blank info-icon"></i>

                                                <div>
                                                    <span className="info-label">
                                                        DATA DE CADASTRO
                                                    </span>

                                                    <span className="info-value">
                                                        {registro ||
                                                            'Carregando...'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* PLANO */}
                                    <section className="plan-section">
                                        <h2 className="plan-title">
                                            <i className="ph-fill ph-crown"></i>
                                            Plano atual
                                        </h2>

                                        <div className="plan-badge">
                                            <i className="ph-fill ph-coin"></i>
                                            {plano || 'Gratuito'}
                                        </div>

                                        <p className="plan-desc">
                                            Aproveite os recursos mais
                                            populares da nossa site.
                                        </p>

                                        <Link
                                            to="/Planos"
                                            className="plan-link"
                                        >
                                            Ver planos
                                        </Link>
                                    </section>

                                    {/* MOEDAS */}
                                    <section className="plan-section">
                                        <h2 className="plan-title">
                                            <i className="ph-fill ph-coins"></i>
                                            Minhas moedas
                                        </h2>

                                        <div className="plan-badge">
                                            <i className="ph-fill ph-coin"></i>
                                            {moedas} moedas
                                        </div>

                                        <p className="plan-desc">
                                            Você pode ter até 150 moedas.
                                        </p>

                                        <Link
                                            to="/Moedas"
                                            className="plan-link"
                                        >
                                            Comprar moedas
                                        </Link>
                                    </section>
                                </div>

                                {/* ========================= */}
                                {/* PREFERÊNCIAS */}
                                {/* ========================= */}

                                <section className="preferences-section">
                                    <h2 className="section-title">
                                        <i className="ph-fill ph-star"></i>
                                        Preferências de animes
                                    </h2>

                                    <p className="section-subtitle">
                                        Personalize suas experiências no site.
                                    </p>

                                    <div className="prefs-grid">
                                        {/* ANIMES FAVORITOS */}
                                        <div className="pref-col">
                                            <i
                                                className="ph-fill ph-heart pref-icon"
                                                style={{
                                                    color:
                                                        '#c084fc'
                                                }}
                                            ></i>

                                            <h3 className="pref-title">
                                                Animes favoritos
                                            </h3>

                                            <p className="pref-desc">
                                                Adicione os animes que você
                                                mais gosta.
                                            </p>

                                            <div className="tags-container">
                                                <span className="tag">
                                                    Naruto
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    One Piece
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Attack on Titan
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Haikyuu
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>
                                            </div>

                                            <button className="btn-add">
                                                + Adicionar
                                            </button>
                                        </div>

                                        {/* GÊNEROS */}
                                        <div className="pref-col">
                                            <i
                                                className="ph-fill ph-star pref-icon"
                                                style={{
                                                    color:
                                                        '#c084fc'
                                                }}
                                            ></i>

                                            <h3 className="pref-title">
                                                Gêneros favoritos
                                            </h3>

                                            <p className="pref-desc">
                                                Escolha os gêneros que você
                                                mais gosta.
                                            </p>

                                            <div className="tags-container">
                                                <span className="tag">
                                                    Ação
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Aventura
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Drama
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Fantasia
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>
                                            </div>

                                            <button className="btn-add">
                                                + Adicionar
                                            </button>
                                        </div>

                                        {/* TAGS */}
                                        <div className="pref-col">
                                            <i
                                                className="ph-fill ph-tag pref-icon"
                                                style={{
                                                    color:
                                                        '#c084fc'
                                                }}
                                            ></i>

                                            <h3 className="pref-title">
                                                Tags de interesse
                                            </h3>

                                            <p className="pref-desc">
                                                Escolha as tags que mais te
                                                interessam.
                                            </p>

                                            <div className="tags-container">
                                                <span className="tag">
                                                    Shounen
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Seinen
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Slice of Life
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>

                                                <span className="tag">
                                                    Comédia
                                                    <button className="tag-remove">
                                                        &times;
                                                    </button>
                                                </span>
                                            </div>

                                            <button className="btn-add">
                                                + Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {/* ========================= */}
                                {/* MINHAS PUBLICAÇÕES */}
                                {/* ========================= */}

                                <div className="meus-posts-secao">
                                    <h2 className="section-title">
                                        <i className="ph-fill ph-article"></i>

                                        {isMeuPerfil
                                            ? 'Minhas Publicações'
                                            : `Publicações de ${nome}`}
                                    </h2>

                                    <p className="section-subtitle">
                                        Compartilhe suas opiniões e fale sobre
                                        seus animes favoritos.
                                    </p>
                                    {/* FORMULÁRIO */}
                                    {isMeuPerfil && (
                                        <div className="criar-post-card">
                                            <h3>
                                                <i className="ph-fill ph-pencil-simple"></i>
                                                Criar publicação
                                            </h3>

                                            <input
                                                type="text"
                                                placeholder="Título da publicação"
                                                value={novoTitulo}
                                                onChange={(e) =>
                                                    setNovoTitulo(
                                                        e.target.value
                                                    )
                                                }
                                                className="post-input"
                                            />

                                            <input
                                                type="text"
                                                placeholder="URL da imagem (opcional)"
                                                value={novaImagem}
                                                onChange={(e) =>
                                                    setNovaImagem(
                                                        e.target.value
                                                    )
                                                }
                                                className="post-input"
                                            />

                                            <textarea
                                                placeholder="Escreva sua publicação..."
                                                value={novoConteudo}
                                                onChange={(e) =>
                                                    setNovoConteudo(
                                                        e.target.value
                                                    )
                                                }
                                                className="post-textarea"
                                            ></textarea>

                                            <button
                                                className="btn-publicar"
                                                onClick={handlePublicar}
                                                disabled={publicando}
                                            >
                                                <i className="ph-fill ph-paper-plane-tilt"></i>

                                                {publicando
                                                    ? 'Publicando...'
                                                    : 'Publicar'}
                                            </button>
                                        </div>
                                    )}

                                    {/* PUBLICAÇÕES */}
                                        </h3>

                                        {carregandoPosts ? (
                                            <p className="mensagem-post">
                                                Carregando publicações...
                                            </p>
                                        ) : meusPosts.length > 0 ? (
                                            <div className="meus-posts-grid">
                                                {meusPosts.map((post) => (
                                                    <div
                                                        key={post.id}
                                                        className="meu-post-card"
                                                    >
                                                        {post.imagem && (
                                                            <div
                                                                className="meu-post-imagem"
                                                                style={{
                                                                    backgroundImage:
                                                                        `url(${post.imagem})`
                                                                }}
                                                            />
                                                        )}

                                                        <div className="meu-post-conteudo-area">
                                                            <h4 className="meu-post-titulo-card">
                                                                {post.titulo}
                                                            </h4>

                                                            <p className="meu-post-conteudo">
                                                                {post.conteudo}
                                                            </p>

                                                            {post.criado_em && (
                                                                <small className="post-data">
                                                                    {new Date(
                                                                        post.criado_em
                                                                    ).toLocaleDateString(
                                                                        'pt-BR'
                                                                    )}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="sem-publicacoes">
                                                <i className="ph ph-article"></i>

                                                <h3>
                                                    {isMeuPerfil
                                                        ? 'Você ainda não publicou nada'
                                                        : `${nome} ainda não publicou nada`}
                                                </h3>

                                                <p>
                                                    {isMeuPerfil
                                                        ? 'Crie sua primeira publicação usando o formulário acima.'
                                                        : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ========================= */}
                        {/* CONFIGURAÇÕES */}
                        {/* ========================= */}

                        {activeTab === 'configuracoes' && (
                            <div className="settings-container">
                                {/* DADOS PESSOAIS */}
                                <div className="settings-section card-bg">
                                    <h2 className="section-title">
                                        <i className="ph-fill ph-user-list"></i>
                                        Dados Pessoais
                                    </h2>

                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Nome e foto</h4>

                                                <p>
                                                    Atualize seu nome de
                                                    exibição e imagem de
                                                    perfil.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>E-mail e telefone</h4>

                                                <p>
                                                    Gerencie suas informações
                                                    de contato.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Editar
                                            </button>
                                        </div>

                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>
                                                    Data de nascimento
                                                </h4>

                                                <p>
                                                    Atualize a data do seu
                                                    nascimento.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* SEGURANÇA */}
                                <div className="settings-section card-bg">
                                    <h2 className="section-title">
                                        <i className="ph-fill ph-lock-key"></i>
                                        Segurança
                                    </h2>

                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Senha de acesso</h4>

                                                <p>
                                                    Altere sua senha de login
                                                    atual.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Mudar senha
                                            </button>
                                        </div>

                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>
                                                    Confirmação em duas etapas
                                                </h4>

                                                <p>
                                                    Adicione uma camada extra
                                                    de segurança.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Ativar
                                            </button>
                                        </div>

                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>
                                                    Dispositivos conectados
                                                </h4>

                                                <p>
                                                    Gerencie as sessões ativas
                                                    na sua conta.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Visualizar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* PREFERÊNCIAS */}
                                <div className="settings-section card-bg">
                                    <h2 className="section-title">
                                        <i className="ph-fill ph-gear"></i>
                                        Preferências
                                    </h2>

                                    <div className="settings-group">
                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Idioma e região</h4>

                                                <p>
                                                    Personalize o idioma da
                                                    interface.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Alterar
                                            </button>
                                        </div>

                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Tema visual</h4>

                                                <p>
                                                    Alterne entre o tema
                                                    escuro e claro.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Ajustar
                                            </button>
                                        </div>

                                        <div className="settings-item">
                                            <div className="settings-item-info">
                                                <h4>Notificações</h4>

                                                <p>
                                                    Escolha o que deseja
                                                    receber por e-mail.
                                                </p>
                                            </div>

                                            <button className="settings-btn">
                                                Configurar
                                            </button>
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
