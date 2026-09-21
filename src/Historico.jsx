import './css/historico.css'

function Historico() {
    return (

        <>

            <a class="btn-voltar" href="obras_mangas.html">← Voltar</a>

            <main class="container">
                <header class="cabecalho-historico">
                    <h1>Histórico das histórias que você leu</h1>
                    <p>Histórias que você leu e pode continuar de onde parou</p>
                </header>

                <section class="lista-historico" aria-label="Histórico de leituras">
                    <article class="item-historico">
                        <div class="item-esquerda">
                            <div class="capa capa-1">S</div>
                            <div class="informacoes">
                                <h2>Sombras do Vazio</h2>
                                <p>Último capítulo: 48</p>
                            </div>
                        </div>
                        <div class="status status-concluido"><span class="icone">✓</span>Concluído</div>
                    </article>

                    <article class="item-historico">
                        <div class="item-esquerda">
                            <div class="capa capa-2">L</div>
                            <div class="informacoes">
                                <h2>Luz Eterna</h2>
                                <p>Último capítulo: 112</p>
                            </div>
                        </div>
                        <div class="status status-andamento">Em andamento</div>
                    </article>

                    <article class="item-historico">
                        <div class="item-esquerda">
                            <div class="capa capa-3">F</div>
                            <div class="informacoes">
                                <h2>Fênix Rebelde</h2>
                                <p>Último capítulo: 19</p>
                            </div>
                        </div>
                        <div class="status status-abandonado">Abandonado</div>
                    </article>

                    <article class="item-historico">
                        <div class="item-esquerda">
                            <div class="capa capa-4">R</div>
                            <div class="informacoes">
                                <h2>Reino dos Ventos</h2>
                                <p>Último capítulo: 140</p>
                            </div>
                        </div>
                        <div class="status status-andamento">Em andamento</div>
                    </article>

                    <article class="item-historico">
                        <div class="item-esquerda">
                            <div class="capa capa-5">A</div>
                            <div class="informacoes">
                                <h2>Abismo Infinito</h2>
                                <p>Último capítulo: 33</p>
                            </div>
                        </div>
                        <div class="status status-concluido"><span class="icone">✓</span>Concluído</div>
                    </article>
                </section>
            </main>

        </>

    );
}

export default Historico;


