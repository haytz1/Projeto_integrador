import { useState, useEffect, useRef, useCallback } from 'react';

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

    // Controle do capítulo VIP
    const [capituloAtualDados, setCapituloAtualDados] = useState(null);
    const [capituloDesbloqueado, setCapituloDesbloqueado] = useState(false);
    const [desbloqueando, setDesbloqueando] = useState(false);
    const [carregandoConteudo, setCarregandoConteudo] = useState(false);

    // Timer de desbloqueio automático (1 minuto = 60 segundos)
    const TIMER_DURACAO = 1 * 60; // 60 segundos
    const [timerSegundos, setTimerSegundos] = useState(null);
    const timerRef = useRef(null);
    const [desbloqueandoPorTimer, setDesbloqueandoPorTimer] = useState(false);

    // Modal de novo capítulo
    const [modalAberto, setModalAberto] = useState(false);
    const [novoNumero, setNovoNumero] = useState('');
    const [novoTituloCap, setNovoTituloCap] = useState('');
    const [novoConteudo, setNovoConteudo] = useState('');
    const [novoEVip, setNovoEVip] = useState(false);

    // =========================================================
    // HISTÓRICO
    // =========================================================

    function atualizarHistoricoLocal(obraId, obraTituloParam, numeroCapitulo) {

        const tituloParaSalvar = obraTituloParam || obraTitulo;

        if (!tituloParaSalvar || tituloParaSalvar === "Carregando...") {
            return;
        }

        const tituloLimpo = decodeURIComponent(tituloParaSalvar);

        const usuarioId =
            localStorage.getItem('usuario_id') ||
            localStorage.getItem('usuario_email') ||
            'convidado';

        const chaveHistorico = `manga_historico_${usuarioId}`;

        const historicoAtual = JSON.parse(
            localStorage.getItem(chaveHistorico) || '[]'
        );

        const index = historicoAtual.findIndex(
            item =>
                item.obra_titulo?.toLowerCase() === tituloLimpo.toLowerCase()
        );

        const dadosObraHistorico = {
            id_obra: obraId || 'temp-id',
            obra_titulo: tituloLimpo,
            ultimo_capitulo: numeroCapitulo || capituloAtual || 1,
            status: 'Lendo',
            ultima_atualizacao: new Date().toISOString()
        };

        if (index >= 0) {
            historicoAtual[index] = {
                ...historicoAtual[index],
                ...dadosObraHistorico
            };
        } else {
            historicoAtual.push(dadosObraHistorico);
        }

        localStorage.setItem(
            chaveHistorico,
            JSON.stringify(historicoAtual)
        );
    }

    // =========================================================
    // CARREGAR OBRA E CAPÍTULOS
    // =========================================================

    useEffect(() => {

        async function carregarObraECapitulos() {

            if (!identificador) {
                return;
            }

            let query = supabase
                .from('obras')
                .select('*');

            if (!isNaN(identificador)) {

                query = query.eq('id', identificador);

            } else {

                const tituloLimpo =
                    decodeURIComponent(identificador).trim();

                setObraTitulo(tituloLimpo);

                query = query.ilike('titulo', tituloLimpo);
            }

            const {
                data: obraDataList,
                error: obraError
            } = await query.limit(1);

            if (
                obraError ||
                !obraDataList ||
                obraDataList.length === 0
            ) {

                console.error(
                    "Erro ao buscar obra:",
                    obraError?.message
                );

                setObraTitulo("Obra não encontrada");

                return;
            }

            const obraData = obraDataList[0];

            setDadosObra(obraData);
            setObraTitulo(obraData.titulo);

            const listaCaps = await buscarCapitulos(
                obraData.id
            );

            const capParaSalvar =
                capituloAtual ||
                (
                    listaCaps &&
                    listaCaps.length > 0
                        ? listaCaps[0].numero_capitulo
                        : 1
                );

            atualizarHistoricoLocal(
                obraData.id,
                obraData.titulo,
                capParaSalvar
            );
        }

        carregarObraECapitulos();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identificador]);

    // =========================================================
    // BUSCAR CAPÍTULOS
    // =========================================================

    async function buscarCapitulos(
        obraId,
        selecionarCapitulo = null
    ) {

        const {
            data: capsData,
            error: capsError
        } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', obraId)
            .order('numero_capitulo', {
                ascending: true
            });

        if (capsError) {

            console.error(
                "Erro ao buscar capítulos:",
                capsError.message
            );

            return [];

        } else {

            setListaCapitulos(capsData || []);

            if (capsData && capsData.length > 0) {

                if (selecionarCapitulo) {

                    setCapituloAtual(selecionarCapitulo);

                } else {

                    setCapituloAtual(
                        capsData[0].numero_capitulo
                    );
                }
            }

            return capsData || [];
        }
    }

    // =========================================================
    // VERIFICAR SE CAPÍTULO VIP ESTÁ DESBLOQUEADO
    // =========================================================

    async function verificarDesbloqueio(capituloId) {

        const usuarioId =
            localStorage.getItem('usuario_id');

        if (!usuarioId) {
            return false;
        }

        const {
            data,
            error
        } = await supabase
            .from('leitura')
            .select('desbloqueado')
            .eq('id_usuario', usuarioId)
            .eq('id_capitulo', capituloId)
            .maybeSingle();

        if (error) {

            console.error(
                "Erro ao verificar desbloqueio:",
                error.message
            );

            return false;
        }

        return data?.desbloqueado === true;
    }

    // =========================================================
    // CARREGAR CONTEÚDO DO CAPÍTULO
    // =========================================================

    useEffect(() => {

        async function carregarConteudo() {

            if (!dadosObra || !dadosObra.id) {
                return;
            }

            setCarregandoConteudo(true);

            setConteudoCapitulo('');
            setCapituloAtualDados(null);
            setCapituloDesbloqueado(false);

            const {
                data,
                error
            } = await supabase
                .from('capitulos')
                .select('*')
                .eq('id_obra', dadosObra.id)
                .eq('numero_capitulo', capituloAtual)
                .limit(1);

            if (
                error ||
                !data ||
                data.length === 0
            ) {

                setConteudoCapitulo(
                    `Conteúdo do Capítulo ${capituloAtual} ainda não cadastrado.`
                );

                setCarregandoConteudo(false);

                return;
            }

            const cap = data[0];

            setCapituloAtualDados(cap);

            // =================================================
            // CAPÍTULO NORMAL
            // =================================================

            if (!cap.e_vip) {

                setCapituloDesbloqueado(true);

                setConteudoCapitulo(
                    cap.conteudo ||
                    `Capítulo ${capituloAtual} sem conteúdo.`
                );

                setCarregandoConteudo(false);

                return;
            }

            // =================================================
            // CAPÍTULO VIP
            // =================================================

            const desbloqueado =
                await verificarDesbloqueio(cap.id);

            setCapituloDesbloqueado(desbloqueado);

            if (desbloqueado) {

                setConteudoCapitulo(
                    cap.conteudo ||
                    `Capítulo ${capituloAtual} sem conteúdo.`
                );

            } else {

                const valor =
                    cap.valor_moeda || 10;

                setConteudoCapitulo(
                    `🔒 Este é um capítulo VIP.

Para ler este capítulo, você precisa desbloqueá-lo por ${valor} moedas.`
                );
            }

            setCarregandoConteudo(false);
        }

        carregarConteudo();

    }, [capituloAtual, dadosObra]);

    // =========================================================
    // TIMER DE DESBLOQUEIO AUTOMÁTICO
    // =========================================================

    // Função para desbloquear capítulo pelo timer (sem gastar moedas)
    const desbloquearPorTimer = useCallback(async (cap) => {

        if (!cap || !cap.e_vip) return;

        setDesbloqueandoPorTimer(true);

        try {

            const usuarioId = localStorage.getItem('usuario_id');

            // Se estiver logado, tenta salvar no banco
            if (usuarioId) {

                // Verifica se já foi desbloqueado (por moedas) antes do timer terminar
                const jaDesbloqueado = await verificarDesbloqueio(cap.id);

                if (!jaDesbloqueado) {

                    const { error } = await supabase
                        .from('leitura')
                        .upsert(
                            {
                                id_usuario: usuarioId,
                                id_capitulo: cap.id,
                                desbloqueado: true
                            },
                            { onConflict: 'id_usuario,id_capitulo' }
                        );

                    if (error) {
                        console.error('Erro ao desbloquear capítulo pelo timer:', error.message);
                    }
                }
            }

            // Independente do login, exibe o conteúdo na tela
            setCapituloDesbloqueado(true);
            setConteudoCapitulo(
                cap.conteudo ||
                `Capítulo ${cap.numero_capitulo} sem conteúdo.`
            );

        } catch (err) {
            console.error('Erro inesperado no timer:', err);
            // Mesmo com erro, exibe o conteúdo localmente
            setCapituloDesbloqueado(true);
            setConteudoCapitulo(
                cap.conteudo ||
                `Capítulo ${cap.numero_capitulo} sem conteúdo.`
            );
        } finally {
            setDesbloqueandoPorTimer(false);
            setTimerSegundos(null);
        }

    }, []);

    // Inicia / reinicia o timer quando o capítulo VIP muda
    useEffect(() => {

        // Limpa qualquer timer anterior
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Só ativa o timer se:
        //  - há um capítulo carregado
        //  - ele é VIP
        //  - ainda não foi desbloqueado
        //  - não está carregando o conteúdo
        if (
            !capituloAtualDados ||
            !capituloAtualDados.e_vip ||
            capituloDesbloqueado ||
            carregandoConteudo
        ) {
            setTimerSegundos(null);
            return;
        }

        // Inicia o timer
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

        // Limpeza ao desmontar ou ao trocar de capítulo
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

    // =========================================================
    // DESBLOQUEAR CAPÍTULO
    // =========================================================

    async function handleDesbloquearCapitulo() {

        if (!capituloAtualDados) {
            return;
        }

        const usuarioId =
            localStorage.getItem('usuario_id');

        if (!usuarioId) {

            alert(
                'Você precisa estar logado para desbloquear um capítulo.'
            );

            return;
        }

        if (!capituloAtualDados.e_vip) {
            return;
        }

        if (capituloDesbloqueado) {
            return;
        }

        const valor =
            capituloAtualDados.valor_moeda || 10;

        const confirmar = window.confirm(
            `Desbloquear o Capítulo ${capituloAtualDados.numero_capitulo} por ${valor} moedas?`
        );

        if (!confirmar) {
            return;
        }

        setDesbloqueando(true);

        try {

            const {
                data,
                error
            } = await supabase.rpc(
                'desbloquear_capitulo',
                {
                    p_capitulo_id: capituloAtualDados.id
                }
            );

            if (error) {

                console.error(
                    'Erro ao desbloquear capítulo:',
                    error
                );

                alert(
                    'Não foi possível desbloquear o capítulo.'
                );

                return;
            }

            if (!data) {

                alert(
                    'Não foi possível concluir o desbloqueio.'
                );

                return;
            }

            if (!data.sucesso) {

                alert(
                    data.mensagem ||
                    'Não foi possível desbloquear o capítulo.'
                );

                return;
            }

            // Capítulo foi desbloqueado
            setCapituloDesbloqueado(true);

            setConteudoCapitulo(
                capituloAtualDados.conteudo ||
                `Capítulo ${capituloAtualDados.numero_capitulo} sem conteúdo.`
            );

            alert(
                `${data.mensagem}\n\nMoedas restantes: ${data.moedas}`
            );

        } catch (erro) {

            console.error(
                'Erro inesperado:',
                erro
            );

            alert(
                'Ocorreu um erro ao desbloquear o capítulo.'
            );

        } finally {

            setDesbloqueando(false);
        }
    }

    // =========================================================
    // FAVORITO
    // =========================================================

    useEffect(() => {

        async function verificarFavorito() {

            if (!dadosObra || !dadosObra.id) {
                return;
            }

            const uId =
                localStorage.getItem('usuario_id');

            if (!uId) {
                return;
            }

            const {
                data
            } = await supabase
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

    // =========================================================
    // FAVORITAR
    // =========================================================

    async function handleFavoritar() {

        const uId =
            localStorage.getItem('usuario_id');

        if (!uId) {

            alert(
                'Você precisa estar logado para favoritar uma obra.'
            );

            return;
        }

        if (isFavorito) {

            const {
                error
            } = await supabase
                .from('favoritos')
                .delete()
                .eq('usuario_id', uId)
                .eq('obra_id', dadosObra.id);

            if (!error) {
                setIsFavorito(false);
            }

        } else {

            const {
                error
            } = await supabase
                .from('favoritos')
                .insert([
                    {
                        usuario_id: uId,
                        obra_id: dadosObra.id
                    }
                ]);

            if (!error) {
                setIsFavorito(true);
            }
        }
    }

    // =========================================================
    // MUDAR CAPÍTULO
    // =========================================================

    function handleCapituloChange(e) {

        const novoCap =
            Number(e.target.value);

        setCapituloAtual(novoCap);

        if (dadosObra) {

            atualizarHistoricoLocal(
                dadosObra.id,
                dadosObra.titulo,
                novoCap
            );
        }
    }

    // =========================================================
    // NOVO CAPÍTULO
    // =========================================================

    function abrirModalNovoCapitulo() {

        if (listaCapitulos.length > 0) {

            const maioresNumeros =
                listaCapitulos.map(
                    c => c.numero_capitulo
                );

            const maiorCapitulo =
                Math.max(...maioresNumeros);

            setNovoNumero(
                maiorCapitulo + 1
            );

        } else {

            setNovoNumero(1);
        }

        setNovoTituloCap('');
        setNovoConteudo('');
        setNovoEVip(false);

        setModalAberto(true);
    }

    // =========================================================
    // CRIAR CAPÍTULO
    // =========================================================

    async function handleCriarCapitulo(e) {

        e.preventDefault();

        if (!dadosObra || !dadosObra.id) {
            return;
        }

        const numParsed =
            Number(novoNumero);

        if (!numParsed) {

            alert(
                "Insira um número de capítulo válido."
            );

            return;
        }

        const {
            error
        } = await supabase
            .from('capitulos')
            .insert([
                {
                    id_obra: dadosObra.id,
                    numero_capitulo: numParsed,
                    titulo_capitulo:
                        novoTituloCap ||
                        `Capítulo ${numParsed}`,
                    conteudo:
                        novoConteudo ||
                        'Conteúdo padrão do capítulo.',
                    e_vip: novoEVip,

                    // Capítulo VIP começa custando 10 moedas
                    valor_moeda:
                        novoEVip ? 10 : null
                }
            ]);

        if (error) {

            console.error(
                "Erro ao inserir capítulo:",
                error.message
            );

            alert(
                "Erro ao criar capítulo. Verifique os dados."
            );

        } else {

            alert(
                "Capítulo criado com sucesso!"
            );

            setModalAberto(false);

            await buscarCapitulos(
                dadosObra.id,
                numParsed
            );
        }
    }

    // =========================================================
    // PRÓXIMO CAPÍTULO
    // =========================================================

    async function handleProximoCapitulo() {

        if (!dadosObra || !dadosObra.id) {
            return;
        }

        const proximoNumero =
            capituloAtual + 1;

        const {
            data,
            error
        } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', dadosObra.id)
            .eq(
                'numero_capitulo',
                proximoNumero
            )
            .limit(1);

        if (
            error ||
            !data ||
            data.length === 0
        ) {

            alert(
                "Você já está no último capítulo disponível desta obra!"
            );

        } else {

            setCapituloAtual(
                proximoNumero
            );

            atualizarHistoricoLocal(
                dadosObra.id,
                dadosObra.titulo,
                proximoNumero
            );
        }
    }

    // =========================================================
    // CAPÍTULO ANTERIOR
    // =========================================================

    async function handleCapituloAnterior() {

        if (!dadosObra || !dadosObra.id) {
            return;
        }

        const anteriorNumero =
            capituloAtual - 1;

        if (anteriorNumero < 1) {
            return;
        }

        const {
            data,
            error
        } = await supabase
            .from('capitulos')
            .select('*')
            .eq('id_obra', dadosObra.id)
            .eq(
                'numero_capitulo',
                anteriorNumero
            )
            .limit(1);

        if (
            !error &&
            data &&
            data.length > 0
        ) {

            setCapituloAtual(
                anteriorNumero
            );

            atualizarHistoricoLocal(
                dadosObra.id,
                dadosObra.titulo,
                anteriorNumero
            );
        }
    }

    // =========================================================
    // VALOR DO CAPÍTULO
    // =========================================================

    const valorCapitulo =
        capituloAtualDados?.valor_moeda || 10;

    // =========================================================
    // TELA
    // =========================================================

    return (
        <>
            <NavbarPesquisa />

            <div className="container-voltar">

                <Link
                    to="/ObrasMangas"
                    className="btn-voltar"
                >
                    ⭠ Voltar
                </Link>

            </div>

            <div className="header">

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}
                >

                    <h1>
                        {obraTitulo}
                    </h1>

                    {dadosObra && (

                        <button
                            onClick={handleFavoritar}
                            style={{
                                background:
                                    isFavorito
                                        ? 'linear-gradient(135deg, #c384ff, #8b5cf6)'
                                        : 'rgba(139, 92, 246, 0.1)',

                                border:
                                    '1px solid #c384ff',

                                color:
                                    isFavorito
                                        ? '#fff'
                                        : '#c384ff',

                                padding:
                                    '8px 16px',

                                borderRadius:
                                    '20px',

                                cursor:
                                    'pointer',

                                display:
                                    'flex',

                                alignItems:
                                    'center',

                                gap:
                                    '6px',

                                fontWeight:
                                    'bold',

                                transition:
                                    'all 0.2s'
                            }}
                        >

                            {isFavorito
                                ? '❤️ Favoritado'
                                : '🤍 Favoritar'
                            }

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

                                <option
                                    key={cap.id}
                                    value={cap.numero_capitulo}
                                >

                                    Capítulo {cap.numero_capitulo}

                                    {cap.titulo_capitulo
                                        ? ` - ${cap.titulo_capitulo}`
                                        : ''
                                    }

                                    {cap.e_vip
                                        ? ' ⭐ (VIP)'
                                        : ''
                                    }

                                </option>
                            ))

                        ) : (

                            <option
                                value={capituloAtual}
                            >
                                Capítulo {capituloAtual}
                            </option>
                        )}

                    </optgroup>

                </select>

                <button
                    className="btn btn-novo-capitulo"
                    onClick={abrirModalNovoCapitulo}
                >
                    + Novo Capítulo
                </button>

            </div>

            {/* =================================================
                MODAL NOVO CAPÍTULO
            ================================================= */}

            {modalAberto && (

                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor:
                            'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                        zIndex: 1000
                    }}
                >

                    <div
                        style={{
                            backgroundColor:
                                '#1e1e2f',
                            padding:
                                '25px',
                            borderRadius:
                                '8px',
                            width:
                                '400px',
                            color:
                                '#fff',
                            display:
                                'flex',
                            flexDirection:
                                'column',
                            gap:
                                '12px'
                        }}
                    >

                        <h3>
                            Adicionar Novo Capítulo
                        </h3>

                        <form
                            onSubmit={
                                handleCriarCapitulo
                            }
                            style={{
                                display:
                                    'flex',
                                flexDirection:
                                    'column',
                                gap:
                                    '10px'
                            }}
                        >

                            <label>
                                Número do Capítulo:
                            </label>

                            <input
                                type="number"
                                value={novoNumero}
                                onChange={
                                    e =>
                                        setNovoNumero(
                                            e.target.value
                                        )
                                }
                                placeholder="Ex: 5"
                                required
                                style={{
                                    padding:
                                        '8px',
                                    borderRadius:
                                        '4px',
                                    border:
                                        '1px solid #444',
                                    backgroundColor:
                                        '#2a2a40',
                                    color:
                                        '#fff'
                                }}
                            />

                            <label>
                                Título do Capítulo (Opcional):
                            </label>

                            <input
                                type="text"
                                value={novoTituloCap}
                                onChange={
                                    e =>
                                        setNovoTituloCap(
                                            e.target.value
                                        )
                                }
                                placeholder="Ex: O Despertar"
                                style={{
                                    padding:
                                        '8px',
                                    borderRadius:
                                        '4px',
                                    border:
                                        '1px solid #444',
                                    backgroundColor:
                                        '#2a2a40',
                                    color:
                                        '#fff'
                                }}
                            />

                            <div
                                style={{
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    gap:
                                        '8px',
                                    marginTop:
                                        '5px'
                                }}
                            >

                                <input
                                    type="checkbox"
                                    id="vipCheck"
                                    checked={novoEVip}
                                    onChange={
                                        e =>
                                            setNovoEVip(
                                                e.target.checked
                                            )
                                    }
                                    style={{
                                        width:
                                            '18px',
                                        height:
                                            '18px',
                                        cursor:
                                            'pointer'
                                    }}
                                />

                                <label
                                    htmlFor="vipCheck"
                                    style={{
                                        cursor:
                                            'pointer',
                                        userSelect:
                                            'none'
                                    }}
                                >
                                    Capítulo VIP
                                    (Conteúdo Pago)
                                </label>

                            </div>

                            {novoEVip && (

                                <div
                                    style={{
                                        background:
                                            '#2a2a40',
                                        padding:
                                            '10px',
                                        borderRadius:
                                            '6px',
                                        color:
                                            '#c384ff'
                                    }}
                                >
                                    ⭐ Este capítulo custará
                                    <strong> 10 moedas</strong>.
                                </div>
                            )}

                            <label>
                                Conteúdo / Texto:
                            </label>

                            <textarea
                                value={novoConteudo}
                                onChange={
                                    e =>
                                        setNovoConteudo(
                                            e.target.value
                                        )
                                }
                                placeholder="Escreva o texto do capítulo aqui..."
                                rows="4"
                                style={{
                                    padding:
                                        '8px',
                                    borderRadius:
                                        '4px',
                                    border:
                                        '1px solid #444',
                                    backgroundColor:
                                        '#2a2a40',
                                    color:
                                        '#fff'
                                }}
                            />

                            <div
                                style={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'flex-end',
                                    gap:
                                        '10px',
                                    marginTop:
                                        '10px'
                                }}
                            >

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={
                                        () =>
                                            setModalAberto(
                                                false
                                            )
                                    }
                                    style={{
                                        backgroundColor:
                                            '#444'
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn"
                                    style={{
                                        backgroundColor:
                                            '#6200ea'
                                    }}
                                >
                                    Salvar Capítulo
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                PROGRESSO
            ================================================= */}

            <div className="info-progresso">

                <span>
                    Progresso da Obra
                </span>

                <span>
                    Capítulo {capituloAtual}
                </span>

            </div>

            <div
                className="progresso-container"
                title="Progresso da leitura"
            >

                <div
                    className="progresso-barra"
                    style={{
                        width: '100%'
                    }}
                >
                </div>

            </div>

            {/* =================================================
                CONTEÚDO
            ================================================= */}

            <div className="leitura-container">

                {carregandoConteudo ? (

                    <p>
                        Carregando capítulo...
                    </p>

                ) : (

                    <>
                        <p
                            style={{
                                whiteSpace:
                                    'pre-wrap'
                            }}
                        >
                            {conteudoCapitulo}
                        </p>

                        {/* =====================================
                            BOTÃO DESBLOQUEAR
                        ===================================== */}

                        {capituloAtualDados &&
                            capituloAtualDados.e_vip &&
                            !capituloDesbloqueado && (

                                <div
                                    style={{
                                        marginTop:
                                            '25px',
                                        padding:
                                            '25px',
                                        borderRadius:
                                            '12px',
                                        background:
                                            'rgba(139, 92, 246, 0.12)',
                                        border:
                                            '1px solid #8b5cf6',
                                        textAlign:
                                            'center'
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize:
                                                '40px',
                                            marginBottom:
                                                '10px'
                                        }}
                                    >
                                        🔒
                                    </div>

                                    <h3
                                        style={{
                                            color:
                                                '#c384ff'
                                        }}
                                    >
                                        Capítulo VIP
                                    </h3>

                                    <p>
                                        Este capítulo está
                                        bloqueado.
                                    </p>

                                    <p>
                                        Desbloqueie por{' '}
                                        <strong>
                                            {valorCapitulo}
                                            {' '}moedas
                                        </strong>
                                        {' '}ou aguarde o timer gratuito.
                                    </p>

                                    {/* ===========================
                                        TIMER DE DESBLOQUEIO (inline - resumido)
                                    =========================== */}

                                    {timerSegundos !== null && (
                                        <p style={{ fontSize: '13px', color: '#a78bfa', margin: '12px 0 0 0' }}>
                                            ⏳ Liberação automática em{' '}
                                            <strong style={{ fontFamily: 'monospace', fontSize: '15px', color: '#c084fc' }}>
                                                {formatarTimer(timerSegundos)}
                                            </strong>
                                            {' '}— acompanhe pelo contador flutuante.
                                        </p>
                                    )}

                                    {desbloqueandoPorTimer && (
                                        <p
                                            style={{
                                                color: '#a78bfa',
                                                fontStyle: 'italic',
                                                marginTop: '8px'
                                            }}
                                        >
                                            ✨ Desbloqueando automaticamente...
                                        </p>
                                    )}

                                    <button
                                        className="btn"
                                        onClick={
                                            handleDesbloquearCapitulo
                                        }
                                        disabled={
                                            desbloqueando
                                        }
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #c384ff, #8b5cf6)',
                                            color:
                                                '#fff',
                                            border:
                                                'none',
                                            padding:
                                                '12px 25px',
                                            borderRadius:
                                                '25px',
                                            cursor:
                                                desbloqueando
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                            fontWeight:
                                                'bold',
                                            marginTop:
                                                '10px'
                                        }}
                                    >

                                        {desbloqueando
                                            ? 'Desbloqueando...'
                                            : `🔓 Desbloquear por ${valorCapitulo} moedas`
                                        }

                                    </button>

                                </div>
                            )}

                    </>
                )}

            </div>

            {/* =================================================
                CONTROLES
            ================================================= */}

            <div className="controles">

                <button
                    className="btn"
                    onClick={
                        handleCapituloAnterior
                    }
                >
                    Capítulo Anterior
                </button>

                <button
                    className="btn"
                    onClick={
                        handleProximoCapitulo
                    }
                >
                    Próximo Capítulo
                </button>

            </div>

            {/* =================================================
                WIDGET FLUTUANTE DO TIMER VIP
            ================================================= */}

            {timerSegundos !== null &&
                capituloAtualDados?.e_vip &&
                !capituloDesbloqueado && (

                <div className={`vip-timer-widget${timerSegundos <= 15 ? ' vip-timer-urgent' : ''}`}>

                    {/* Anel SVG circular de progresso */}
                    <div className="vip-timer-ring-wrap">
                        <svg
                            className="vip-timer-svg"
                            viewBox="0 0 80 80"
                        >
                            {/* Trilho de fundo */}
                            <circle
                                cx="40" cy="40" r="34"
                                fill="none"
                                stroke="rgba(139,92,246,0.2)"
                                strokeWidth="6"
                            />
                            {/* Arco de progresso */}
                            <circle
                                cx="40" cy="40" r="34"
                                fill="none"
                                stroke={timerSegundos <= 15 ? '#f87171' : '#c084fc'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerSegundos / TIMER_DURACAO)}`}
                                style={{
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: '50% 50%',
                                    transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s'
                                }}
                            />
                        </svg>

                        {/* Ícone central */}
                        <span className="vip-timer-icon">
                            {timerSegundos <= 15 ? '🔥' : '⭐'}
                        </span>
                    </div>

                    {/* Contador mm:ss */}
                    <div className="vip-timer-digits">
                        {formatarTimer(timerSegundos)}
                    </div>

                    {/* Label */}
                    <div className="vip-timer-label">
                        {timerSegundos <= 15
                            ? 'Quase lá!'
                            : 'Liberação VIP'
                        }
                    </div>

                    {/* Barra linear de progresso */}
                    <div className="vip-timer-bar-track">
                        <div
                            className="vip-timer-bar-fill"
                            style={{
                                width: `${(timerSegundos / TIMER_DURACAO) * 100}%`,
                                background: timerSegundos <= 15
                                    ? 'linear-gradient(90deg, #f87171, #ef4444)'
                                    : 'linear-gradient(90deg, #c084fc, #8b5cf6)'
                            }}
                        />
                    </div>

                </div>
            )}

            {/* Animação de desbloqueio por timer */}
            {desbloqueandoPorTimer && (
                <div className="vip-timer-unlocking">
                    ✨ Desbloqueando automaticamente...
                </div>
            )}

        </>
    );
}

export default Leitura;