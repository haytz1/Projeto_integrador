import Navbar from '../components/Navbar';

import '../css/planos.css';

import { Link } from 'react-router-dom';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function Planos() {

    const escolherPlano = async (plano) => {
        const usuarioId = localStorage.getItem('usuario_id');

        if (!usuarioId) {
            alert('Faça login para escolher um plano.');
            return;
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ plano: plano })
            .eq('id', usuarioId);

        if (error) {
            console.error('Erro ao alterar plano:', error);
            alert('Erro ao alterar o plano.');
            return;
        }

        alert('Plano alterado com sucesso!');
    };

    return (
        <>
            <Navbar />

            <main className="container">

                <header className="plans-header">
                    <h1 className="main-title">Planos de Assinatura</h1>
                    <p>
                        Escolha o plano ideal para você continuar lendo as
                        melhores histórias.
                    </p>
                </header>

                <section className="plans-grid">

                    <article className="plan-card">

                        <div className="plan-header">
                            <h2>Plano Grátis</h2>

                            <div className="plan-price">
                                <span className="currency">R$</span>
                                <span className="amount">0,00</span>
                                <span className="period">/mês</span>
                            </div>
                        </div>

                        <div className="plan-body">

                            <ul className="plan-features">

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Acesso a histórias gratuitas
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Deixar comentários
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Seguir autores favoritos
                                </li>

                                <li className="disabled">
                                    <i className="ph ph-x-circle"></i>
                                    Sem anúncios
                                </li>

                                <li className="disabled">
                                    <i className="ph ph-x-circle"></i>
                                    Capítulos adiantados
                                </li>

                            </ul>

                            <button
                                className="btn-cta btn-plan"
                                onClick={() => escolherPlano('Gratuito')}
                            >
                                Começar Grátis
                            </button>

                        </div>

                    </article>


                    <article className="plan-card plan-featured">

                        <div className="featured-badge">
                            Mais Popular
                        </div>

                        <div className="plan-header">
                            <h2>Plano 1</h2>

                            <div className="plan-price">
                                <span className="currency">R$</span>
                                <span className="amount">15,00</span>
                                <span className="period">/mês</span>
                            </div>
                        </div>

                        <div className="plan-body">

                            <ul className="plan-features">

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Acesso a histórias gratuitas
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Deixar comentários
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Seguir autores favoritos
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Sem anúncios em mangás
                                </li>

                                <li className="disabled">
                                    <i className="ph ph-x-circle"></i>
                                    Capítulos adiantados
                                </li>

                            </ul>

                            <button
                                className="btn-cta btn-plan"
                                onClick={() => escolherPlano('Premium')}
                            >
                                Assinar plano 1
                            </button>

                        </div>

                    </article>

                </section>

            </main>

            <footer className="site-footer">

                <div className="footer-container">

                    <div className="footer-about">

                        <h3
                            className="site-logo"
                            style={{ margin: 0 }}
                        >
                            Anime Spot
                        </h3>

                        <p>
                            O seu destino final para ler e descobrir os
                            melhores animes, mangás e autores em um só lugar.
                        </p>

                    </div>

                    <div className="footer-links">

                        <h4>Navegação</h4>

                        <ul>

                            <li>
                                <Link to="/">Início</Link>
                            </li>

                            <li>
                                <Link to="/Planos">Planos</Link>
                            </li>

                            <li>
                                <Link to="/Moedas">Moedas</Link>
                            </li>

                        </ul>

                    </div>

                    <div className="footer-links">

                        <h4>Suporte</h4>

                        <ul>

                            <li>
                                <a href="#">FAQ</a>
                            </li>

                            <li>
                                <a href="#">Termos de Uso</a>
                            </li>

                            <li>
                                <a href="#">Política de Privacidade</a>
                            </li>

                            <li>
                                <a href="#">Contato</a>
                            </li>

                        </ul>

                    </div>

                    <div className="footer-social">

                        <h4>Redes Sociais</h4>

                        <div className="social-icons">

                            <a href="#" aria-label="Instagram">
                                <i className="ph ph-instagram-logo"></i>
                            </a>

                            <a href="#" aria-label="Twitter">
                                <i className="ph ph-twitter-logo"></i>
                            </a>

                            <a href="#" aria-label="Discord">
                                <i className="ph ph-discord-logo"></i>
                            </a>

                            <a href="#" aria-label="YouTube">
                                <i className="ph ph-youtube-logo"></i>
                            </a>

                        </div>

                    </div>

                </div>

                <div className="footer-bottom">

                    <p>
                        &copy; 2026 Plataforma PI_UC3 - Anime Spot.
                        Todos os direitos reservados.
                    </p>

                </div>

            </footer>
        </>
    );
}

export default Planos;