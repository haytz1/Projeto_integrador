import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/leitura.css';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

function Leitura() {

    return (
        <>
            <Navbar />
            <Link to="/ObrasMangas" className="btn btn-voltar">⭠ Voltar</Link>

            <div className="header">
                <h1>{obraTitulo}</h1>
                <select 
                    className="capitulos" 
                    value={capituloAtual} 
                    onChange={handleCapituloChange}
                >
                    <optgroup label="Capítulos">
                        <option value={1}>Capítulo 1</option>
                        <option value={2}>Capítulo 2</option>
                        <option value={3}>Capítulo 3</option>
                        <option value={4}>Capítulo 4</option>
                        <option value={5}>Capítulo 5</option>
                    </optgroup>
                </select>
            </div>

            <div className="info-progresso">
                <span>Progresso da Obra</span>
                <span>50% (Página 10/20)</span>
            </div>
            <div className="progresso-container" title="Progresso da leitura">
                <div className="progresso-barra"></div>
            </div>

            <div className="leitura-container">
                <p>
                    {dadosObra?.sinopse || `Conteúdo da obra "${obraTitulo}" - Capítulo ${capituloAtual} sendo visualizado aqui...`}
                </p>
            </div>

            <div className="controles">
                <button className="btn" onClick={() => setCapituloAtual(prev => Math.max(prev - 1, 1))}>
                    Página Anterior
                </button>
                <button className="btn" onClick={() => setCapituloAtual(prev => prev + 1)}>
                    Próxima Página
                </button>
            </div>
        </>
    );
}

export default Leitura;