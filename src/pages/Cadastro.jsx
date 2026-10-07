
import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import { supabase } from '../../supabase';

import '../css/cadastro.css';

function Cadastro() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);

    const navigate = useNavigate();

    const handleFotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFoto(e.target.files[0]);
            setFotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    async function fazerCadastro(e) {

        e.preventDefault();

        if (!username || !email || !senha) {

            alert('Preencha todos os campos!');

            return;
        }

        if (senha.length < 6) {

            alert('A senha deve ter pelo menos 6 caracteres!');

            return;
        }

        setCarregando(true);

        try {

            // Cria a conta no Supabase Auth
            // O username vai junto nos metadados
            // para o trigger criar o perfil na tabela usuarios.
                        let fotoUrl = null;

            if (foto) {
                const fileExt = foto.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars_usuarios')
                    .upload(fileName, foto);

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('avatars_usuarios')
                        .getPublicUrl(fileName);
                    fotoUrl = urlData.publicUrl;
                } else {
                    console.error("Erro no upload da foto", uploadError);
                }
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: senha,
                options: {
                    data: {
                        username: username,
                        ...(fotoUrl && { foto: fotoUrl })
                    }
                }
            });

            if (error) {

                console.error('ERRO DO SUPABASE AUTH:', error);

                alert('Erro ao cadastrar: ' + error.message);

                return;
            }

            if (!data.user) {

                alert('Não foi possível criar a conta.');

                return;
            }

            alert('Conta criada com sucesso!');

            navigate('/Login');

        } catch (erro) {

            console.error('ERRO:', erro);

            alert('Ocorreu um erro ao criar a conta.');

        } finally {

            setCarregando(false);

        }
    }

    // Criar conta com Google.
    // Depois de entrar, a pessoa volta para /Login, que cria o perfil
    // na tabela usuarios (se for o primeiro acesso) e leva para o Perfil.
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

    return (
        <>
            <Navbar />

            <div
                className="stars"
                id="stars"
                aria-hidden="true"
            ></div>

            <main className="page-wrapper">

                <div
                    className="cadastro-card"
                    role="main"
                >

                    <div className="avatar-wrapper">

                        <div
                            className="avatar-circle"
                            id="avatar-circle"
                            title="Clique para adicionar uma foto de perfil"
                            style={{ 
                                backgroundImage: fotoPreview ? `url(${fotoPreview})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >

                            {!fotoPreview && (
                                <div
                                    className="avatar-placeholder"
                                    id="avatar-placeholder"
                                >

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >

                                    <circle
                                        cx="12"
                                        cy="8"
                                        r="4"
                                    />

                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />

                                </svg>

                                <span>Foto</span>

                                </div>
                            )}

                            <div
                                className="avatar-overlay"
                                aria-hidden="true"
                            >

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >

                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

                                    <polyline points="17 8 12 3 7 8" />

                                    <line
                                        x1="12"
                                        y1="3"
                                        x2="12"
                                        y2="15"
                                    />

                                </svg>

                            </div>

                        </div>

                        <input
                            type="file"
                            id="avatar-input"
                            className="avatar-input"
                            accept="image/*"
                            aria-label="Selecionar foto de perfil"
                            onChange={handleFotoChange}
                        />

                    </div>

                    <h1 className="welcome-title">
                        É rápido e grátis!
                    </h1>

                    <form
                        id="cadastro-form"
                        noValidate
                        onSubmit={fazerCadastro}
                    >

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="input-username"
                            >
                                Username
                            </label>

                            <div className="input-wrapper">

                                <input
                                    type="text"
                                    id="input-username"
                                    name="username"
                                    className="form-input"
                                    placeholder="Seu username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="input-email"
                            >
                                E-mail
                            </label>

                            <div className="input-wrapper">

                                <input
                                    type="email"
                                    id="input-email"
                                    name="email"
                                    className="form-input"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label
                                className="form-label"
                                htmlFor="input-senha"
                            >
                                Senha
                            </label>

                            <div className="input-wrapper">

                                <input
                                    type="password"
                                    id="input-senha"
                                    name="senha"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                    minLength={6}
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={carregando}
                        >
                            {carregando
                                ? 'Criando conta...'
                                : 'Criar conta'}
                        </button>

                        <div
                            className="divider"
                            aria-hidden="true"
                        >
                            Ou
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => entrarComProvedor('google')}
                            disabled={carregando}
                        >
                            <i className="ph ph-google-logo"></i>
                            Continuar com o Google
                        </button>


                        <div className="login-link-container">

                            <Link
                                to="/Login"
                                className="login-link"
                            >
                                Já tem uma conta? Fazer login
                            </Link>

                        </div>

                    </form>

                </div>

            </main>
        </>
    );
}

export default Cadastro;

