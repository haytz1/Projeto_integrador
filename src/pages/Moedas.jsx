import '../css/moedas.css'
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Rodape from '../components/Rodape';
import NavbarPesquisa from '../components/Navbar_pesquisa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function Moedas() {

    const comprarMoedas = async (quantidade) => {

        const usuarioId = localStorage.getItem('usuario_id');

        if (!usuarioId) {
            alert('Faça login para comprar moedas.');
            return;
        }

        // Busca o saldo atual
        const { data: usuario, error: erroBusca } = await supabase
            .from('usuarios')
            .select('moedas')
            .eq('id', usuarioId)
            .single();

        if (erroBusca) {

            console.error(
                'Erro ao buscar moedas:',
                erroBusca
            );

            alert('Erro ao consultar suas moedas.');

            return;
        }

        const moedasAtuais = usuario.moedas || 0;

        // Mantém o limite de 150 moedas
        if (moedasAtuais >= 150) {

            alert(
                'Você já possui 150 moedas.'
            );

            return;
        }

        // Calcula quantas moedas ainda podem ser adicionadas
        const moedasDisponiveis = 150 - moedasAtuais;

        const moedasRecebidas = Math.min(
            quantidade,
            moedasDisponiveis
        );

        const novoSaldo =
            moedasAtuais + moedasRecebidas;


        // Atualiza o saldo no banco
        const { error: erroAtualizacao } = await supabase
            .from('usuarios')
            .update({
                moedas: novoSaldo
            })
            .eq('id', usuarioId);

        if (erroAtualizacao) {

            console.error(
                'Erro ao atualizar moedas:',
                erroAtualizacao
            );

            alert('Erro ao adicionar moedas.');

            return;
        }


        if (moedasRecebidas < quantidade) {

            alert(
                `Você recebeu ${moedasRecebidas} moedas.`
            );

        } else {

            alert(
                `Você recebeu ${moedasRecebidas} moedas!`
            );
        }
    };


    return (
        <>

            <NavbarPesquisa />

            <main className="container">

                {/* =========================================
                    CABEÇALHO
                ========================================== */}

                <header className="coins-header">

                    <h1 className="main-title">
                        Comprar Moedas
                    </h1>

                    <p>
                        Adquira moedas para utilizar nos recursos
                        disponíveis do Anime Spot.
                    </p>

                </header>


                {/* =========================================
                    CARDS DE MOEDAS
                ========================================== */}

                <section className="coins-grid">


                    {/* =====================================
                        50 MOEDAS
                    ====================================== */}

                    <article className="coin-card">

                        <div className="coin-header">

                            <i className="ph ph-coin coin-icon"></i>

                            <h2>
                                50 Moedas
                            </h2>

                            <div className="coin-price">

                                <span className="currency">
                                    R$
                                </span>

                                <span className="amount">
                                    5,00
                                </span>

                            </div>

                        </div>


                        <div className="coin-body">

                            <ul className="coin-features">

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    50 moedas adicionadas à sua conta
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Utilize para desbloquear conteúdos
                                </li>

                            </ul>


                            <button
                                className="btn-coin"
                                onClick={() => comprarMoedas(50)}
                            >
                                Comprar 50 moedas
                            </button>

                        </div>

                    </article>


                    {/* =====================================
                        100 MOEDAS
                    ====================================== */}

                    <article className="coin-card coin-featured">

                        <div className="featured-badge">
                            Mais Popular
                        </div>


                        <div className="coin-header">

                            <i className="ph ph-coin coin-icon"></i>

                            <h2>
                                100 Moedas
                            </h2>

                            <div className="coin-price">

                                <span className="currency">
                                    R$
                                </span>

                                <span className="amount">
                                    10,00
                                </span>

                            </div>

                        </div>


                        <div className="coin-body">

                            <ul className="coin-features">

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    100 moedas adicionadas à sua conta
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Utilize para desbloquear conteúdos
                                </li>

                            </ul>


                            <button
                                className="btn-coin"
                                onClick={() => comprarMoedas(100)}
                            >
                                Comprar 100 moedas
                            </button>

                        </div>

                    </article>


                    {/* =====================================
                        150 MOEDAS
                    ====================================== */}

                    <article className="coin-card">

                        <div className="coin-header">

                            <i className="ph ph-coin coin-icon"></i>

                            <h2>
                                150 Moedas
                            </h2>

                            <div className="coin-price">

                                <span className="currency">
                                    R$
                                </span>

                                <span className="amount">
                                    15,00
                                </span>

                            </div>

                        </div>


                        <div className="coin-body">

                            <ul className="coin-features">

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    150 moedas adicionadas à sua conta
                                </li>

                                <li>
                                    <i className="ph ph-check-circle"></i>
                                    Utilize para desbloquear conteúdos
                                </li>

                            </ul>


                            <button
                                className="btn-coin"
                                onClick={() => comprarMoedas(150)}
                            >
                                Comprar 150 moedas
                            </button>

                        </div>

                    </article>


                </section>


                {/* =========================================
                    LINK PARA PLANOS
                ========================================== */}

                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '40px'
                    }}
                >

                    <p>
                        Quer benefícios exclusivos?
                    </p>

                    <Link
                        to="/Planos"
                        className="plan-link"
                    >
                        Conheça os planos Premium
                    </Link>

                </div>

            </main>
<Rodape/>
        </>
    );
}

export default Moedas;