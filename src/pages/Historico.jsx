import '../css/historico.css'
import { Link } from 'react-router-dom';

function Historico() {
    return (

        <>
         
            <Link to="/ObrasMangas" className="btn-voltar">← Voltar</Link>

            <main className="container">
                <header className="cabecalho-historico">
                    <h1>Histórico das histórias que você leu</h1>
                    <p>Histórias que você leu e pode continuar de onde parou</p>
                </header>

                <section className="lista-historico" aria-label="Histórico de leituras">
                    <article className="item-historico">
                        <div className="item-esquerda">
                            <div className="capa capa-1">S</div>
                            <div className="informacoes">
                                <h2>Sombras do Vazio</h2>
                                <p>Último capítulo: 48</p>
                            </div>
                        </div>
                        <div className="status status-concluido"><span className="icone">✓</span>Concluído</div>
                    </article>

                    <article className="item-historico">
                        <div className="item-esquerda">
                            <div className="capa capa-2">L</div>
                            <div className="informacoes">
                                <h2>Luz Eterna</h2>
                                <p>Último capítulo: 112</p>
                            </div>
                        </div>
                        <div className="status status-andamento">Em andamento</div>
                    </article>

                    <article className="item-historico">
                        <div className="item-esquerda">
                            <div className="capa capa-3">F</div>
                            <div className="informacoes">
                                <h2>Fênix Rebelde</h2>
                                <p>Último capítulo: 19</p>
                            </div>
                        </div>
                        <div className="status status-abandonado">Abandonado</div>
                    </article>

                    <article className="item-historico">
                        <div className="item-esquerda">
                            <div className="capa capa-4">R</div>
                            <div className="informacoes">
                                <h2>Reino dos Ventos</h2>
                                <p>Último capítulo: 140</p>
                            </div>
                        </div>
                        <div className="status status-andamento">Em andamento</div>
                    </article>

                    <article className="item-historico">
                        <div className="item-esquerda">
                            <div className="capa capa-5">A</div>
                            <div className="informacoes">
                                <h2>Abismo Infinito</h2>
                                <p>Último capítulo: 33</p>
                            </div>
                        </div>
                        <div className="status status-concluido"><span className="icone">✓</span>Concluído</div>
                    </article>
                </section>
            </main>

        </>

    );
}

export default Historico;


