import Navbar from '../components/Navbar';
import '../css/leitura.css'

function Leitura() {
    return (
        <>
    <Navbar/>
            <a href="obras_mangas.html" class="btn btn-voltar">⭠ Voltar</a>

            <div class="header">
                <h1>Sombras do Vazio</h1>
                <select class="capitulos">
                    <optgroup label="Capítulos">
                        <option value="1">Capítulo 1</option>
                        <option value="2">Capítulo 2</option>
                        <option value="3" selected>Capítulo 3</option>
                        <option value="4">Capítulo 4</option>
                        <option value="5">Capítulo 5</option>
                        <option value="... disabled">... (até cap 48)</option>
                    </optgroup>
                </select>
            </div>

            <div class="info-progresso">
                <span>Progresso da Obra</span>
                <span>50% (Página 10/20)</span>
            </div>
            <div class="progresso-container" title="Progresso da leitura">
                <div class="progresso-barra"></div>
            </div>

            <div class="leitura-container">
                <p>Conteúdo da obra "Sombras do Vazio" sendo visualizado aqui...</p>
            </div>

            <div class="controles">
                <a href="#" class="btn">Página Anterior</a>
                <a href="#" class="btn">Próxima Página</a>
            </div>

        </>
    );
}

export default Leitura;

