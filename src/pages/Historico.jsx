import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../../supabase';
import '../css/historico.css';

function Historico() {

    return (
        <>
            <Navbar />
            <Link to="/ObrasMangas" className="btn-voltar">← Voltar</Link>

            <main className="container">
                <header className="cabecalho-historico">
                    <h1>Histórico das histórias que você leu</h1>
                    <p>Histórias que você leu e pode continuar de onde parou</p>
                </header>

                <section className="lista-historico" aria-label="Histórico de leituras">
                    {loading ? (
                        <p style={{ color: '#fff', textAlign: 'center' }}>A carregar histórico...</p>
                    ) : historico.length === 0 ? (
                        <p style={{ color: '#fff', textAlign: 'center' }}>Nenhuma história encontrada no seu histórico.</p>
                    ) : (
                        historico.map((item) => (
                            <article className="item-historico" key={item.id}>
                                <div className="item-esquerda">
                                    <div className="capa capa-1">
                                        {item.obra_titulo ? item.obra_titulo.charAt(0).toUpperCase() : 'M'}
                                    </div>
                                    <div className="informacoes">
                                        <h2>{item.obra_titulo}</h2>
                                        <p>Último capítulo: {item.ultimo_capitulo}</p>
                                    </div>
                                </div>
                                <div className={`status ${getStatusClass(item.status)}`}>
                                    {(item.status === 'Concluído' || item.status === 'concluido') && (
                                        <span className="icone">✓</span>
                                    )}
                                    {item.status}
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Historico;