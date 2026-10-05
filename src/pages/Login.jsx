import React, { useState, useEffect } from 'react';

import Navbar from '../components/Navbar';

import { Link, useNavigate } from 'react-router-dom';

import { supabase } from '../../supabase';

import '../css/login.css';

function Login() {

    const [email, setEmail] = useState('');

    const [senha, setSenha] = useState('');

    const [carregando, setCarregando] = useState(false);

    const [enviandoEmail, setEnviandoEmail] = useState(false);

    const navigate = useNavigate();


    // LOGIN
    const handleLogin = async (e) => {

        e.preventDefault();

        if (!email || !senha) {

            alert('Preencha o e-mail e a senha!');

            return;
        }

        setCarregando(true);

        try {

            // Login pelo Supabase Auth
            const { data, error } =
                await supabase.auth.signInWithPassword({

                    email: email,

                    password: senha

                });


            // Se o Supabase encontrou algum erro
            if (error) {

                console.error('ERRO NO LOGIN:', error);

                alert(
                    'Erro ao fazer login:\n\n' +
                    error.message
                );

                return;
            }


            // Verifica se o usuário foi encontrado
            if (!data || !data.user) {

                console.error('Usuário não encontrado.');

                alert(
                    'Não foi possível identificar o usuário.'
                );

                return;
            }



            // Verifica se a sessão realmente existe
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();


            if (sessionError) {

                console.error(
                    'ERRO AO VERIFICAR SESSÃO:',
                    sessionError
                );

                alert(
                    'O login foi realizado, mas não foi possível verificar a sessão.'
                );

                return;
            }


            if (!sessionData.session) {

                console.error(
                    'NENHUMA SESSÃO FOI ENCONTRADA.'
                );

                alert(
                    'A sessão não foi criada. Tente fazer login novamente.'
                );

                return;
            }



            await carregarPerfilEEntrar(data.user, false);

        } catch (erro) {

            console.error(
                'ERRO NO LOGIN:',
                erro
            );

            alert(
                'Ocorreu um erro ao tentar fazer login.'
            );

        } finally {

            setCarregando(false);

        }
    };


    // =====================================================
    // BUSCAR O PERFIL NA TABELA usuarios E ENTRAR
    // (usado pelo login com senha e pelo login com Google)
    // criarSeFaltar = true só no login social: no primeiro acesso
    // pelo Google ainda não existe perfil, então criamos um.
    // =====================================================

    async function carregarPerfilEEntrar(user, criarSeFaltar) {

            let usuario = null;

            // Primeiro tenta pelo auth_id
            const {
                data: usuarioPorAuthId,
                error: erroAuthId
            } = await supabase
                .from('usuarios')
                .select('*')
                .eq('auth_id', user.id)
                .maybeSingle();

            if (erroAuthId) {
                console.error(
                    'ERRO AO BUSCAR PERFIL PELO auth_id:',
                    erroAuthId
                );
            }

            if (usuarioPorAuthId) {
                usuario = usuarioPorAuthId;
            }

            // Se não encontrou, tenta pelo e-mail.
            // Isso permite recuperar um perfil antigo que ficou sem auth_id.
            if (!usuario && user.email) {

                const {
                    data: usuarioPorEmail,
                    error: erroEmail
                } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('email', user.email)
                    .maybeSingle();

                if (erroEmail) {
                    console.error(
                        'ERRO AO BUSCAR PERFIL PELO E-MAIL:',
                        erroEmail
                    );
                }

                if (usuarioPorEmail) {
                    usuario = usuarioPorEmail;
                }
            }

            // Dados que o Google manda (nome e foto)
            const dadosSociais = user.user_metadata || {};
            const fotoSocial = dadosSociais.avatar_url || dadosSociais.picture || null;

            // Primeiro acesso pelo Google: cria o perfil
            if (!usuario && criarSeFaltar) {

                const username = await gerarUsernameLivre(user);

                const {
                    data: novoUsuario,
                    error: erroCriar
                } = await supabase
                    .from('usuarios')
                    .insert({
                        auth_id: user.id,
                        email: user.email,
                        username: username,
                        foto: fotoSocial
                    })
                    .select('*')
                    .single();

                if (erroCriar) {
                    console.error(
                        'ERRO AO CRIAR PERFIL DO LOGIN SOCIAL:',
                        erroCriar
                    );
                } else {
                    usuario = novoUsuario;
                }
            }

            // Perfil criado pelo banco, mas sem nome (login social): completa
            if (usuario && !usuario.username && criarSeFaltar) {

                const username = await gerarUsernameLivre(user);

                const { data: atualizado } = await supabase
                    .from('usuarios')
                    .update({
                        username: username,
                        foto: usuario.foto || fotoSocial
                    })
                    .eq('id', usuario.id)
                    .select('*')
                    .single();

                if (atualizado) {
                    usuario = atualizado;
                }
            }

            // Se o Auth entrou, mas não existe perfil na tabela usuarios,
            // não criamos outra conta e não apagamos a conta antiga.
            if (!usuario) {

                console.error(
                    'Login realizado, mas nenhum perfil foi encontrado na tabela usuarios.'
                );

                alert(
                    'Login realizado, mas não foi possível carregar o perfil.\n\n' +
                    'A conta existe no Supabase Auth, porém o perfil não foi encontrado na tabela usuarios.'
                );

                return;
            }

            // =====================================================
            // SALVAR OS IDs CORRETOS NO LOCALSTORAGE
            // =====================================================

            localStorage.setItem(
                'usuario_id',
                String(usuario.id)
            );

            localStorage.setItem(
                'usuario_auth_id',
                String(user.id)
            );

            localStorage.setItem(
                'usuario_email',
                usuario.email || user.email || ''
            );

            localStorage.setItem(
                'usuario_username',
                usuario.username || ''
            );

            // Agora sim vai para o Perfil
            navigate('/Perfil');
    }


    // Cria um username a partir do nome do Google ou do e-mail.
    // Se já existir alguém com esse nome, coloca números no final.
    async function gerarUsernameLivre(user) {

        const dados = user.user_metadata || {};

        const base = (
            dados.full_name ||
            dados.name ||
            (user.email || 'usuario').split('@')[0]
        )
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')   // tira acentos
            .replace(/[^a-zA-Z0-9_]/g, '')       // tira espaços e símbolos
            .slice(0, 20) || 'usuario';

        let tentativa = base;

        for (let i = 0; i < 5; i++) {

            const { data: existente } = await supabase
                .from('usuarios')
                .select('id')
                .eq('username', tentativa)
                .maybeSingle();

            if (!existente) {
                return tentativa;
            }

            tentativa = base + Math.floor(1000 + Math.random() * 9000);
        }

        return tentativa;
    }


    // =====================================================
    // LOGIN COM GOOGLE
    // =====================================================
    // 1. O botão manda a pessoa para a tela do Google
    // 2. Depois de entrar, ela volta para /Login
    // 3. O useEffect abaixo percebe a sessão e chama carregarPerfilEEntrar

    const entrarComProvedor = async (provedor) => {

        const nomeProvedor = 'Google';

        // Confere no Supabase se esse login já foi ativado.
        // Sem isso, a pessoa cairia numa página de erro do Supabase.
        try {
            const resposta = await fetch(
                import.meta.env.VITE_SUPABASE_URL + '/auth/v1/settings',
                {
                    headers: {
                        apikey:
                            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
                            import.meta.env.VITE_SUPABASE_ANON_KEY
                    }
                }
            );
            const config = await resposta.json();

            if (!config.external?.[provedor]) {
                alert('O login com ' + nomeProvedor + ' ainda não foi ativado no Supabase.');
                return;
            }
        } catch (erro) {
            console.error('ERRO AO VERIFICAR LOGIN SOCIAL:', erro);
        }

        localStorage.setItem('login_social', provedor);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: provedor,
            options: {
                redirectTo: window.location.origin + '/Login'
            }
        });

        if (error) {

            localStorage.removeItem('login_social');

            console.error('ERRO NO LOGIN SOCIAL:', error);

            alert('Erro ao entrar com ' + nomeProvedor + ': ' + error.message);
        }
    };


    // Quando volta do Google
    useEffect(() => {

        async function voltarDoLoginSocial() {

            // O Google pode devolver um erro na própria URL
            const parametros = new URLSearchParams(
                window.location.search + '&' + window.location.hash.replace('#', '')
            );
            const erroUrl = parametros.get('error_description');

            const provedor = localStorage.getItem('login_social');

            if (!provedor) return;

            localStorage.removeItem('login_social');

            if (erroUrl) {
                console.error('ERRO VINDO DO LOGIN SOCIAL:', erroUrl);
                alert('Erro ao entrar com Google: ' + erroUrl);
                return;
            }

            const { data } = await supabase.auth.getSession();

            if (data?.session?.user) {
                setCarregando(true);
                try {
                    await carregarPerfilEEntrar(data.session.user, true);
                } catch (erro) {
                    console.error('ERRO NO LOGIN SOCIAL:', erro);
                    alert('Ocorreu um erro ao tentar fazer login.');
                } finally {
                    setCarregando(false);
                }
            }
        }

        voltarDoLoginSocial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // RECUPERAR SENHA
    const handleEsqueceuSenha = async (e) => {

        e.preventDefault();

        if (!email) {

            alert(
                'Digite seu e-mail primeiro.'
            );

            return;
        }

        setEnviandoEmail(true);

        try {

            const redirectTo =
                window.location.origin +
                '/RedefinirSenha';


            const { error } =
                await supabase.auth.resetPasswordForEmail(

                    email,

                    {
                        redirectTo: redirectTo
                    }

                );


            if (error) {

                console.error(
                    'ERRO AO ENVIAR RECUPERAÇÃO:',
                    error
                );

                alert(
                    'Erro ao enviar o e-mail: ' +
                    error.message
                );

                return;
            }


            alert(
                'Confira seu e-mail para redefinir sua senha.'
            );

        } catch (erro) {

            console.error(
                'ERRO NA RECUPERAÇÃO:',
                erro
            );

            alert(
                'Ocorreu um erro ao enviar o e-mail.'
            );

        } finally {

            setEnviandoEmail(false);

        }
    };


    return (

        <>

            <Navbar />


            <div
                className="stars"
                id="stars"
                aria-hidden="true"
            >
            </div>


            <main className="page-wrapper">

                <div
                    className="login-card"
                    role="main"
                >

                    <h1 className="welcome-title">

                        Boas vindas ao AnimeSpot

                    </h1>


                    <p className="subtitle">

                        Faça login para continuar:

                    </p>


                    <form
                        id="login-form"
                        onSubmit={handleLogin}
                        noValidate
                    >

                        {/* E-MAIL */}

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="input-email"
                            >

                                E-mail

                            </label>


                            <div className="input-wrapper">

                                <svg
                                    className="input-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >

                                    <rect
                                        x="2"
                                        y="4"
                                        width="20"
                                        height="16"
                                        rx="2"
                                    />

                                    <path d="m2 7 10 7 10-7" />

                                </svg>


                                <input
                                    type="email"
                                    id="input-email"
                                    name="email"
                                    className="form-input"
                                    placeholder="seu@email.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* SENHA */}

                        <div className="form-group">

                            <div className="senha-row">

                                <label
                                    className="form-label"
                                    htmlFor="input-senha"
                                    style={{
                                        marginBottom: 0
                                    }}
                                >

                                    Senha

                                </label>


                                <a
                                    href="#"
                                    className="forgot-link"
                                    id="link-esqueceu-senha"
                                    onClick={handleEsqueceuSenha}
                                >

                                    {enviandoEmail
                                        ? 'Enviando...'
                                        : 'Esqueceu sua senha?'}

                                </a>

                            </div>


                            <div className="input-wrapper">

                                <svg
                                    className="input-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >

                                    <rect
                                        x="3"
                                        y="11"
                                        width="18"
                                        height="11"
                                        rx="2"
                                    />

                                    <path
                                        d="M7 11V7a5 5 0 0 1 10 0v4"
                                    />

                                </svg>


                                <input
                                    type="password"
                                    id="input-senha"
                                    name="senha"
                                    className="form-input"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={senha}
                                    onChange={(e) =>
                                        setSenha(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* BOTÃO ENTRAR */}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            id="btn-entrar"
                            disabled={carregando}
                        >

                            {carregando
                                ? 'Entrando...'
                                : 'Entrar'}

                        </button>


                        <div
                            className="divider"
                            aria-hidden="true"
                        >

                            Ou

                        </div>


                        {/* LOGIN COM GOOGLE */}

                        <button
                            type="button"
                            className="btn btn-secondary btn-social"
                            onClick={() => entrarComProvedor('google')}
                            disabled={carregando}
                        >
                            <i className="ph ph-google-logo"></i>
                            Continuar com o Google
                        </button>



                        {/* CADASTRO */}

                        <Link
                            to="/Cadastro"
                            className="btn btn-secondary"
                            id="btn-criar-conta"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textDecoration: 'none'
                            }}
                        >

                            Criar uma conta

                        </Link>

                    </form>

                </div>

            </main>

        </>

    );

}

export default Login;