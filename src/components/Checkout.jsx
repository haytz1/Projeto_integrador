import { useEffect, useState } from 'react';
import './Checkout.css';

// =====================================================
// TELA DE PAGAMENTO SIMULADA
// Usada em Moedas.jsx e Planos.jsx.
// Nenhum dinheiro de verdade é cobrado: depois de "pagar",
// chama onPagar(metodo) e a página que abriu faz a compra no banco.
//
// Use com key={...} do item, para o formulário começar limpo:
//   <Checkout key={pacote} item={...} onFechar={...} onPagar={...} />
//
// Props:
//   item     = { titulo, descricao, valor, recorrente }  (null = fechado)
//   onFechar = fecha a tela
//   onPagar  = async (metodo) => {...}  metodo: 'cartão de crédito' | 'PIX'
// =====================================================

// Desenho de um QR code de mentira (21 × 21 quadradinhos), só para a tela do PIX
function gerarQrDemonstracao() {
    const tamanho = 21;
    const quadrados = [];
    let semente = 7;

    for (let linha = 0; linha < tamanho; linha++) {
        for (let coluna = 0; coluna < tamanho; coluna++) {
            // Os 3 quadrados grandes dos cantos de todo QR code
            const cantos = [[0, 0], [0, tamanho - 7], [tamanho - 7, 0]];
            const canto = cantos.find(([l, c]) =>
                linha >= l && linha < l + 7 && coluna >= c && coluna < c + 7
            );

            let preenchido;
            if (canto) {
                const l = linha - canto[0];
                const c = coluna - canto[1];
                const borda = l === 0 || l === 6 || c === 0 || c === 6;
                const miolo = l >= 2 && l <= 4 && c >= 2 && c <= 4;
                preenchido = borda || miolo;
            } else {
                // Número "aleatório" fixo, para o desenho não mudar a cada render
                semente = (semente * 37 + 11) % 101;
                preenchido = semente % 2 === 0;
            }

            quadrados.push(preenchido);
        }
    }

    return quadrados;
}

const QR_DEMONSTRACAO = gerarQrDemonstracao();

function formatarReais(valor) {
    return valor.toFixed(2).replace('.', ',');
}

// Coloca espaço a cada 4 números: 1234 5678 ...
function formatarNumeroCartao(texto) {
    return texto
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Coloca a barra da validade: 0828 -> 08/28
function formatarValidade(texto) {
    const numeros = texto.replace(/\D/g, '').slice(0, 4);
    if (numeros.length <= 2) return numeros;
    return numeros.slice(0, 2) + '/' + numeros.slice(2);
}

function bandeiraDoCartao(numero) {
    if (numero.startsWith('4')) return 'Visa';
    if (numero.startsWith('5')) return 'Mastercard';
    if (numero.startsWith('3')) return 'American Express';
    return '';
}

function Checkout({ item, onFechar, onPagar }) {

    const [metodo, setMetodo] = useState('cartao');
    const [numero, setNumero] = useState('');
    const [nome, setNome] = useState('');
    const [validade, setValidade] = useState('');
    const [cvv, setCvv] = useState('');
    const [erro, setErro] = useState('');
    const [processando, setProcessando] = useState(false);
    const [codigoCopiado, setCodigoCopiado] = useState(false);

    // A página passa uma "key" diferente para cada item,
    // então o formulário começa limpo sempre que abre de novo.
    const chaveItem = item ? item.titulo + item.valor : '';

    // Tecla Esc fecha (menos enquanto está processando)
    useEffect(() => {
        if (!chaveItem) return;

        function teclaApertada(e) {
            if (e.key === 'Escape' && !processando) onFechar();
        }

        window.addEventListener('keydown', teclaApertada);
        return () => window.removeEventListener('keydown', teclaApertada);
    }, [chaveItem, processando, onFechar]);

    if (!item) return null;

    const codigoPix = '00020126580014BR.GOV.BCB.PIX0136animespot-demonstracao5204000053039865405'
        + formatarReais(item.valor).replace(',', '.') + '5802BR5909ANIMESPOT6009SAO PAULO';

    function validarCartao() {
        const apenasNumeros = numero.replace(/\D/g, '');

        if (apenasNumeros.length !== 16) return 'O número do cartão precisa ter 16 dígitos.';
        if (nome.trim().length < 3) return 'Digite o nome como está no cartão.';

        const [mes, ano] = validade.split('/').map(Number);
        if (!mes || !ano || mes < 1 || mes > 12 || validade.length !== 5) {
            return 'Digite a validade no formato MM/AA.';
        }

        // Cartão vencido?
        const hoje = new Date();
        const anoAtual = hoje.getFullYear() % 100;
        const mesAtual = hoje.getMonth() + 1;
        if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
            return 'Este cartão está vencido.';
        }

        if (!/^\d{3,4}$/.test(cvv)) return 'O CVV tem 3 ou 4 números (atrás do cartão).';

        return '';
    }

    async function pagar(e) {
        e.preventDefault();
        setErro('');

        if (metodo === 'cartao') {
            const problema = validarCartao();
            if (problema) {
                setErro(problema);
                return;
            }
        }

        setProcessando(true);

        // Espera um pouco para parecer um pagamento de verdade
        await new Promise((resolver) => setTimeout(resolver, 1500));

        await onPagar(metodo === 'cartao' ? 'cartão de crédito' : 'PIX');

        setProcessando(false);
    }

    async function copiarCodigoPix() {
        try {
            await navigator.clipboard.writeText(codigoPix);
            setCodigoCopiado(true);
        } catch (erroCopia) {
            console.error('Não foi possível copiar o código PIX:', erroCopia);
        }
    }

    const bandeira = bandeiraDoCartao(numero.replace(/\D/g, ''));

    return (
        <div
            id="checkout-pagamento"
            onClick={() => !processando && onFechar()}
        >
            <div
                className="checkout-caixa"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Pagamento"
            >
                <button
                    type="button"
                    className="checkout-fechar"
                    onClick={onFechar}
                    disabled={processando}
                    aria-label="Fechar pagamento"
                >
                    ×
                </button>

                {/* RESUMO DO PEDIDO */}
                <div className="checkout-resumo">
                    <span className="checkout-etiqueta">Seu pedido</span>
                    <h2>{item.titulo}</h2>
                    <p>{item.descricao}</p>
                    <div className="checkout-total">
                        <span>Total</span>
                        <strong>
                            R$ {formatarReais(item.valor)}
                            {item.recorrente && <small>/mês</small>}
                        </strong>
                    </div>
                </div>

                <div className="checkout-aviso-demo">
                    <i className="ph ph-info"></i>
                    Pagamento simulado: nenhum valor é cobrado de verdade.
                </div>

                {/* ESCOLHA DO MÉTODO */}
                <div className="checkout-metodos">
                    <button
                        type="button"
                        className={metodo === 'cartao' ? 'ativo' : ''}
                        onClick={() => { setMetodo('cartao'); setErro(''); }}
                        disabled={processando}
                    >
                        <i className="ph ph-credit-card"></i> Cartão
                    </button>
                    <button
                        type="button"
                        className={metodo === 'pix' ? 'ativo' : ''}
                        onClick={() => { setMetodo('pix'); setErro(''); }}
                        disabled={processando}
                    >
                        <i className="ph ph-qr-code"></i> PIX
                    </button>
                </div>

                <form onSubmit={pagar}>

                    {metodo === 'cartao' ? (
                        <div className="checkout-cartao">
                            <label>
                                Número do cartão
                                <div className="checkout-campo-numero">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="0000 0000 0000 0000"
                                        value={numero}
                                        onChange={(e) => setNumero(formatarNumeroCartao(e.target.value))}
                                        disabled={processando}
                                    />
                                    {bandeira && <span>{bandeira}</span>}
                                </div>
                            </label>

                            <label>
                                Nome impresso no cartão
                                <input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Como está no cartão"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value.toUpperCase())}
                                    disabled={processando}
                                />
                            </label>

                            <div className="checkout-linha">
                                <label>
                                    Validade
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="MM/AA"
                                        value={validade}
                                        onChange={(e) => setValidade(formatarValidade(e.target.value))}
                                        disabled={processando}
                                    />
                                </label>

                                <label>
                                    CVV
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        disabled={processando}
                                    />
                                </label>
                            </div>

                            <p className="checkout-dica">
                                Para testar, use qualquer número de 16 dígitos e uma validade futura.
                            </p>
                        </div>
                    ) : (
                        <div className="checkout-pix">
                            <div className="checkout-qr" aria-label="QR code PIX de demonstração">
                                {QR_DEMONSTRACAO.map((preenchido, i) => (
                                    <span key={i} className={preenchido ? 'cheio' : ''}></span>
                                ))}
                            </div>

                            <p>Escaneie o QR code no app do seu banco ou copie o código:</p>

                            <button
                                type="button"
                                className="checkout-copiar"
                                onClick={copiarCodigoPix}
                                disabled={processando}
                            >
                                <i className={`ph ${codigoCopiado ? 'ph-check' : 'ph-copy'}`}></i>
                                {codigoCopiado ? 'Código copiado!' : 'Copiar código PIX'}
                            </button>
                        </div>
                    )}

                    {erro && (
                        <p className="checkout-erro">
                            <i className="ph ph-warning-circle"></i> {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="checkout-pagar"
                        disabled={processando}
                    >
                        {processando
                            ? 'Processando pagamento...'
                            : metodo === 'cartao'
                                ? `Pagar R$ ${formatarReais(item.valor)}`
                                : 'Já fiz o PIX'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
