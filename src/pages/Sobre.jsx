import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/sobre.css';

// Perguntas frequentes exibidas na seção FAQ
const perguntas = [
    {
        pergunta: 'O que é o AnimeSpot?',
        resposta: 'É uma plataforma para ler e descobrir histórias de animes e mangás, tanto fanfics de obras conhecidas quanto histórias originais criadas pelos próprios usuários.'
    },
    {
        pergunta: 'Preciso de uma conta para ler?',
        resposta: 'Não. Você pode navegar e ler as obras sem conta. Para favoritar, seguir autores, comentar, ver seu histórico e comprar moedas é preciso fazer login.'
    },
    {
        pergunta: 'Para que servem as moedas?',
        resposta: 'As moedas servem para desbloquear capítulos e conteúdos especiais. Você pode comprar pacotes de 50, 100 ou 150 moedas na página de Moedas.'
    },
    {
        pergunta: 'Qual a diferença entre o plano Gratuito e o Premium?',
        resposta: 'O plano Gratuito dá acesso às histórias gratuitas e aos comentários. O Premium (R$ 15/mês) inclui badge de apoiador, comentários em destaque e capítulos adiantados.'
    },
    {
        pergunta: 'Como publico minha própria história?',
        resposta: 'Na página de Obras você encontra o botão para criar uma nova obra e depois adicionar capítulos a ela.'
    },
    {
        pergunta: 'Como denuncio um conteúdo impróprio?',
        resposta: 'Nas postagens e comentários da página inicial existe a opção de denunciar. A equipe de moderação analisa todas as denúncias.'
    }
];

function Sobre() {
    const location = useLocation();

    // Quando o link do rodapé tem #faq, #termos etc., rola até a seção certa
    useEffect(() => {
        if (location.hash) {
            const secao = document.querySelector(location.hash);
            if (secao) {
                secao.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    return (
        <div id="tela-sobre">
            <NavbarPesquisa />

            <main className="sobre-conteudo">
                <header className="sobre-cabecalho">
                    <h1>Central de Ajuda</h1>
                    <p>Dúvidas, regras de uso e informações sobre o AnimeSpot</p>

                    <nav className="sobre-atalhos">
                        <a href="#faq">FAQ</a>
                        <a href="#termos">Termos de Uso</a>
                        <a href="#privacidade">Privacidade</a>
                        <a href="#contato">Contato</a>
                    </nav>
                </header>

                {/* FAQ */}
                <section id="faq" className="sobre-secao">
                    <h2><i className="ph ph-question"></i> Perguntas frequentes</h2>

                    {perguntas.map((item) => (
                        <details key={item.pergunta} className="sobre-pergunta">
                            <summary>{item.pergunta}</summary>
                            <p>{item.resposta}</p>
                        </details>
                    ))}
                </section>

                {/* TERMOS DE USO */}
                <section id="termos" className="sobre-secao">
                    <h2><i className="ph ph-scroll"></i> Termos de Uso</h2>

                    <p>Ao usar o AnimeSpot, você concorda com as regras abaixo:</p>
                    <ul>
                        <li>Respeite os outros usuários. Ofensas, discurso de ódio e assédio não são permitidos.</li>
                        <li>Publique apenas histórias de sua autoria. Fanfics devem dar crédito à obra original.</li>
                        <li>Conteúdos impróprios, spam ou cópias de outros autores podem ser removidos.</li>
                        <li>Contas que desrespeitarem as regras podem ser suspensas pela moderação.</li>
                        <li>As moedas e planos são de uso exclusivo dentro da plataforma.</li>
                    </ul>
                </section>

                {/* PRIVACIDADE */}
                <section id="privacidade" className="sobre-secao">
                    <h2><i className="ph ph-lock-key"></i> Política de Privacidade</h2>

                    <p>Levamos seus dados a sério. Veja o que guardamos e por quê:</p>
                    <ul>
                        <li><strong>Dados da conta:</strong> nome de usuário, e-mail e foto de perfil, usados para identificar você no site.</li>
                        <li><strong>Atividade:</strong> obras favoritas, autores que você segue e histórico de leitura, usados para personalizar sua experiência.</li>
                        <li><strong>Senha:</strong> nunca fica visível para nós. Ela é protegida pelo sistema de autenticação.</li>
                        <li>Não vendemos nem compartilhamos seus dados com terceiros.</li>
                    </ul>
                </section>

                {/* CONTATO */}
                <section id="contato" className="sobre-secao">
                    <h2><i className="ph ph-chat-circle-text"></i> Contato</h2>

                    <p>
                        O AnimeSpot é um Projeto Integrador desenvolvido pelo Grupo Cinza:
                        Matheus, Guilherme, Laura e Lorena.
                    </p>
                    <p>
                        Encontrou um problema ou tem uma sugestão? Fale com a equipe ou use
                        a opção de denúncia dentro do site.
                    </p>

                    <Link to="/" className="sobre-botao">Voltar para o início</Link>
                </section>
            </main>

            <Rodape />
        </div>
    );
}

export default Sobre;
