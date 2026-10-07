
import '../css/planos.css';

import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { supabase } from '../../supabase';

import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import Checkout from '../components/Checkout';

// Nome e preço mensal de cada plano
const PLANOS = {
    gratuito: { nome: 'Gratuito', preco: 0 },
    premium: { nome: 'Premium', preco: 15 }
};

function Planos() {

    const [planoAtual, setPlanoAtual] = useState(null);
    const [salvando, setSalvando] = useState(null);

    // Aviso que aparece na tela (no lugar do alert): { tipo: 'sucesso' | 'erro', titulo, texto }
    const [aviso, setAviso] = useState(null);

    // Plano pago escolhido: abre a tela de pagamento (null = fechada)
    const [planoNoCheckout, setPlanoNoCheckout] = useState(null);

    // Mostra o plano atual assim que a página abre
    useEffect(() => {
        async function buscarPlano() {
            const usuarioId = localStorage.getItem('usuario_id');
            if (!usuarioId) return;

            const { data } = await supabase
                .from('usuarios')
                .select('plano')
                .eq('id', usuarioId)
                .maybeSingle();

            if (data) {
                // No banco o plano aparece escrito de jeitos diferentes
                // ("Premium", "premium", "Gratuito"...), então padroniza aqui
                const plano = (data.plano || '').toLowerCase().includes('premium')
                    ? 'premium'
                    : 'gratuito';

                setPlanoAtual(plano);
            }
        }

        buscarPlano();
    }, []);

    // Clique no botão do plano: confere o login.
    // Plano pago abre a tela de pagamento; o gratuito troca direto.
    const clicarNoPlano = (plano) => {

        setAviso(null);

        if (!localStorage.getItem('usuario_id')) {

            setAviso({
                tipo: 'erro',
                titulo: 'Você não está logado',
                texto: 'Faça login para escolher um plano.'
            });

            return;
        }

        if (PLANOS[plano].preco > 0) {
            setPlanoNoCheckout(plano);
        } else {
            escolherPlano(plano);
        }
    };

    // Grava o plano no banco (metodo = como pagou, só nos planos pagos)
    const escolherPlano = async (plano, metodo) => {

        const usuarioId = localStorage.getItem('usuario_id');

        setSalvando(plano);

        const { error } = await supabase
            .from('usuarios')
            .update({
                plano: plano
            })
            .eq('id', usuarioId);

        setSalvando(null);
        setPlanoNoCheckout(null);

        if (error) {

            console.error(
                'Erro ao atualizar plano:',
                error
            );

            setAviso({
                tipo: 'erro',
                titulo: 'Erro ao alterar o plano',
                texto: 'Nenhum valor foi cobrado. Tente novamente.'
            });

            return;
        }

        setPlanoAtual(plano);

        // Mostra na tela quanto vai ser cobrado
        if (PLANOS[plano].preco > 0) {
            setAviso({
                tipo: 'sucesso',
                titulo: `Plano ${PLANOS[plano].nome} ativado!`,
                texto: `R$ ${PLANOS[plano].preco},00 por mês pagos com ${metodo} (pagamento simulado). Aproveite seus benefícios!`
            });
        } else {
            setAviso({
                tipo: 'sucesso',
                titulo: `Plano ${PLANOS[plano].nome} ativado!`,
                texto: 'Nenhum valor será cobrado.'
            });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    return (
        <>
            <NavbarPesquisa />

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

                    {planoAtual && (
                        <div className="plano-atual">
                            <i className="ph-fill ph-crown"></i>
                            Seu plano atual: <strong>{PLANOS[planoAtual]?.nome || planoAtual}</strong>
                        </div>
                    )}

                </header>


                {/* =========================================
                    AVISO DO PLANO (no lugar do alert)
                ========================================== */}

                {aviso && (
                    <div className={`aviso-plano aviso-plano-${aviso.tipo}`}>
                        <i className={`ph ${aviso.tipo === 'sucesso' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>

                        <div>
                            <strong>{aviso.titulo}</strong>
                            <span>{aviso.texto}</span>
                        </div>

                        <button onClick={() => setAviso(null)} aria-label="Fechar aviso">×</button>
                    </div>
                )}


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

                            </ul>


                            <button
                                className="btn-plan"
                                onClick={() =>
                                    clicarNoPlano('gratuito')
                                }
                                disabled={salvando !== null || planoAtual === 'gratuito'}
                            >
                                {planoAtual === 'gratuito'
                                    ? 'Seu plano atual'
                                    : salvando === 'gratuito' ? 'Salvando...' : 'Continuar com Gratuito'}
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
                                    Comentários em destaque
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Capítulos adiantados
                                </li>

                            </ul>


                            <button
                                className="btn-plan"
                                onClick={() =>
                                    clicarNoPlano('premium')
                                }
                                disabled={salvando !== null || planoAtual === 'premium'}
                            >
                                {planoAtual === 'premium'
                                    ? 'Seu plano atual'
                                    : salvando === 'premium' ? 'Assinando...' : 'Assinar Premium'}
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

            {/* TELA DE PAGAMENTO (abre ao clicar em Assinar Premium) */}
            <Checkout
                key={planoNoCheckout || 'fechado'}
                item={planoNoCheckout && {
                    titulo: `Plano ${PLANOS[planoNoCheckout].nome}`,
                    descricao: 'Badge de apoiador, comentários em destaque e capítulos adiantados.',
                    valor: PLANOS[planoNoCheckout].preco,
                    recorrente: true
                }}
                onFechar={() => setPlanoNoCheckout(null)}
                onPagar={(metodo) => escolherPlano(planoNoCheckout, metodo)}
            />


<Rodape/>           
        </>
    );
}

export default Planos;