<<<<<<< Updated upstream
=======
import React from 'react';
>>>>>>> Stashed changes

import '../css/planos.css';

import { Link } from 'react-router-dom';

import { createClient } from '@supabase/supabase-js';

import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

function Planos() {

    const escolherPlano = async (plano) => {

        const usuarioId = localStorage.getItem('usuario_id');

        if (!usuarioId) {

            alert('Faça login para escolher um plano.');

            return;
        }

        const { error } = await supabase
            .from('usuarios')
            .update({
                plano: plano
            })
            .eq('id', usuarioId);

        if (error) {

            console.error(
                'Erro ao atualizar plano:',
                error
            );

            alert('Erro ao alterar o plano.');

            return;
        }

        alert(
            `Plano ${plano} selecionado com sucesso!`
        );
    };


    return (
        <>
<<<<<<< Updated upstream
            <NavbarPesquisa />
=======

            <NavbarPesquisa />

>>>>>>> Stashed changes

            <main className="container">

                {/* =========================================
                    CABEÇALHO
                ========================================== */}

                <header className="plans-header">

                    <h1 className="main-title">
                        Escolha seu plano
                    </h1>

                    <p>
                        Tenha acesso a benefícios exclusivos
                        no Anime Spot.
                    </p>

                </header>


                {/* =========================================
                    PLANOS
                ========================================== */}

                <section className="plans-grid">


                    {/* =====================================
                        PLANO GRATUITO
                    ====================================== */}

                    <article className="plan-card">

                        <div className="plan-header">

                            <h2>
                                Gratuito
                            </h2>

                            <div className="plan-price">

                                <span className="currency">
                                    R$
                                </span>

                                <span className="amount">
                                    0
                                </span>

                                <span className="period">
                                    /mês
                                </span>

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

<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
                            </ul>


                            <button
                                className="btn-plan"
                                onClick={() =>
                                    escolherPlano('gratuito')
                                }
                            >
                                Continuar com Gratuito
                            </button>

                        </div>

                    </article>


                    {/* =====================================
                        PLANO PREMIUM
                    ====================================== */}

                    <article className="plan-card plan-featured">

                        <div className="featured-badge">
                            Mais Popular
                        </div>


                        <div className="plan-header">

                            <h2>
                                Premium
                            </h2>

                            <div className="plan-price">

                                <span className="currency">
                                    R$
                                </span>

                                <span className="amount">
                                    15
                                </span>

                                <span className="period">
                                    /mês
                                </span>

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
                                    Badge de Apoiador
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
<<<<<<< Updated upstream
                                    Sem anúncios em mangás
=======
                                    Comentários em destaque
>>>>>>> Stashed changes
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Capítulos adiantados
                                </li>

                            </ul>


                            <button
                                className="btn-plan"
                                onClick={() =>
                                    escolherPlano('premium')
                                }
                            >
                                Assinar Premium
                            </button>

                        </div>

                    </article>

                </section>


                {/* =========================================
                    LINK PARA MOEDAS
                ========================================== */}

                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '40px',
                        marginBottom: '40px'
                    }}
                >

                    <p>
                        Quer adquirir moedas?
                    </p>

                    <Link
                        to="/Moedas"
                        className="plan-link"
                    >
                        Comprar moedas
                    </Link>

                </div>

            </main>


<Rodape/>           
        </>
    );
}

export default Planos;