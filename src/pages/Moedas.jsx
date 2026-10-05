import '../css/moedas.css'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import Rodape from '../components/Rodape';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Checkout from '../components/Checkout';

// Preço de cada pacote de moedas (em reais)
const PRECOS = {
    50: 5,
    100: 10,
    150: 15
};

function formatarReais(valor) {
    return valor.toFixed(2).replace('.', ',');
}

function Moedas() {

    const [saldo, setSaldo] = useState(null);
    const [comprando, setComprando] = useState(null);

    // Aviso que aparece na tela (no lugar do alert): { tipo: 'sucesso' | 'erro', titulo, texto }
    const [aviso, setAviso] = useState(null);

    // Pacote escolhido: abre a tela de pagamento (null = fechada)
    const [pacoteNoCheckout, setPacoteNoCheckout] = useState(null);

    // Mostra o saldo atual assim que a página abre
    useEffect(() => {
        async function buscarSaldo() {
            const usuarioId = localStorage.getItem('usuario_id');
            if (!usuarioId) return;

            const { data } = await supabase
                .from('usuarios')
                .select('moedas')
                .eq('id', usuarioId)
                .maybeSingle();

            if (data) {
                setSaldo(data.moedas || 0);
            }
        }

        buscarSaldo();
    }, []);

    // Clique em "Comprar": confere o login e abre a tela de pagamento
    const abrirCheckout = (quantidade) => {

        setAviso(null);

        if (!localStorage.getItem('usuario_id')) {
            setAviso({
                tipo: 'erro',
                titulo: 'Você não está logado',
                texto: 'Faça login para comprar moedas.'
            });
            return;
        }

        setPacoteNoCheckout(quantidade);
    };

    // Chamada pela tela de pagamento depois do "pagamento"
    const comprarMoedas = async (quantidade, metodo) => {

        const usuarioId = localStorage.getItem('usuario_id');

        setComprando(quantidade);

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

            setAviso({
                tipo: 'erro',
                titulo: 'Erro na compra',
                texto: 'Não foi possível consultar suas moedas. Tente novamente.'
            });

            setComprando(null);
            setPacoteNoCheckout(null);

            return;
        }

        const moedasAtuais = usuario.moedas || 0;

        // Sem limite: soma a quantidade comprada ao saldo atual
        const novoSaldo =
            moedasAtuais + quantidade;

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

            setAviso({
                tipo: 'erro',
                titulo: 'Erro na compra',
                texto: 'Não foi possível adicionar as moedas. Nenhum valor foi cobrado.'
            });

            setComprando(null);
            setPacoteNoCheckout(null);

            return;
        }

        // Mostra na tela quanto foi cobrado e o novo saldo
        setSaldo(novoSaldo);
        setComprando(null);
        setPacoteNoCheckout(null);
        setAviso({
            tipo: 'sucesso',
            titulo: 'Compra concluída!',
            texto: `R$ ${formatarReais(PRECOS[quantidade])} pagos com ${metodo} (pagamento simulado) · +${quantidade} moedas · Saldo atual: ${novoSaldo} moedas`
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
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

                    {saldo !== null && (
                        <div className="saldo-atual">
                            <i className="ph-fill ph-coins"></i>
                            Seu saldo: <strong>{saldo} moedas</strong>
                        </div>
                    )}

                </header>


                {/* =========================================
                    AVISO DA COMPRA (no lugar do alert)
                ========================================== */}

                {aviso && (
                    <div className={`aviso-compra aviso-compra-${aviso.tipo}`}>
                        <i className={`ph ${aviso.tipo === 'sucesso' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>

                        <div>
                            <strong>{aviso.titulo}</strong>
                            <span>{aviso.texto}</span>
                        </div>

                        <button onClick={() => setAviso(null)} aria-label="Fechar aviso">×</button>
                    </div>
                )}


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
                                onClick={() => abrirCheckout(50)}
                                disabled={comprando !== null}
                            >
                                {comprando === 50 ? 'Comprando...' : 'Comprar 50 moedas'}
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
                                onClick={() => abrirCheckout(100)}
                                disabled={comprando !== null}
                            >
                                {comprando === 100 ? 'Comprando...' : 'Comprar 100 moedas'}
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
                                onClick={() => abrirCheckout(150)}
                                disabled={comprando !== null}
                            >
                                {comprando === 150 ? 'Comprando...' : 'Comprar 150 moedas'}
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

            {/* TELA DE PAGAMENTO (abre ao clicar em Comprar) */}
            <Checkout
                key={pacoteNoCheckout || 'fechado'}
                item={pacoteNoCheckout && {
                    titulo: `${pacoteNoCheckout} Moedas`,
                    descricao: 'Moedas adicionadas na hora à sua conta para desbloquear capítulos VIP.',
                    valor: PRECOS[pacoteNoCheckout],
                    recorrente: false
                }}
                onFechar={() => setPacoteNoCheckout(null)}
                onPagar={(metodo) => comprarMoedas(pacoteNoCheckout, metodo)}
            />

<Rodape/>
        </>
    );
}

export default Moedas;