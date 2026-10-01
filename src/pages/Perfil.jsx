import React, { useState, useEffect } from 'react';

import '../css/perfil.css';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { supabase } from '../../supabase';

import NavbarPesquisa from '../components/Navbar_pesquisa';

function Perfil() {

    const navigate = useNavigate();

    const { id: routeId } = useParams();

    // =========================================
    // DADOS DO USUÁRIO
    // =========================================

    const [userId, setUserId] = useState(null);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [registro, setRegistro] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [plano, setPlano] = useState('');
    const [moedas, setMoedas] = useState(0);

    const [carregandoUpload, setCarregandoUpload] = useState(false);

    // =========================================
    // PUBLICAÇÕES
    // =========================================

    const [meusPosts, setMeusPosts] = useState([]);
    const [carregandoPosts, setCarregandoPosts] = useState(true);

    const [novoTitulo, setNovoTitulo] = useState('');
    const [novoConteudo, setNovoConteudo] = useState('');
    const [novaImagem, setNovaImagem] = useState(null);
    const [previewImagem, setPreviewImagem] = useState('');
    const [publicando, setPublicando] = useState(false);

    // =========================================
    // MINHA LISTA
    // =========================================

    const [minhasObras, setMinhasObras] = useState([]);
    const [carregandoObras, setCarregandoObras] = useState(true);

    // =========================================
    // ABAS
    // =========================================

    const [activeTab, setActiveTab] = useState('perfil');

    // =========================================
    // EDITAR PERFIL
    // =========================================

    const [modalEditarPerfil, setModalEditarPerfil] = useState(false);
    const [nomeEditado, setNomeEditado] = useState('');
    const [novaFotoPerfil, setNovaFotoPerfil] = useState(null);
    const [previewFotoPerfil, setPreviewFotoPerfil] = useState('');
    const [salvandoPerfil, setSalvandoPerfil] = useState(false);

    // =========================================
    // PREFERÊNCIAS
    // =========================================

    const [categoriaAberta, setCategoriaAberta] = useState(null);
    const [buscaPreferencia, setBuscaPreferencia] = useState('');

    const [animesSelecionados, setAnimesSelecionados] = useState([]);

    const [generosSelecionados, setGenerosSelecionados] = useState([]);

    const [tagsSelecionadas, setTagsSelecionadas] = useState([]);

    const animesDisponiveis = [
        'Naruto',
        'One Piece',
        'Bleach',
        'Dragon Ball',
        'Jujutsu Kaisen',
        'Demon Slayer',
        'Attack on Titan',
        'Hunter x Hunter',
        'Death Note',
        'Fullmetal Alchemist',
        'My Hero Academia',
        'Tokyo Ghoul'
    ];

    const generosDisponiveis = [
        'Ação',
        'Aventura',
        'Comédia',
        'Drama',
        'Fantasia',
        'Romance',
        'Terror',
        'Ficção científica',
        'Mistério',
        'Esportes',
        'Escolar',
        'Isekai'
    ];

    const tagsDisponiveis = [
        'Shounen',
        'Seinen',
        'Slice of Life',
        'Isekai',
        'Escolar',
        'Comédia',
        'Romance',
        'Ação',
        'Aventura',
        'Fantasia',
        'Mistério',
        'Drama'
    ];

    // =========================================
    // VERIFICAR SE É MEU PERFIL
    // =========================================

    const isMeuPerfil =
        !routeId ||
        routeId === String(userId);

    // =========================================
    // FILTROS
    // =========================================

    const animesFiltrados = animesDisponiveis.filter(
        (anime) =>
            anime
                .toLowerCase()
                .includes(
                    buscaPreferencia.toLowerCase()
                )
    );

    const generosFiltrados = generosDisponiveis.filter(
        (genero) =>
            genero
                .toLowerCase()
                .includes(
                    buscaPreferencia.toLowerCase()
                )
    );

    const tagsFiltradas = tagsDisponiveis.filter(
        (tag) =>
            tag
                .toLowerCase()
                .includes(
                    buscaPreferencia.toLowerCase()
                )
    );

    // =========================================
    // BUSCAR USUÁRIO
    // =========================================

    useEffect(() => {

        async function buscarDadosDoBanco() {

            setCarregandoPosts(true);

            try {

                const { data: { user: usuarioLogado }, error: erroAuth } =
                    await supabase.auth.getUser();

                if (erroAuth || !usuarioLogado) {
                    console.error('Erro ao verificar usuário autenticado:', erroAuth);
                    navigate('/Login');
                    return;
                }

                // A identidade verdadeira vem do Supabase Auth.
                // Alterar localStorage ou o ID na URL não troca de conta.
                if (routeId && routeId !== String(usuarioLogado.id)) {
                    navigate('/Perfil', { replace: true });
                    return;
                }

                const { data: dadosUsuario, error } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('auth_id', usuarioLogado.id)
                    .maybeSingle();

                if (error) throw error;

                if (!dadosUsuario) {
                    throw new Error(
                        'Seu usuário foi autenticado, mas o perfil não foi encontrado na tabela usuarios.'
                    );
                }

                const idDoUsuario = dadosUsuario.id;
                setUserId(idDoUsuario);

                // localStorage é apenas auxiliar. Não é usado para autenticação.
                localStorage.setItem('usuario_id', String(idDoUsuario));
                localStorage.setItem('usuario_auth_id', String(usuarioLogado.id));
                localStorage.setItem('usuario_email', dadosUsuario.email || usuarioLogado.email || '');
                localStorage.setItem('usuario_username', dadosUsuario.username || '');

                setNome(dadosUsuario.username || '');
                setEmail(dadosUsuario.email || usuarioLogado.email || '');

                if (dadosUsuario.registro) {
                    setRegistro(new Date(dadosUsuario.registro).toLocaleDateString('pt-BR'));
                } else {
                    setRegistro('');
                }

                setFotoUrl(dadosUsuario.foto || '');

                let planoAtual = String(dadosUsuario.plano || 'Gratuito')
                    .replace(/['\"]/g, '')
                    .replace(/::text/gi, '')
                    .trim();

                if (planoAtual.toLowerCase() === 'gratuito') planoAtual = 'Gratuito';
                if (planoAtual.toLowerCase() === 'premium') planoAtual = 'Premium';

                setPlano(planoAtual);
                setMoedas(dadosUsuario.moedas || 0);

                // Preferências vêm do banco.
                setAnimesSelecionados(Array.isArray(dadosUsuario.animes_favoritos) ? dadosUsuario.animes_favoritos : []);
                setGenerosSelecionados(Array.isArray(dadosUsuario.generos_favoritos) ? dadosUsuario.generos_favoritos : []);
                setTagsSelecionadas(Array.isArray(dadosUsuario.tags_interesse) ? dadosUsuario.tags_interesse : []);

                const { data: dadosPosts, error: erroPosts } = await supabase
                    .from('postagens')
                    .select('*')
                    .eq('id_usuario', idDoUsuario)
                    .order('criado_em', { ascending: false });

                if (erroPosts) throw erroPosts;
                setMeusPosts(dadosPosts || []);

            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setCarregandoPosts(false);
            }
        }

        buscarDadosDoBanco();

    }, [navigate, routeId]);

    // =========================================
    // BUSCAR MINHA LISTA
    // =========================================

    useEffect(() => {

        async function buscarMinhaLista() {

            if (!userId) {
                return;
            }

            setCarregandoObras(true);

            try {

                const {
                    data: biblioteca,
                    error
                } = await supabase
                    .from('biblioteca')
                    .select('anime_id')
                    .eq(
                        'usuario_id',
                        userId
                    )
                    .order(
                        'criado_em',
                        {
                            ascending: false
                        }
                    );

                if (error) {
                    throw error;
                }

                if (
                    !biblioteca ||
                    biblioteca.length === 0
                ) {

                    setMinhasObras([]);

                    return;
                }

                const ids =
                    biblioteca.map(
                        (item) =>
                            item.anime_id
                    );

                const query = `
                    query ($ids: [Int]) {
                        Page(
                            page: 1,
                            perPage: 50
                        ) {
                            media(
                                id_in: $ids,
                                type: ANIME
                            ) {
                                id

                                title {
                                    romaji
                                    english
                                    native
                                }

                                coverImage {
                                    large
                                    extraLarge
                                }

                                startDate {
                                    year
                                }
                            }
                        }
                    }
                `;

                const resposta =
                    await fetch(
                        'https://graphql.anilist.co',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json',

                                'Accept':
                                    'application/json'
                            },

                            body: JSON.stringify({
                                query: query,

                                variables: {
                                    ids: ids
                                }
                            })
                        }
                    );

                const dados =
                    await resposta.json();

                if (
                    !resposta.ok ||
                    !dados.data ||
                    !dados.data.Page
                ) {

                    throw new Error(
                        'Não foi possível buscar as obras.'
                    );
                }

                const obras =
                    dados.data.Page.media ||
                    [];

                const obrasOrdenadas =
                    ids
                        .map(
                            (animeId) =>
                                obras.find(
                                    (obra) =>
                                        obra.id ===
                                        animeId
                                )
                        )
                        .filter(Boolean);

                setMinhasObras(
                    obrasOrdenadas
                );

            } catch (error) {

                console.error(
                    'Erro ao buscar minha lista:',
                    error
                );

                setMinhasObras([]);

            } finally {

                setCarregandoObras(
                    false
                );

            }
        }

        buscarMinhaLista();

    }, [userId]);

    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Erro ao sair:', error);
            alert('Erro ao sair da conta.');
            return;
        }

        localStorage.removeItem('usuario_id');
        localStorage.removeItem('usuario_auth_id');
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_username');

        navigate('/Login');
    };

    // =========================================
    // EDITAR FOTO DIRETO NO PERFIL
    // =========================================

    const handleFileChange = async (e) => {

        const arquivo =
            e.target.files[0];

        if (
            !arquivo ||
            !userId
        ) {
            return;
        }

        if (
            !arquivo.type.startsWith(
                'image/'
            )
        ) {

            alert(
                'Escolha apenas uma imagem.'
            );

            e.target.value = '';

            return;
        }

        if (
            arquivo.size >
            5 * 1024 * 1024
        ) {

            alert(
                'A imagem deve ter no máximo 5 MB.'
            );

            e.target.value = '';

            return;
        }

        setCarregandoUpload(true);

        try {

            const extensao =
                arquivo.name
                    .split('.')
                    .pop();

            const nomeDoArquivo =
                `${userId}_${Date.now()}.${extensao}`;

            const {
                data: uploadData,
                error: uploadError
            } = await supabase.storage
                .from(
                    'avatars_usuarios'
                )
                .upload(
                    nomeDoArquivo,
                    arquivo
                );

            if (uploadError) {

                throw new Error(
                    `Erro ao enviar a foto: ${uploadError.message}`
                );

            }

            const {
                data: urlData
            } = supabase.storage
                .from(
                    'avatars_usuarios'
                )
                .getPublicUrl(
                    uploadData.path
                );

            const linkDaFoto =
                urlData.publicUrl;

            const {
                error: dbError
            } = await supabase
                .from('usuarios')
                .update({
                    foto: linkDaFoto
                })
                .eq(
                    'id',
                    userId
                );

            if (dbError) {

                throw new Error(
                    `Erro ao atualizar a foto no banco: ${dbError.message}`
                );

            }

            setFotoUrl(
                linkDaFoto
            );

            alert(
                'Foto de perfil atualizada com sucesso!'
            );

        } catch (error) {

            console.error(
                'Erro ao atualizar foto:',
                error
            );

            alert(
                error.message
            );

        } finally {

            setCarregandoUpload(false);

            e.target.value = '';

        }
    };

    // =========================================
    // ABRIR EDITAR PERFIL
    // =========================================

    const abrirEditarPerfil = () => {

        setNomeEditado(
            nome
        );

        setNovaFotoPerfil(
            null
        );

        setPreviewFotoPerfil(
            ''
        );

        setModalEditarPerfil(
            true
        );
    };

    // =========================================
    // FECHAR EDITAR PERFIL
    // =========================================

    const fecharEditarPerfil = () => {

        if (salvandoPerfil) {
            return;
        }

        setModalEditarPerfil(
            false
        );

        setNomeEditado(
            ''
        );

        setNovaFotoPerfil(
            null
        );

        setPreviewFotoPerfil(
            ''
        );
    };

    // =========================================
    // NOVA FOTO NO MODAL
    // =========================================

    const handleNovaFotoPerfil = (e) => {

        const arquivo =
            e.target.files[0];

        if (!arquivo) {
            return;
        }

        if (
            !arquivo.type.startsWith(
                'image/'
            )
        ) {

            alert(
                'Escolha apenas uma imagem.'
            );

            e.target.value = '';

            return;
        }

        if (
            arquivo.size >
            5 * 1024 * 1024
        ) {

            alert(
                'A imagem deve ter no máximo 5 MB.'
            );

            e.target.value = '';

            return;
        }

        setNovaFotoPerfil(
            arquivo
        );

        const preview =
            URL.createObjectURL(
                arquivo
            );

        setPreviewFotoPerfil(
            preview
        );
    };

    // =========================================
    // SALVAR PERFIL
    // =========================================

    const salvarPerfil = async () => {

        if (!userId) {

            alert(
                'Usuário não encontrado.'
            );

            return;
        }

        if (!nomeEditado.trim()) {

            alert(
                'Digite um nome.'
            );

            return;
        }

        setSalvandoPerfil(true);

        try {

            let linkDaFoto =
                fotoUrl;

            if (novaFotoPerfil) {

                const extensao =
                    novaFotoPerfil.name
                        .split('.')
                        .pop();

                const nomeDoArquivo =
                    `${userId}_${Date.now()}.${extensao}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from(
                        'avatars_usuarios'
                    )
                    .upload(
                        nomeDoArquivo,
                        novaFotoPerfil
                    );

                if (uploadError) {

                    throw new Error(
                        `Erro ao enviar a foto: ${uploadError.message}`
                    );

                }

                const {
                    data: urlData
                } = supabase.storage
                    .from(
                        'avatars_usuarios'
                    )
                    .getPublicUrl(
                        uploadData.path
                    );

                linkDaFoto =
                    urlData.publicUrl;
            }

            const {
                error: erroUpdate
            } = await supabase
                .from('usuarios')
                .update({
                    username:
                        nomeEditado.trim(),

                    foto:
                        linkDaFoto
                })
                .eq(
                    'id',
                    userId
                );

            if (erroUpdate) {

                console.error(
                    'Erro do Supabase:',
                    erroUpdate
                );

                throw new Error(
                    `Erro ao salvar no banco: ${erroUpdate.message}`
                );

            }

            const novoNome =
                nomeEditado.trim();

            setNome(
                novoNome
            );

            setFotoUrl(
                linkDaFoto
            );

            setModalEditarPerfil(
                false
            );

            setNomeEditado('');

            setNovaFotoPerfil(
                null
            );

            setPreviewFotoPerfil(
                ''
            );

            alert(
                'Perfil atualizado com sucesso!'
            );

        } catch (error) {

            console.error(
                'Erro ao atualizar perfil:',
                error
            );

            alert(
                error.message ||
                'Não foi possível atualizar o perfil.'
            );

        } finally {

            setSalvandoPerfil(false);

        }
    };

    // =========================================
    // IMAGEM DA PUBLICAÇÃO
    // =========================================

    const handleImagemPublicacao = (e) => {

        const arquivo =
            e.target.files[0];

        if (!arquivo) {
            return;
        }

        if (
            !arquivo.type.startsWith(
                'image/'
            )
        ) {

            alert(
                'Escolha apenas arquivos de imagem.'
            );

            e.target.value = '';

            return;
        }

        if (
            arquivo.size >
            5 * 1024 * 1024
        ) {

            alert(
                'A imagem deve ter no máximo 5 MB.'
            );

            e.target.value = '';

            return;
        }

        setNovaImagem(
            arquivo
        );

        const imagemPreview =
            URL.createObjectURL(
                arquivo
            );

        setPreviewImagem(
            imagemPreview
        );
    };

    // =========================================
    // PUBLICAR
    // =========================================

    const handlePublicar = async () => {

        if (!userId) {

            alert(
                'Usuário não encontrado.'
            );

            return;
        }

        if (
            !novoTitulo.trim() ||
            !novoConteudo.trim()
        ) {

            alert(
                'Preencha o título e o conteúdo da publicação.'
            );

            return;
        }

        setPublicando(true);

        try {

            let linkImagem = null;

            if (novaImagem) {

                const extensao =
                    novaImagem.name
                        .split('.')
                        .pop();

                const nomeDoArquivo =
                    `${userId}_${Date.now()}.${extensao}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from(
                        'postagens'
                    )
                    .upload(
                        nomeDoArquivo,
                        novaImagem
                    );

                if (uploadError) {

                    throw new Error(
                        `Erro ao enviar imagem: ${uploadError.message}`
                    );

                }

                const {
                    data: urlData
                } = supabase.storage
                    .from(
                        'postagens'
                    )
                    .getPublicUrl(
                        uploadData.path
                    );

                linkImagem =
                    urlData.publicUrl;
            }

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

            setNovoTitulo('');

            setNovoConteudo('');

            setNovaImagem(
                null
            );

            setPreviewImagem('');

            alert(
                'Publicação criada com sucesso!'
            );

        } catch (error) {

            console.error(
                'Erro ao publicar:',
                error
            );

            alert(
                `Erro ao criar publicação: ${error.message}`
            );

        } finally {

            setPublicando(false);

        }
    };

    // =========================================
    // PREFERÊNCIAS
    // =========================================

    const alternarOpcao = async (opcao, categoria) => {

        if (!isMeuPerfil || !userId) return;

        let listaAtual = [];
        let colunaBanco = '';
        let atualizarEstado;

        if (categoria === 'animes') {
            listaAtual = animesSelecionados;
            colunaBanco = 'animes_favoritos';
            atualizarEstado = setAnimesSelecionados;
        } else if (categoria === 'generos') {
            listaAtual = generosSelecionados;
            colunaBanco = 'generos_favoritos';
            atualizarEstado = setGenerosSelecionados;
        } else if (categoria === 'tags') {
            listaAtual = tagsSelecionadas;
            colunaBanco = 'tags_interesse';
            atualizarEstado = setTagsSelecionadas;
        } else {
            return;
        }

        const novaLista = listaAtual.includes(opcao)
            ? listaAtual.filter((item) => item !== opcao)
            : [...listaAtual, opcao];

        atualizarEstado(novaLista);

        const { error } = await supabase
            .from('usuarios')
            .update({ [colunaBanco]: novaLista })
            .eq('id', userId);

        if (error) {
            console.error('Erro ao salvar preferência:', error);
            alert('Não foi possível salvar essa preferência no banco.');
        }
    };

    // =========================================
    // ABRIR CATEGORIA
    // =========================================

    const abrirCategoria = (
        categoria
    ) => {

        if (
            categoriaAberta ===
            categoria
        ) {

            setCategoriaAberta(
                null
            );

            setBuscaPreferencia('');

            return;
        }

        setCategoriaAberta(
            categoria
        );

        setBuscaPreferencia('');

    };

    // =========================================
    // FECHAR CATEGORIA
    // =========================================

    const fecharCategoria = () => {

        setCategoriaAberta(
            null
        );

        setBuscaPreferencia('');

    };

    // =========================================
    // RETURN
    // =========================================

    return (
        <>
            <NavbarPesquisa />

            <main className="page-wrapper">

                <div className="profile-layout">

                    {isMeuPerfil && (

                        <aside className="profile-sidebar">

                            <nav className="sidebar-nav">

                                <button
                                    type="button"
                                    className={`sidebar-link ${
                                        activeTab === 'perfil'
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setActiveTab(
                                            'perfil'
                                        )
                                    }
                                >

                                    <i className="ph-fill ph-user"></i>

                                    Meu Perfil

                                </button>


                                <button
                                    type="button"
                                    className={`sidebar-link ${
                                        activeTab === 'configuracoes'
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setActiveTab(
                                            'configuracoes'
                                        )
                                    }
                                >

                                    <i className="ph ph-gear"></i>

                                    Configurações

                                </button>


                                <button
                                    type="button"
                                    className="sidebar-link"
                                    onClick={
                                        handleLogout
                                    }
                                >

                                    <i className="ph ph-sign-out"></i>

                                    Sair

                                </button>

                            </nav>


                            <div className="sidebar-art"></div>

                        </aside>

                    )}


                    <div className="profile-container">

                        {activeTab === 'perfil' && (

                            <>

                                <div className="profile-header-row">

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
                                                        src={
                                                            fotoUrl
                                                        }
                                                        alt="Avatar"
                                                        style={{
                                                            width:
                                                                '100%',
                                                            height:
                                                                '100%',
                                                            objectFit:
                                                                'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                'none';
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
                                                            display:
                                                                'none'
                                                        }}
                                                        accept="image/*"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />


                                                    <label
                                                        htmlFor="fileInput"
                                                        className="edit-photo-btn"
                                                    >

                                                        <i className="ph ph-pencil-simple"></i>

                                                        {
                                                            carregandoUpload
                                                                ? 'Enviando...'
                                                                : 'Editar foto'
                                                        }

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
                                                        {
                                                            nome ||
                                                            'Carregando...'
                                                        }
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
                                                        {
                                                            email ||
                                                            'Carregando...'
                                                        }
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
                                                        {
                                                            registro ||
                                                            'Carregando...'
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </section>


                                    <section className="plan-section">

                                        <h2 className="plan-title">

                                            <i className="ph-fill ph-crown"></i>

                                            Plano atual

                                        </h2>


                                        <div className="plan-badge">

                                            <i className="ph-fill ph-coin"></i>

                                            {
                                                plano ||
                                                'Gratuito'
                                            }

                                        </div>


                                        <p className="plan-desc">
                                            Aproveite os recursos mais populares do nosso site.
                                        </p>


                                        <Link
                                            to="/Planos"
                                            className="plan-link"
                                        >
                                            Ver planos
                                        </Link>

                                    </section>


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
                                            Não há limite de moedas: compre e acumule à vontade!
                                        </p>


                                        <Link
                                            to="/Moedas"
                                            className="plan-link"
                                        >
                                            Comprar moedas
                                        </Link>

                                    </section>

                                </div>


                                {isMeuPerfil && (

                                    <section className="preferences-section">

                                        <h2 className="section-title">

                                            <i className="ph-fill ph-star"></i>

                                            Preferências de animes

                                        </h2>


                                        <p className="section-subtitle">
                                            Personalize sua experiência no site.
                                        </p>


                                        <div className="prefs-grid">

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
                                                    Adicione os animes que você mais gosta.
                                                </p>


                                                <div className="tags-container">

                                                    {animesSelecionados.map(
                                                        (anime) => (

                                                            <span
                                                                className="tag"
                                                                key={
                                                                    anime
                                                                }
                                                            >

                                                                {
                                                                    anime
                                                                }


                                                                <button
                                                                    type="button"
                                                                    className="tag-remove"
                                                                    onClick={() =>
                                                                        alternarOpcao(
                                                                            anime,
                                                                            'animes'
                                                                        )
                                                                    }
                                                                >
                                                                    &times;
                                                                </button>

                                                            </span>

                                                        )
                                                    )}

                                                </div>


                                                <button
                                                    type="button"
                                                    className="btn-add"
                                                    onClick={() =>
                                                        abrirCategoria(
                                                            'animes'
                                                        )
                                                    }
                                                >
                                                    + Adicionar
                                                </button>

                                            </div>


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
                                                    Escolha os gêneros que você mais gosta.
                                                </p>


                                                <div className="tags-container">

                                                    {generosSelecionados.map(
                                                        (genero) => (

                                                            <span
                                                                className="tag"
                                                                key={
                                                                    genero
                                                                }
                                                            >

                                                                {
                                                                    genero
                                                                }


                                                                <button
                                                                    type="button"
                                                                    className="tag-remove"
                                                                    onClick={() =>
                                                                        alternarOpcao(
                                                                            genero,
                                                                            'generos'
                                                                        )
                                                                    }
                                                                >
                                                                    &times;
                                                                </button>

                                                            </span>

                                                        )
                                                    )}

                                                </div>


                                                <button
                                                    type="button"
                                                    className="btn-add"
                                                    onClick={() =>
                                                        abrirCategoria(
                                                            'generos'
                                                        )
                                                    }
                                                >
                                                    + Adicionar
                                                </button>

                                            </div>


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
                                                    Escolha as tags que mais te interessam.
                                                </p>


                                                <div className="tags-container">

                                                    {tagsSelecionadas.map(
                                                        (tag) => (

                                                            <span
                                                                className="tag"
                                                                key={
                                                                    tag
                                                                }
                                                            >

                                                                {
                                                                    tag
                                                                }


                                                                <button
                                                                    type="button"
                                                                    className="tag-remove"
                                                                    onClick={() =>
                                                                        alternarOpcao(
                                                                            tag,
                                                                            'tags'
                                                                        )
                                                                    }
                                                                >
                                                                    &times;
                                                                </button>

                                                            </span>

                                                        )
                                                    )}

                                                </div>


                                                <button
                                                    type="button"
                                                    className="btn-add"
                                                    onClick={() =>
                                                        abrirCategoria(
                                                            'tags'
                                                        )
                                                    }
                                                >
                                                    + Adicionar
                                                </button>

                                            </div>

                                        </div>


                                        {categoriaAberta && (

                                            <div className="painel-preferencias">

                                                <div className="painel-preferencias-header">

                                                    <h3>

                                                        {
                                                            categoriaAberta ===
                                                            'animes'
                                                                ? 'Escolha seus animes'
                                                                : categoriaAberta ===
                                                                    'generos'
                                                                    ? 'Escolha seus gêneros'
                                                                    : 'Escolha suas tags'
                                                        }

                                                    </h3>


                                                    <button
                                                        type="button"
                                                        onClick={
                                                            fecharCategoria
                                                        }
                                                    >
                                                        × Fechar
                                                    </button>

                                                </div>


                                                <div className="campo-busca-preferencia">

                                                    <i className="ph ph-magnifying-glass"></i>


                                                    <input
                                                        type="text"
                                                        value={
                                                            buscaPreferencia
                                                        }
                                                        onChange={(e) =>
                                                            setBuscaPreferencia(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={
                                                            categoriaAberta ===
                                                            'animes'
                                                                ? 'Procure um anime...'
                                                                : categoriaAberta ===
                                                                    'generos'
                                                                    ? 'Procure um gênero...'
                                                                    : 'Procure uma tag...'
                                                        }
                                                    />

                                                </div>


                                                <div className="opcoes-preferencias">

                                                    {categoriaAberta ===
                                                        'animes' && (

                                                        animesFiltrados.length >
                                                        0 ? (

                                                            animesFiltrados.map(
                                                                (anime) => (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            anime
                                                                        }
                                                                        className={
                                                                            animesSelecionados.includes(
                                                                                anime
                                                                            )
                                                                                ? 'opcao-preferencia selecionada'
                                                                                : 'opcao-preferencia'
                                                                        }
                                                                        onClick={() =>
                                                                            alternarOpcao(
                                                                                anime,
                                                                                'animes'
                                                                            )
                                                                        }
                                                                    >

                                                                        <span>
                                                                            {
                                                                                anime
                                                                            }
                                                                        </span>


                                                                        <span>
                                                                            {
                                                                                animesSelecionados.includes(
                                                                                    anime
                                                                                )
                                                                                    ? '✓'
                                                                                    : '+'
                                                                            }
                                                                        </span>

                                                                    </button>

                                                                )
                                                            )

                                                        ) : (

                                                            <p className="nenhuma-opcao">
                                                                Nenhum anime encontrado.
                                                            </p>

                                                        )
                                                    )}


                                                    {categoriaAberta ===
                                                        'generos' && (

                                                        generosFiltrados.length >
                                                        0 ? (

                                                            generosFiltrados.map(
                                                                (genero) => (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            genero
                                                                        }
                                                                        className={
                                                                            generosSelecionados.includes(
                                                                                genero
                                                                            )
                                                                                ? 'opcao-preferencia selecionada'
                                                                                : 'opcao-preferencia'
                                                                        }
                                                                        onClick={() =>
                                                                            alternarOpcao(
                                                                                genero,
                                                                                'generos'
                                                                            )
                                                                        }
                                                                    >

                                                                        <span>
                                                                            {
                                                                                genero
                                                                            }
                                                                        </span>


                                                                        <span>
                                                                            {
                                                                                generosSelecionados.includes(
                                                                                    genero
                                                                                )
                                                                                    ? '✓'
                                                                                    : '+'
                                                                            }
                                                                        </span>

                                                                    </button>

                                                                )
                                                            )

                                                        ) : (

                                                            <p className="nenhuma-opcao">
                                                                Nenhum gênero encontrado.
                                                            </p>

                                                        )
                                                    )}


                                                    {categoriaAberta ===
                                                        'tags' && (

                                                        tagsFiltradas.length >
                                                        0 ? (

                                                            tagsFiltradas.map(
                                                                (tag) => (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className={
                                                                            tagsSelecionadas.includes(
                                                                                tag
                                                                            )
                                                                                ? 'opcao-preferencia selecionada'
                                                                                : 'opcao-preferencia'
                                                                        }
                                                                        onClick={() =>
                                                                            alternarOpcao(
                                                                                tag,
                                                                                'tags'
                                                                            )
                                                                        }
                                                                    >

                                                                        <span>
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>


                                                                        <span>
                                                                            {
                                                                                tagsSelecionadas.includes(
                                                                                    tag
                                                                                )
                                                                                    ? '✓'
                                                                                    : '+'
                                                                            }
                                                                        </span>

                                                                    </button>

                                                                )
                                                            )

                                                        ) : (

                                                            <p className="nenhuma-opcao">
                                                                Nenhuma tag encontrada.
                                                            </p>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}

                                    </section>

                                )}


                                <section className="minha-lista-section">

                                    <h2 className="section-title">

                                        <i className="ph-fill ph-books"></i>

                                        {
                                            isMeuPerfil
                                                ? 'Minha lista'
                                                : `Lista de ${nome}`
                                        }

                                    </h2>


                                    <p className="section-subtitle">
                                        Obras adicionadas à lista deste usuário.
                                    </p>


                                    {carregandoObras ? (

                                        <p className="mensagem-post">
                                            Carregando obras...
                                        </p>

                                    ) : minhasObras.length > 0 ? (

                                        <div className="minha-lista-grid">

                                            {minhasObras.map(
                                                (obra) => {

                                                    const nomeObra =
                                                        obra.title?.english ||
                                                        obra.title?.romaji ||
                                                        obra.title?.native ||
                                                        'Obra sem título';

                                                    const imagem =
                                                        obra.coverImage?.large ||
                                                        obra.coverImage?.extraLarge;

                                                    return (

                                                        <div
                                                            key={
                                                                obra.id
                                                            }
                                                            className="obra-card"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/anime/${obra.id}`
                                                                )
                                                            }
                                                        >

                                                            <div className="obra-card-imagem">

                                                                {imagem && (

                                                                    <img
                                                                        src={
                                                                            imagem
                                                                        }
                                                                        alt={
                                                                            nomeObra
                                                                        }
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display =
                                                                                'none';
                                                                        }}
                                                                    />

                                                                )}

                                                            </div>


                                                            <div className="obra-card-info">

                                                                <h3>
                                                                    {
                                                                        nomeObra
                                                                    }
                                                                </h3>


                                                                {obra.startDate?.year && (

                                                                    <span>
                                                                        {
                                                                            obra
                                                                                .startDate
                                                                                .year
                                                                        }
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    ) : (

                                        <div className="sem-obras">

                                            <i className="ph ph-books"></i>


                                            <h3>

                                                {isMeuPerfil
                                                    ? 'Sua lista está vazia'
                                                    : `${nome} ainda não adicionou obras`}

                                            </h3>


                                            {isMeuPerfil && (

                                                <p>
                                                    Pesquise uma obra e adicione à sua lista.
                                                </p>

                                            )}

                                        </div>

                                    )}

                                </section>


                                <div className="meus-posts-secao">

                                    <h2 className="section-title">

                                        <i className="ph-fill ph-article"></i>

                                        {
                                            isMeuPerfil
                                                ? 'Minhas Publicações'
                                                : `Publicações de ${nome}`
                                        }

                                    </h2>


                                    <p className="section-subtitle">
                                        Compartilhe suas opiniões e fale sobre seus animes favoritos.
                                    </p>


                                    {isMeuPerfil && (

                                        <div className="criar-post-card">

                                            <h3>

                                                <i className="ph-fill ph-pencil-simple"></i>

                                                Criar publicação

                                            </h3>


                                            <input
                                                type="text"
                                                placeholder="Título da publicação"
                                                value={
                                                    novoTitulo
                                                }
                                                onChange={(e) =>
                                                    setNovoTitulo(
                                                        e.target.value
                                                    )
                                                }
                                                className="post-input"
                                            />


                                            <div className="campo-imagem-post">

                                                <label
                                                    htmlFor="imagemPublicacao"
                                                    className="botao-escolher-imagem"
                                                >

                                                    <i className="ph-fill ph-image"></i>

                                                    Escolher imagem

                                                </label>


                                                <input
                                                    type="file"
                                                    id="imagemPublicacao"
                                                    accept="image/*"
                                                    onChange={
                                                        handleImagemPublicacao
                                                    }
                                                    style={{
                                                        display:
                                                            'none'
                                                    }}
                                                />


                                                {novaImagem && (

                                                    <span className="nome-imagem">

                                                        {
                                                            novaImagem.name
                                                        }

                                                    </span>

                                                )}

                                            </div>


                                            {previewImagem && (

                                                <div className="preview-imagem-post">

                                                    <img
                                                        src={
                                                            previewImagem
                                                        }
                                                        alt="Prévia da publicação"
                                                    />

                                                </div>

                                            )}


                                            <textarea
                                                placeholder="Escreva sua publicação..."
                                                value={
                                                    novoConteudo
                                                }
                                                onChange={(e) =>
                                                    setNovoConteudo(
                                                        e.target.value
                                                    )
                                                }
                                                className="post-textarea"
                                            ></textarea>


                                            <button
                                                type="button"
                                                className="btn-publicar"
                                                onClick={
                                                    handlePublicar
                                                }
                                                disabled={
                                                    publicando
                                                }
                                            >

                                                <i className="ph-fill ph-paper-plane-tilt"></i>

                                                {
                                                    publicando
                                                        ? 'Publicando...'
                                                        : 'Publicar'
                                                }

                                            </button>

                                        </div>

                                    )}


                                    <div className="publicacoes-usuario">

                                        <h3 className="subtitulo-publicacoes">

                                            {
                                                isMeuPerfil
                                                    ? 'Minhas publicações'
                                                    : `Publicações de ${nome}`
                                            }

                                        </h3>


                                        {carregandoPosts ? (

                                            <p className="mensagem-post">
                                                Carregando publicações...
                                            </p>

                                        ) : meusPosts.length > 0 ? (

                                            <div className="meus-posts-grid">

                                                {meusPosts.map(
                                                    (post) => (

                                                        <div
                                                            key={
                                                                post.id
                                                            }
                                                            className="meu-post-card"
                                                        >

                                                            {post.imagem && (

                                                                <div className="meu-post-imagem">

                                                                    <img
                                                                        src={
                                                                            post.imagem
                                                                        }
                                                                        alt="Imagem da publicação"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display =
                                                                                'none';
                                                                        }}
                                                                    />

                                                                </div>

                                                            )}


                                                            <div className="meu-post-conteudo-area">

                                                                <h4 className="meu-post-titulo-card">
                                                                    {
                                                                        post.titulo
                                                                    }
                                                                </h4>


                                                                <p className="meu-post-conteudo">
                                                                    {
                                                                        post.conteudo
                                                                    }
                                                                </p>


                                                                {post.criado_em && (

                                                                    <small className="post-data">

                                                                        {
                                                                            new Date(
                                                                                post.criado_em
                                                                            ).toLocaleDateString(
                                                                                'pt-BR'
                                                                            )
                                                                        }

                                                                    </small>

                                                                )}

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        ) : (

                                            <div className="sem-publicacoes">

                                                <i className="ph ph-article"></i>


                                                <h3>

                                                    {
                                                        isMeuPerfil
                                                            ? 'Você ainda não publicou nada'
                                                            : `${nome} ainda não publicou nada`
                                                    }

                                                </h3>


                                                {isMeuPerfil && (

                                                    <p>
                                                        Crie sua primeira publicação usando o formulário acima.
                                                    </p>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </>

                        )}


                        {activeTab ===
                            'configuracoes' && (

                            <div className="settings-container">

                                <div className="settings-section card-bg">

                                    <h2 className="section-title">

                                        <i className="ph-fill ph-user-list"></i>

                                        Dados Pessoais

                                    </h2>


                                    <div className="settings-group">

                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Nome e foto
                                                </h4>

                                                <p>
                                                    Atualize seu nome de exibição e imagem de perfil.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                                onClick={
                                                    abrirEditarPerfil
                                                }
                                            >
                                                Editar
                                            </button>

                                        </div>


                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    E-mail e telefone
                                                </h4>

                                                <p>
                                                    Gerencie suas informações de contato.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Editar
                                            </button>

                                        </div>


                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Data de nascimento
                                                </h4>

                                                <p>
                                                    Atualize a data do seu nascimento.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Editar
                                            </button>

                                        </div>

                                    </div>

                                </div>


                                <div className="settings-section card-bg">

                                    <h2 className="section-title">

                                        <i className="ph-fill ph-lock-key"></i>

                                        Segurança

                                    </h2>


                                    <div className="settings-group">

                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Senha de acesso
                                                </h4>

                                                <p>
                                                    Altere sua senha de login atual.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Mudar senha
                                            </button>

                                        </div>


                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Confirmação em duas etapas
                                                </h4>

                                                <p>
                                                    Adicione uma camada extra de segurança.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Ativar
                                            </button>

                                        </div>


                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Dispositivos conectados
                                                </h4>

                                                <p>
                                                    Gerencie as sessões ativas na sua conta.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Visualizar
                                            </button>

                                        </div>

                                    </div>

                                </div>


                                <div className="settings-section card-bg">

                                    <h2 className="section-title">

                                        <i className="ph-fill ph-gear"></i>

                                        Preferências

                                    </h2>


                                    <div className="settings-group">

                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Idioma e região
                                                </h4>

                                                <p>
                                                    Personalize o idioma da interface.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Alterar
                                            </button>

                                        </div>


                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Tema visual
                                                </h4>

                                                <p>
                                                    Alterne entre o tema escuro e claro.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
                                                Ajustar
                                            </button>

                                        </div>


                                        <div className="settings-item">

                                            <div className="settings-item-info">

                                                <h4>
                                                    Notificações
                                                </h4>

                                                <p>
                                                    Escolha o que deseja receber por e-mail.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="settings-btn"
                                            >
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


            {modalEditarPerfil && (

                <div
                    className="modal-overlay"
                    onClick={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            fecharEditarPerfil();

                        }

                    }}
                >

                    <div className="modal-editar-perfil">

                        <div className="modal-header">

                            <h2>
                                Editar perfil
                            </h2>


                            <button
                                type="button"
                                className="modal-fechar"
                                onClick={
                                    fecharEditarPerfil
                                }
                                disabled={
                                    salvandoPerfil
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="modal-conteudo">

                            <div className="editar-foto-area">

                                <div className="editar-foto-preview">

                                    {previewFotoPerfil ? (

                                        <img
                                            src={
                                                previewFotoPerfil
                                            }
                                            alt="Nova foto de perfil"
                                        />

                                    ) : fotoUrl ? (

                                        <img
                                            src={
                                                fotoUrl
                                            }
                                            alt="Foto de perfil"
                                        />

                                    ) : (

                                        <i className="ph ph-user"></i>

                                    )}

                                </div>


                                <label
                                    htmlFor="novaFotoPerfil"
                                    className="btn-editar-foto"
                                >

                                    <i className="ph ph-camera"></i>

                                    Alterar foto

                                </label>


                                <input
                                    type="file"
                                    id="novaFotoPerfil"
                                    accept="image/*"
                                    onChange={
                                        handleNovaFotoPerfil
                                    }
                                    style={{
                                        display:
                                            'none'
                                    }}
                                    disabled={
                                        salvandoPerfil
                                    }
                                />

                            </div>


                            <div className="campo-editar-perfil">

                                <label>
                                    Nome de usuário
                                </label>


                                <input
                                    type="text"
                                    value={
                                        nomeEditado
                                    }
                                    onChange={(e) =>
                                        setNomeEditado(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Digite seu nome"
                                    maxLength={50}
                                    disabled={
                                        salvandoPerfil
                                    }
                                />

                            </div>


                            <div className="modal-acoes">

                                <button
                                    type="button"
                                    className="btn-cancelar"
                                    onClick={
                                        fecharEditarPerfil
                                    }
                                    disabled={
                                        salvandoPerfil
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="button"
                                    className="btn-salvar-perfil"
                                    onClick={
                                        salvarPerfil
                                    }
                                    disabled={
                                        salvandoPerfil
                                    }
                                >

                                    <i className="ph ph-check"></i>

                                    {
                                        salvandoPerfil
                                            ? 'Salvando...'
                                            : 'Salvar alterações'
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}

export default Perfil;