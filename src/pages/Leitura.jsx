import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../css/leitura.css';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

function Leitura() {
    // Captura o parâmetro da URL (ex: /leitura/Chama%20Negra)
    const { tituloObra } = useParams();

    // Decodifica a URL para transformar "Chama%20Negra" em "Chama Negra"
    const tituloFormatado = tituloObra ? decodeURIComponent(tituloObra) : "Sombras do Vazio";

    const [obraTitulo, setObraTitulo] = useState(tituloFormatado);
    const [dadosObra, setDadosObra] = useState(null);
    const [capituloAtual, setCapituloAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);

    // 1. Carrega as informações específicas da obra
    useEffect(() => {
        async function carregarDadosObra() {
            setCarregando(true);
            setObraTitulo(tituloFormatado);

            // Busca na tabela 'obras'
            const { data, error } = await supabase
                .from('obras')
                .select('*')
                .eq('titulo', tituloFormatado)
                .maybeSingle();

            if (!error && data) {
                setDadosObra(data);
            }
            setCarregando(false);
        }

        carregarDadosObra();
    }, [tituloObra]);

    // 2. Salva a leitura na tabela 'leitura'
    useEffect(() => {
        if (obraTitulo) {
            salvarProgressoLeitura(capituloAtual);
        }
    }, [capituloAtual, obraTitulo]);

    async function salvarProgressoLeitura(capitulo) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Se não estiver logado, não grava

        const { data: registroExistente } = await supabase
            .from('leitura')
            .select('*')
            .eq('email_usuario', user.email)
            .eq('obra_titulo', obraTitulo)
            .maybeSingle();

        if (registroExistente) {
            await supabase
                .from('leitura')
                .update({
                    ultimo_capitulo: capitulo,
                    status: 'Em andamento'
                })
                .eq('id', registroExistente.id);
        } else {
            await supabase
                .from('leitura')
                .insert([
                    {
                        email_usuario: user.email,
                        obra_titulo: obraTitulo,
                        ultimo_capitulo: capitulo,
                        status: 'Em andamento'
                    }
                ]);
        }
    }

    function handleCapituloChange(e) {
        const novoCapitulo = Number(e.target.value);
        setCapituloAtual(novoCapitulo);
    }

    if (carregando) {
        return (
            <>
                <Navbar />
                <div className="leitura-container">
                    <p>A carregar obra...</p>
                </div>
            </>
        );
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