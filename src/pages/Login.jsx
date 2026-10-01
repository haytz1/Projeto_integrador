import React, { useState } from 'react';

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


            console.log(
                'LOGIN REALIZADO COM SUCESSO!'
            );

            console.log(
                'ID DO AUTH:',
                data.user.id
            );

            console.log(
                'E-MAIL:',
                data.user.email
            );


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


            console.log(
                'SESSÃO CRIADA COM SUCESSO!'
            );

            console.log(
                'USUÁRIO DA SESSÃO:',
                sessionData.session.user
            );


            // =====================================================
            // BUSCAR O PERFIL NA TABELA usuarios
            // =====================================================

            let usuario = null;

            // Primeiro tenta pelo auth_id
            const {
                data: usuarioPorAuthId,
                error: erroAuthId
            } = await supabase
                .from('usuarios')
                .select('*')
                .eq('auth_id', data.user.id)
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
            if (!usuario && data.user.email) {

                const {
                    data: usuarioPorEmail,
                    error: erroEmail
                } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('email', data.user.email)
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
                String(data.user.id)
            );

            localStorage.setItem(
                'usuario_email',
                usuario.email || data.user.email || ''
            );

            localStorage.setItem(
                'usuario_username',
                usuario.username || ''
            );

            console.log(
                'PERFIL ENCONTRADO:',
                usuario
            );

            console.log(
                'ID DA TABELA usuarios:',
                usuario.id
            );

            console.log(
                'ID DO AUTH:',
                data.user.id
            );

            // Agora sim vai para o Perfil
            navigate('/Perfil');

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