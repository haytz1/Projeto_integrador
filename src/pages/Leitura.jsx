import { useState, useEffect, useRef, useCallback } from 'react';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import '../css/leitura.css';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '/supabase';

// Tempo de espera para ler um capítulo VIP de graça (em segundos)
const TIMER_DURACAO = 60;

function Leitura() {
    const params = useParams();
    const identificador = params.id || params.tituloObra;

    const [obraTitulo, setObraTitulo] = useState("Carregando...");
    const [capituloAtual, setCapituloAtual] = useState(1);
    const [dadosObra, setDadosObra] = useState(null);
    const [listaCapitulos, setListaCapitulos] = useState([]);
    // Fica true depois que a busca de capítulos termina (para não mostrar "sem capítulos" enquanto carrega)
    const [capitulosCarregados, setCapitulosCarregados] = useState(false);
    const [conteudoCapitulo, setConteudoCapitulo] = useState('');
    const [isFavorito, setIsFavorito] = useState(false);
    const [autorNome, setAutorNome] = useState('');
    const [sinopseAberta, setSinopseAberta] = useState(false);

    // Estados do capítulo VIP / moedas
    const [capituloAtualDados, setCapituloAtualDados] = useState(null);
    const [capituloDesbloqueado, setCapituloDesbloqueado] = useState(true);
    const [carregandoConteudo, setCarregandoConteudo] = useState(false);
    const [desbloqueando, setDesbloqueando] = useState(false);
    const [saldoMoedas, setSaldoMoedas] = useState(null);
    // Aviso que aparece na tela (no lugar do alert): { tipo: 'sucesso' | 'erro', texto }
    const [avisoMoedas, setAvisoMoedas] = useState(null);

    // Timer para desbloquear de graça
    const [timerSegundos, setTimerSegundos] = useState(null);
    const [desbloqueandoPorTimer, setDesbloqueandoPorTimer] = useState(false);
    const timerRef = useRef(null);

    // Estados para controlar o Modal de Novo Capítulo
    const [modalAberto, setModalAberto] = useState(false);
    const [novoNumero, setNovoNumero] = useState('');
    const [novoTituloCap, setNovoTituloCap] = useState('');
    const [novoConteudo, setNovoConteudo] = useState('');
    const [novoEVip, setNovoEVip] = useState(false); // Estado para controlar se o capítulo é VIP
    const [novoValorMoeda, setNovoValorMoeda] = useState(10); // Preço do capítulo VIP

    const usuarioId = localStorage.getItem('usuario_id');

    // Qualquer usuário logado pode adicionar capítulos
    const podeAdicionarCapitulo = !!usuarioId;

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

            // Busca o nome do autor para mostrar no topo
            if (obraData.autor_id) {
                const { data: autor } = await supabase
                    .from('usuarios')
                    .select('username')
                    .eq('id', obraData.autor_id)
                    .maybeSingle();

                setAutorNome(autor?.username || '');
            }

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
            setCapitulosCarregados(true);
        } else {
            setCapitulosCarregados(true);
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

    // Busca o saldo de moedas do usuário logado
    async function buscarSaldo() {
        if (!usuarioId) return;

        const { data } = await supabase
            .from('usuarios')
            .select('moedas')
            .eq('id', usuarioId)
            .maybeSingle();

        if (data) {
            setSaldoMoedas(data.moedas || 0);
        }
    }

    useEffect(() => {
        buscarSaldo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Verifica na tabela "leitura" se o usuário já desbloqueou o capítulo VIP
    async function verificarDesbloqueio(capituloId) {
        if (!usuarioId) return false;

        const { data, error } = await supabase
            .from('leitura')
            .select('desbloqueado')
            .eq('id_usuario', usuarioId)
            .eq('id_capitulo', capituloId)
            .maybeSingle();

        if (error) {
            console.error("Erro ao verificar desbloqueio:", error.message);
            return false;
        }

        return data?.desbloqueado === true;
    }

    // Salva no banco (tabela "leitura") que o usuário leu este capítulo.
    // Assim o histórico aparece em qualquer computador.
    // ignoreDuplicates: se a linha já existe (ex.: capítulo desbloqueado), não mexe nela.
    async function salvarHistoricoBanco(cap) {
        if (!usuarioId || !dadosObra) return;

        const { error } = await supabase
            .from('leitura')
            .upsert(
                {
                    id_usuario: usuarioId,
                    id_capitulo: cap.id,
                    email_usuario: localStorage.getItem('usuario_email') || null,
                    obra_titulo: dadosObra.titulo,
                    ultimo_capitulo: cap.numero_capitulo,
                    status: 'lendo'
                },
                { onConflict: 'id_usuario,id_capitulo', ignoreDuplicates: true }
            );

        if (error) {
            console.error('Erro ao salvar histórico:', error.message);
        }
    }

    // 2. Carrega o conteúdo do capítulo atual
    useEffect(() => {
        async function carregarConteudo() {
            if (!dadosObra || !dadosObra.id) return;

            setCarregandoConteudo(true);
            setConteudoCapitulo('');
            setCapituloAtualDados(null);
            setCapituloDesbloqueado(false);
            setAvisoMoedas(null);

            const { data, error } = await supabase
                .from('capitulos')
                .select('*')
                .eq('id_obra', dadosObra.id)
                .eq('numero_capitulo', capituloAtual)
                .limit(1);

            if (error || !data || data.length === 0) {
                setCapituloDesbloqueado(true);
                setConteudoCapitulo(`Conteúdo do Capítulo ${capituloAtual} ainda não cadastrado.`);
                setCarregandoConteudo(false);
                return;
            }

            const cap = data[0];
            setCapituloAtualDados(cap);

            // Capítulo normal ou VIP já desbloqueado: mostra o texto
            const liberado = !cap.e_vip || await verificarDesbloqueio(cap.id);

            setCapituloDesbloqueado(liberado);

            if (liberado) {
                setConteudoCapitulo(cap.conteudo || `Capítulo ${capituloAtual} sem conteúdo.`);
                salvarHistoricoBanco(cap);
            }

            setCarregandoConteudo(false);
        }

        carregarConteudo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capituloAtual, dadosObra]);

    // Desbloqueia o capítulo de graça quando o timer termina
    const desbloquearPorTimer = useCallback(async (cap) => {
        if (!cap || !cap.e_vip) return;

        setDesbloqueandoPorTimer(true);

        const idUsuario = localStorage.getItem('usuario_id');

        // Se estiver logado, salva no banco que o capítulo foi liberado
        if (idUsuario) {
            const { error } = await supabase
                .from('leitura')
                .upsert(
                    { id_usuario: idUsuario, id_capitulo: cap.id, desbloqueado: true },
                    { onConflict: 'id_usuario,id_capitulo' }
                );

            if (error) {
                console.error('Erro ao desbloquear capítulo pelo timer:', error.message);
            }
        }

        setCapituloDesbloqueado(true);
        setConteudoCapitulo(cap.conteudo || `Capítulo ${cap.numero_capitulo} sem conteúdo.`);
        setAvisoMoedas({
            tipo: 'sucesso',
            texto: `Capítulo ${cap.numero_capitulo} liberado de graça pelo tempo de espera. Nenhuma moeda foi descontada.`
        });
        setDesbloqueandoPorTimer(false);
        setTimerSegundos(null);
    }, []);

    // Inicia o timer quando abre um capítulo VIP ainda bloqueado
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!capituloAtualDados || !capituloAtualDados.e_vip || capituloDesbloqueado || carregandoConteudo) {
            setTimerSegundos(null);
            return;
        }

        setTimerSegundos(TIMER_DURACAO);

        const capSnapshot = capituloAtualDados;

        timerRef.current = setInterval(() => {
            setTimerSegundos(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    desbloquearPorTimer(capSnapshot);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [capituloAtualDados, capituloDesbloqueado, carregandoConteudo, desbloquearPorTimer]);

    // Formata os segundos em mm:ss
    function formatarTimer(segundos) {
        if (segundos === null) return '';
        const m = Math.floor(segundos / 60);
        const s = segundos % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // Desbloqueia o capítulo VIP gastando moedas (função desbloquear_capitulo do Supabase)
    async function handleDesbloquearCapitulo() {
        if (!capituloAtualDados || !capituloAtualDados.e_vip || capituloDesbloqueado) return;
        if (!usuarioId) return;

        const valor = capituloAtualDados.valor_moeda || 10;

        setDesbloqueando(true);
        setAvisoMoedas(null);

        const { data, error } = await supabase.rpc('desbloquear_capitulo', {
            p_capitulo_id: capituloAtualDados.id
        });

        setDesbloqueando(false);

        if (error || !data) {
            console.error('Erro ao desbloquear capítulo:', error);
            setAvisoMoedas({ tipo: 'erro', texto: 'Não foi possível desbloquear o capítulo. Tente novamente.' });
            return;
        }

        if (!data.sucesso) {
            setAvisoMoedas({ tipo: 'erro', texto: data.mensagem || 'Não foi possível desbloquear o capítulo.' });
            return;
        }

        // Deu certo: mostra o texto e o desconto na tela
        setCapituloDesbloqueado(true);
        setConteudoCapitulo(capituloAtualDados.conteudo || `Capítulo ${capituloAtualDados.numero_capitulo} sem conteúdo.`);
        setSaldoMoedas(data.moedas);
        setAvisoMoedas({
            tipo: 'sucesso',
            texto: `−${valor} moedas descontadas pelo Capítulo ${capituloAtualDados.numero_capitulo}. Saldo atual: ${data.moedas} moedas.`
        });
    }

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
        setNovoValorMoeda(10);
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
                    valor_moeda: novoEVip ? Number(novoValorMoeda) || 10 : null
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

    // Preço do capítulo VIP atual (10 moedas se não tiver valor cadastrado)
    const valorCapitulo = capituloAtualDados?.valor_moeda || 10;

    // Obra cadastrada, mas ainda sem nenhum capítulo
    const semCapitulos = capitulosCarregados && listaCapitulos.length === 0;

    // Progresso: posição do capítulo atual na lista de capítulos
    const posicaoCapitulo = listaCapitulos.findIndex(c => c.numero_capitulo === capituloAtual) + 1;
    const porcentagemProgresso = listaCapitulos.length > 0
        ? Math.round((posicaoCapitulo / listaCapitulos.length) * 100)
        : 0;

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
                {!semCapitulos && (
                <select
                    className="capitulos"
                    value={capituloAtual}
                    onChange={handleCapituloChange}
                >
                    <optgroup label="Capítulos">
                        {listaCapitulos.length > 0 ? (
                            listaCapitulos.map(cap => (
                                <option key={cap.id} value={cap.numero_capitulo}>
                                    {/* Não repete o título quando ele é só "Capítulo N" */}
                                    Capítulo {cap.numero_capitulo}
                                    {cap.titulo_capitulo && cap.titulo_capitulo !== `Capítulo ${cap.numero_capitulo}` ? ` - ${cap.titulo_capitulo}` : ''}
                                    {cap.e_vip ? ` 🔒 VIP (${cap.valor_moeda || 10} moedas)` : ''}
                                </option>
                            ))
                        ) : (
                            <option value={capituloAtual}>Capítulo {capituloAtual}</option>
                        )}
                    </optgroup>
                </select>
                )}

                {podeAdicionarCapitulo && (
                    <button className="btn btn-novo-capitulo" onClick={abrirModalNovoCapitulo}>
                        + Novo Capítulo
                    </button>
                )}
            </div>

            {/* Informações da obra: capa, autor, gênero e sinopse */}
            {dadosObra && (
                <section className="obra-info">
                    <img
                        className="obra-info-capa"
                        src={dadosObra.capa_url || `https://placehold.co/120x170/15092E/C384FF?text=${encodeURIComponent(dadosObra.titulo)}`}
                        alt={`Capa de ${dadosObra.titulo}`}
                    />

                    <div className="obra-info-texto">
                        <div className="obra-info-etiquetas">
                            {autorNome && (
                                <Link to={`/Perfil/${dadosObra.autor_id}`} className="obra-etiqueta">
                                    <i className="ph ph-user"></i> @{autorNome}
                                </Link>
                            )}
                            {dadosObra.genero_principal && (
                                <span className="obra-etiqueta">
                                    <i className="ph ph-tag"></i> {dadosObra.genero_principal}
                                </span>
                            )}
                            {dadosObra.status && (
                                <span className="obra-etiqueta">
                                    <i className="ph ph-flag"></i> {dadosObra.status}
                                </span>
                            )}
                            <span className="obra-etiqueta">
                                <i className="ph ph-books"></i> {listaCapitulos.length} {listaCapitulos.length === 1 ? 'capítulo' : 'capítulos'}
                            </span>
                        </div>

                        {dadosObra.sinopse && (
                            <>
                                <p className={sinopseAberta ? 'obra-sinopse aberta' : 'obra-sinopse'}>
                                    {dadosObra.sinopse}
                                </p>
                                {dadosObra.sinopse.length > 180 && (
                                    <button className="obra-ver-mais" onClick={() => setSinopseAberta(!sinopseAberta)}>
                                        {sinopseAberta ? 'Ver menos' : 'Ver mais'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>
            )}

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

                            {novoEVip && (
                                <>
                                    <label>Preço em moedas:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={novoValorMoeda}
                                        onChange={e => setNovoValorMoeda(e.target.value)}
                                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2a2a40', color: '#fff' }}
                                    />
                                </>
                            )}

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

            {semCapitulos ? (
                /* Obra sem capítulos: mostra aviso no lugar do leitor */
                <div className="leitura-container sem-capitulos">
                    <i className="ph ph-book-open"></i>
                    <h2>Esta obra ainda não tem capítulos</h2>
                    <p>
                        {souAutor
                            ? 'Clique em "+ Novo Capítulo" lá em cima para publicar o primeiro.'
                            : 'Favorite a obra para ser avisado quando o primeiro capítulo sair.'}
                    </p>
                </div>
            ) : (
            <>
            <div className="info-progresso">
                <span>Progresso da Obra</span>
                <span>
                    Capítulo {capituloAtual}
                    {listaCapitulos.length > 0 ? ` de ${listaCapitulos.length}` : ''}
                </span>
            </div>
            <div className="progresso-container" title="Progresso da leitura">
                <div className="progresso-barra" style={{ width: `${porcentagemProgresso}%` }}></div>
            </div>

            {/* Aviso de moedas (aparece na tela no lugar do alert) */}
            {avisoMoedas && (
                <div className={`aviso-moedas aviso-${avisoMoedas.tipo}`}>
                    <i className={`ph ${avisoMoedas.tipo === 'sucesso' ? 'ph-coins' : 'ph-warning-circle'}`}></i>
                    <span>{avisoMoedas.texto}</span>
                    <button onClick={() => setAvisoMoedas(null)} aria-label="Fechar aviso">×</button>
                </div>
            )}

            <div className="leitura-container">
                {carregandoConteudo ? (
                    <p>Carregando capítulo...</p>
                ) : capituloDesbloqueado ? (
                    <p>{conteudoCapitulo}</p>
                ) : (
                    /* Capítulo VIP bloqueado */
                    <div className="vip-bloqueado">
                        <i className="ph-fill ph-lock-key vip-cadeado"></i>
                        <h2>Capítulo VIP</h2>
                        <p>
                            Para ler o Capítulo {capituloAtualDados?.numero_capitulo} agora, serão
                            descontadas <strong>{valorCapitulo} moedas</strong> do seu saldo.
                        </p>

                        {usuarioId ? (
                            <>
                                <div className="vip-saldo">
                                    <span>Seu saldo: <strong>{saldoMoedas ?? '...'} moedas</strong></span>
                                    {saldoMoedas !== null && (
                                        <span>
                                            Depois do desbloqueio: <strong>{saldoMoedas - valorCapitulo} moedas</strong>
                                        </span>
                                    )}
                                </div>

                                {saldoMoedas !== null && saldoMoedas < valorCapitulo ? (
                                    <>
                                        <p className="vip-insuficiente">
                                            Você não tem moedas suficientes.
                                        </p>
                                        <Link to="/Moedas" className="btn vip-botao">
                                            Comprar moedas
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        className="btn vip-botao"
                                        onClick={handleDesbloquearCapitulo}
                                        disabled={desbloqueando || desbloqueandoPorTimer}
                                    >
                                        {desbloqueando
                                            ? 'Descontando moedas...'
                                            : `Desbloquear por ${valorCapitulo} moedas`}
                                    </button>
                                )}
                            </>
                        ) : (
                            <Link to="/Login" className="btn vip-botao">
                                Entrar para desbloquear
                            </Link>
                        )}

                        {timerSegundos !== null && (
                            <p className="vip-timer">
                                <i className="ph ph-timer"></i>
                                Ou espere <strong>{formatarTimer(timerSegundos)}</strong> para ler de graça
                            </p>
                        )}
                        {desbloqueandoPorTimer && (
                            <p className="vip-timer">Liberando capítulo...</p>
                        )}
                    </div>
                )}
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
            )}
        </>
    );
}

export default Leitura;