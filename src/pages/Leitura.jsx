import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/leitura.css';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '/supabase';

function Leitura() {
    const params = useParams();
    const identificador = params.id || params.tituloObra;

    const [obraTitulo, setObraTitulo] = useState("Carregando...");
    const [capituloAtual, setCapituloAtual] = useState(1);
    const [dadosObra, setDadosObra] = useState(null);
    const [listaCapitulos, setListaCapitulos] = useState([]);
    const [conteudoCapitulo, setConteudoCapitulo] = useState('');

    // 1. Carrega os dados da obra e os capítulos
    useEffect(() => {
        async function carregarObraECapitulos() {
            if (!identificador) return;

            let query = supabase.from('obras').select('*');

            if (!isNaN(identificador)) {
                query = query.eq('id', identificador);
            } else {
                const tituloLimpo = decodeURIComponent(identificador).trim();
                setObraTitulo(tituloLimpo);
                query = query.ilike('titulo', tituloLimpo);
            }

            const { data: obraDataList, error: obraError } = await query.limit(1);

            if (obraError || !obraDataList || obraDataList.length === 0) {
                console.error("Erro ao buscar obra:", obraError?.message);
                setObraTitulo("Obra não encontrada");
                return;
            }

            const obraData = obraDataList[0];
            setDadosObra(obraData);
            setObraTitulo(obraData.titulo);

            // CORRIGIDO: Usando 'id_obra' e ordenando por 'numero_capitulo'
            const { data: capsData, error: capsError } = await supabase
                .from('capitulos')
                .select('*')
                .eq('id_obra', obraData.id)
                .order('numero_capitulo', { ascending: true });

            if (capsError) {
                console.error("Erro ao buscar capítulos:", capsError.message);
            } else {
                setListaCapitulos(capsData || []);
                if (capsData && capsData.length > 0) {
                    setCapituloAtual(capsData[0].numero_capitulo);
                }
            }
        }

        carregarObraECapitulos();
    }, [identificador]);

    // 2. Carrega o conteúdo do capítulo atual
    useEffect(() => {
        async function carregarConteudo() {
            if (!dadosObra || !dadosObra.id) return;

            // CORRIGIDO: Usando 'id_obra' e 'numero_capitulo'
            const { data, error } = await supabase
                .from('capitulos')
                .select('*')
                .eq('id_obra', dadosObra.id)
                .eq('numero_capitulo', capituloAtual)
                .limit(1);

            if (error || !data || data.length === 0) {
                setConteudoCapitulo(`Conteúdo do Capítulo ${capituloAtual} ainda não cadastrado.`);
            } else {
                const cap = data[0];
                setConteudoCapitulo(cap.conteudo || cap.titulo_capitulo || `Capítulo ${capituloAtual} carregado.`);
            }
        }

        carregarConteudo();
    }, [capituloAtual, dadosObra]);

    function handleCapituloChange(e) {
        setCapituloAtual(Number(e.target.value));
    }

    // 3. Botão Próximo Capítulo (numero_capitulo + 1)
    async function handleProximoCapitulo() {
        if (!dadosObra || !dadosObra.id) {
            alert("Erro: Obra ainda não foi totalmente carregada. Aguarde um instante.");
            return;
        }

        const proximoNumero = capituloAtual + 1;

        // CORRIGIDO: Usando 'id_obra' e 'numero_capitulo'
        const { data, error } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', dadosObra.id)
            .eq('numero_capitulo', proximoNumero)
            .limit(1);

        if (error || !data || data.length === 0) {
            alert("Você já está no último capítulo disponível desta obra!");
        } else {
            setCapituloAtual(proximoNumero);
        }
    }

    // 4. Botão Capítulo Anterior (numero_capitulo - 1)
    async function handleCapituloAnterior() {
        if (!dadosObra || !dadosObra.id) return;

        const anteriorNumero = capituloAtual - 1;
        if (anteriorNumero < 1) return;

        // CORRIGIDO: Usando 'id_obra' e 'numero_capitulo'
        const { data, error } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', dadosObra.id)
            .eq('numero_capitulo', anteriorNumero)
            .limit(1);

        if (!error && data && data.length > 0) {
            setCapituloAtual(anteriorNumero);
        }
    }

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
                        {listaCapitulos.length > 0 ? (
                            listaCapitulos.map(cap => (
                                <option key={cap.id} value={cap.numero_capitulo}>
                                    Capítulo {cap.numero_capitulo} {cap.titulo_capitulo ? `- ${cap.titulo_capitulo}` : ''}
                                </option>
                            ))
                        ) : (
                            <option value={capituloAtual}>Capítulo {capituloAtual}</option>
                        )}
                    </optgroup>
                </select>
            </div>

            <div className="info-progresso">
                <span>Progresso da Obra</span>
                <span>Capítulo {capituloAtual}</span>
            </div>
            <div className="progresso-container" title="Progresso da leitura">
                <div className="progresso-barra" style={{ width: '100%' }}></div>
            </div>

            <div className="leitura-container">
                <p>{conteudoCapitulo}</p>
            </div>

            <div className="controles">
                <button className="btn" onClick={handleCapituloAnterior}>
                    Capítulo Anterior
                </button>
                <button className="btn" onClick={handleProximoCapitulo}>
                    Próximo Capítulo
                </button>
            </div>
        </>
    );
}

export default Leitura;