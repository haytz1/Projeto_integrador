import { useState, useEffect } from 'react';
import NavbarPesquisa from '../components/Navbar_pesquisa';
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
    const [isFavorito, setIsFavorito] = useState(false);

    // Estados para controlar o Modal de Novo Capítulo
    const [modalAberto, setModalAberto] = useState(false);
    const [novoNumero, setNovoNumero] = useState('');
    const [novoTituloCap, setNovoTituloCap] = useState('');
    const [novoConteudo, setNovoConteudo] = useState('');
    const [novoEVip, setNovoEVip] = useState(false); // Estado para controlar se o capítulo é VIP

    function atualizarHistoricoLocal(obraId, obraTituloParam, numeroCapitulo) {
        const tituloParaSalvar = obraTituloParam || obraTitulo;
        if (!tituloParaSalvar || tituloParaSalvar === "Carregando...") return;

        const tituloLimpo = decodeURIComponent(tituloParaSalvar);

        // 1. Pega o identificador exato do utilizador logado no localStorage
        const usuarioId = localStorage.getItem('usuario_id') || localStorage.getItem('usuario_email') || 'convidado';

        // 2. Cria a mesma chave personalizada por utilizador
        const chaveHistorico = `manga_historico_${usuarioId}`;

        // 3. Lê o histórico específico deste utilizador
        const historicoAtual = JSON.parse(localStorage.getItem(chaveHistorico) || '[]');

        const index = historicoAtual.findIndex(item => item.obra_titulo?.toLowerCase() === tituloLimpo.toLowerCase());

        const dadosObraHistorico = {
            id_obra: obraId || 'temp-id',
            obra_titulo: tituloLimpo,
            ultimo_capitulo: numeroCapitulo || capituloAtual || 1,
            status: 'Lendo',
            ultima_atualizacao: new Date().toISOString()
        };

        if (index >= 0) {
            historicoAtual[index] = { ...historicoAtual[index], ...dadosObraHistorico };
        } else {
            historicoAtual.push(dadosObraHistorico);
        }

        // 4. Salva de volta usando a chave dinâmica do utilizador
        localStorage.setItem(chaveHistorico, JSON.stringify(historicoAtual));
    }

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

            // 1. Primeiro busca os capítulos da obra
            const listaCaps = await buscarCapitulos(obraData.id);

            // 2. Garante que pega o capítulo atual correto (ou o primeiro da lista se não houver outro selecionado)
            const capParaSalvar = capituloAtual || (listaCaps && listaCaps.length > 0 ? listaCaps[0].numero : 1);

            // 3. Salva no localStorage com o capítulo real
            atualizarHistoricoLocal(obraData.id, obraData.titulo, capParaSalvar);
        }

        carregarObraECapitulos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identificador]);

    // Função auxiliar para buscar a lista de capítulos
    async function buscarCapitulos(obraId, selecionarCapitulo = null) {
        const { data: capsData, error: capsError } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', obraId)
            .order('numero_capitulo', { ascending: true });

        if (capsError) {
            console.error("Erro ao buscar capítulos:", capsError.message);
        } else {
            setListaCapitulos(capsData || []);
            if (capsData && capsData.length > 0) {
                if (selecionarCapitulo) {
                    setCapituloAtual(selecionarCapitulo);
                } else {
                    setCapituloAtual(capsData[0].numero_capitulo);
                }
            }
        }
    }

    // 2. Carrega o conteúdo do capítulo atual
    useEffect(() => {
        async function carregarConteudo() {
            if (!dadosObra || !dadosObra.id) return;

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
                setConteudoCapitulo(cap.conteudo || `Capítulo ${capituloAtual} sem conteúdo.`);
            }
        }

        carregarConteudo();
    }, [capituloAtual, dadosObra]);

    useEffect(() => {
        async function verificarFavorito() {
            if (!dadosObra || !dadosObra.id) return;
            const uId = localStorage.getItem('usuario_id');
            if (!uId) return;

            const { data } = await supabase
                .from('favoritos')
                .select('*')
                .eq('usuario_id', uId)
                .eq('obra_id', dadosObra.id)
                .maybeSingle();

            if (data) {
                setIsFavorito(true);
            } else {
                setIsFavorito(false);
            }
        }
        verificarFavorito();
    }, [dadosObra]);

    async function handleFavoritar() {
        const uId = localStorage.getItem('usuario_id');
        if (!uId) {
            alert('Você precisa estar logado para favoritar uma obra.');
            return;
        }

        if (isFavorito) {
            const { error } = await supabase
                .from('favoritos')
                .delete()
                .eq('usuario_id', uId)
                .eq('obra_id', dadosObra.id);
            if (!error) setIsFavorito(false);
        } else {
            const { error } = await supabase
                .from('favoritos')
                .insert([{ usuario_id: uId, obra_id: dadosObra.id }]);
            if (!error) setIsFavorito(true);
        }
    }

    function handleCapituloChange(e) {
        setCapituloAtual(Number(e.target.value));
    }

    // Função inteligente para abrir o modal calculando o próximo número de capítulo
    function abrirModalNovoCapitulo() {
        if (listaCapitulos.length > 0) {
            const maioresNumeros = listaCapitulos.map(c => c.numero_capitulo);
            const maiorCapitulo = Math.max(...maioresNumeros);
            setNovoNumero(maiorCapitulo + 1);
        } else {
            setNovoNumero(1);
        }
        setNovoTituloCap('');
        setNovoConteudo('');
        setNovoEVip(false);
        setModalAberto(true);
    }

    // Função para criar o novo capítulo no Supabase
    async function handleCriarCapitulo(e) {
        e.preventDefault();
        if (!dadosObra || !dadosObra.id) return;

        const numParsed = Number(novoNumero);
        if (!numParsed) {
            alert("Insira um número de capítulo válido.");
            return;
        }

        const { error } = await supabase
            .from('capitulos')
            .insert([
                {
                    id_obra: dadosObra.id,
                    numero_capitulo: numParsed,
                    titulo_capitulo: novoTituloCap || `Capítulo ${numParsed}`,
                    conteudo: novoConteudo || 'Conteúdo padrão do capítulo.',
                    e_vip: novoEVip,
                    valor_moeda: null
                }
            ]);

        if (error) {
            console.error("Erro ao inserir capítulo:", error.message);
            alert("Erro ao criar capítulo. Verifique os dados.");
        } else {
            alert("Capítulo criado com sucesso!");
            setModalAberto(false);
            await buscarCapitulos(dadosObra.id, numParsed);
        }
    }

    function handleCapituloChange(e) {
        const novoCap = Number(e.target.value);
        setCapituloAtual(novoCap);

        if (dadosObra) {
            atualizarHistoricoLocal(dadosObra.id, dadosObra.titulo, novoCap);
        }
    }

    // 4. Botão Próximo Capítulo
    async function handleProximoCapitulo() {
        if (!dadosObra || !dadosObra.id) return;

        const proximoNumero = capituloAtual + 1;
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
            // Salva o novo capítulo no histórico
            atualizarHistoricoLocal(dadosObra.id, dadosObra.titulo, proximoNumero);
        }
    }

    // 5. Botão Capítulo Anterior
    async function handleCapituloAnterior() {
        if (!dadosObra || !dadosObra.id) return;

        const anteriorNumero = capituloAtual - 1;
        if (anteriorNumero < 1) return;

        const { data, error } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', dadosObra.id)
            .eq('numero_capitulo', anteriorNumero)
            .limit(1);

        if (!error && data && data.length > 0) {
            setCapituloAtual(anteriorNumero);
            // Salva o capítulo anterior no histórico
            atualizarHistoricoLocal(dadosObra.id, dadosObra.titulo, anteriorNumero);
        }
    }

    return (
        <>
            <NavbarPesquisa />

            {/* Container limpo apenas com classes */}
            <div className="container-voltar">
                <Link to="/ObrasMangas" className="btn-voltar">
                    ⭠ Voltar
                </Link>
            </div>

            <div className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1>{obraTitulo}</h1>
                    {dadosObra && (
                        <button 
                            onClick={handleFavoritar} 
                            style={{ 
                                background: isFavorito ? 'linear-gradient(135deg, #c384ff, #8b5cf6)' : 'rgba(139, 92, 246, 0.1)', 
                                border: '1px solid #c384ff', 
                                color: isFavorito ? '#fff' : '#c384ff', 
                                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontWeight: 'bold', transition: 'all 0.2s'
                            }}
                        >
                            {isFavorito ? '❤️ Favoritado' : '🤍 Favoritar'}
                        </button>
                    )}
                </div>
                <select
                    className="capitulos"
                    value={capituloAtual}
                    onChange={handleCapituloChange}
                >
                    <optgroup label="Capítulos">
                        {listaCapitulos.length > 0 ? (
                            listaCapitulos.map(cap => (
                                <option key={cap.id} value={cap.numero_capitulo}>
                                    Capítulo {cap.numero_capitulo} {cap.titulo_capitulo ? `- ${cap.titulo_capitulo}` : ''} {cap.e_vip ? '⭐ (VIP)' : ''}
                                </option>
                            ))
                        ) : (
                            <option value={capituloAtual}>Capítulo {capituloAtual}</option>
                        )}
                    </optgroup>
                </select>

                <button className="btn btn-novo-capitulo" onClick={abrirModalNovoCapitulo}>
                    + Novo Capítulo
                </button>
            </div>

            {/* Modal de cadastro de capítulo com opção VIP */}
            {modalAberto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: '#1e1e2f', padding: '25px', borderRadius: '8px', width: '400px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3>Adicionar Novo Capítulo</h3>
                        <form onSubmit={handleCriarCapitulo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label>Número do Capítulo:</label>
                            <input
                                type="number"
                                value={novoNumero}
                                onChange={e => setNovoNumero(e.target.value)}
                                placeholder="Ex: 5"
                                required
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a40', color: '#fff' }}
                            />

                            <label>Título do Capítulo (Opcional):</label>
                            <input
                                type="text"
                                value={novoTituloCap}
                                onChange={e => setNovoTituloCap(e.target.value)}
                                placeholder="Ex: O Despertar"
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a40', color: '#fff' }}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                                <input
                                    type="checkbox"
                                    id="vipCheck"
                                    checked={novoEVip}
                                    onChange={e => setNovoEVip(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="vipCheck" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    Capítulo VIP (Conteúdo Pago)
                                </label>
                            </div>

                            <label>Conteúdo / Texto:</label>
                            <textarea
                                value={novoConteudo}
                                onChange={e => setNovoConteudo(e.target.value)}
                                placeholder="Escreva o texto do capítulo aqui..."
                                rows="4"
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a40', color: '#fff' }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" className="btn" onClick={() => setModalAberto(false)} style={{ backgroundColor: '#444' }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn" style={{ backgroundColor: '#6200ea' }}>
                                    Salvar Capítulo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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