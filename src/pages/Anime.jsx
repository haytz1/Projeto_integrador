import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { supabase } from '../../supabase';

import '../css/Anime.css';

function Anime() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [anime, setAnime] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState(false);

    const [naLista, setNaLista] = useState(false);

    const [adicionando, setAdicionando] = useState(false);


    useEffect(() => {

        async function buscarAnime() {

            setCarregando(true);

            setErro(false);

            try {

                const query = `
                    query ($id: Int) {

                        Media(
                            id: $id,
                            type: ANIME
                        ) {

                            id

                            title {
                                romaji
                                english
                                native
                            }

                            description(asHtml: false)

                            startDate {
                                year
                            }

                            episodes
                            chapters
                            volumes

                            genres

                            format
                            status
                            averageScore
                            popularity

                            coverImage {
                                extraLarge
                                large
                            }

                            studios {
                                nodes {
                                    name
                                }
                            }
                        }
                    }
                `;

                const resposta = await fetch(
                    'https://graphql.anilist.co',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },

                        body: JSON.stringify({
                            query: query,

                            variables: {
                                id: Number(id)
                            }
                        })
                    }
                );

                const dados = await resposta.json();

                if (
                    !resposta.ok ||
                    !dados.data ||
                    !dados.data.Media
                ) {

                    setErro(true);

                    return;
                }

                setAnime(dados.data.Media);

            } catch (erro) {

                console.error(
                    'Erro ao buscar anime:',
                    erro
                );

                setErro(true);

            } finally {

                setCarregando(false);

            }
        }


        if (id) {

            buscarAnime();

        } else {

            setErro(true);

            setCarregando(false);

        }

    }, [id]);


    useEffect(() => {

        async function verificarLista() {

            const email = localStorage.getItem(
                'usuario_email'
            );

            if (!email || !id) {
                return;
            }

            try {

                const { data: usuario } = await supabase
                    .from('usuarios')
                    .select('id')
                    .eq('email', email)
                    .single();

                if (!usuario) {
                    return;
                }

                const { data: item } = await supabase
                    .from('biblioteca')
                    .select('id')
                    .eq('usuario_id', usuario.id)
                    .eq('anime_id', Number(id))
                    .maybeSingle();

                if (item) {

                    setNaLista(true);

                }

            } catch (erro) {

                console.error(
                    'Erro ao verificar lista:',
                    erro
                );

            }
        }

        verificarLista();

    }, [id]);


    async function adicionarMinhaLista() {

        const email = localStorage.getItem(
            'usuario_email'
        );

        if (!email) {

            alert(
                'Você precisa estar logado para adicionar uma obra à sua lista.'
            );

            navigate('/Login');

            return;
        }

        if (naLista) {

            return;
        }

        setAdicionando(true);

        try {

            const { data: usuario, error: erroUsuario } =
                await supabase
                    .from('usuarios')
                    .select('id')
                    .eq('email', email)
                    .single();

            if (erroUsuario || !usuario) {

                alert(
                    'Não foi possível encontrar o usuário.'
                );

                return;
            }


            const { error: erroBiblioteca } =
                await supabase
                    .from('biblioteca')
                    .insert({
                        usuario_id: usuario.id,
                        anime_id: Number(id)
                    });


            if (erroBiblioteca) {

                console.error(
                    'Erro ao adicionar obra:',
                    erroBiblioteca
                );

                alert(
                    'Não foi possível adicionar a obra à sua lista.'
                );

                return;
            }


            setNaLista(true);

            alert(
                'Obra adicionada à sua lista!'
            );

        } catch (erro) {

            console.error(
                'Erro:',
                erro
            );

            alert(
                'Ocorreu um erro ao adicionar a obra.'
            );

        } finally {

            setAdicionando(false);

        }
    }


    if (carregando) {

        return (
            <div className="anime-carregando">

                <h1>
                    Carregando obra...
                </h1>

            </div>
        );

    }


    if (erro || !anime) {

        return (
            <div className="anime-nao-encontrado">

                <h1>
                    Obra não encontrada
                </h1>

                <p>
                    Não foi possível encontrar essa obra.
                </p>

                <button
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

            </div>
        );

    }


    const nome =
        anime.title?.english ||
        anime.title?.romaji ||
        anime.title?.native ||
        'Obra sem título';


    const tituloOriginal =
        anime.title?.native &&
        anime.title.native !== nome
            ? anime.title.native
            : null;


    const imagem =
        anime.coverImage?.extraLarge ||
        anime.coverImage?.large;


    const descricao =
        anime.description ||
        'Descrição não disponível.';


    const estudios =
        anime.studios?.nodes || [];


    return (

        <div className="anime-page">

            <button
                className="anime-voltar"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button>


            <section className="anime-capa">

                {imagem && (

                    <img
                        src={imagem}
                        alt={nome}
                        className="anime-capa-imagem"
                    />

                )}


                <div className="anime-capa-gradiente"></div>


                <div className="anime-informacoes">

                    <h1>
                        {nome}
                    </h1>


                    {tituloOriginal && (

                        <p className="anime-titulo-original">
                            {tituloOriginal}
                        </p>

                    )}


                    <div className="anime-dados">

                        {anime.startDate?.year && (

                            <span>
                                {anime.startDate.year}
                            </span>

                        )}


                        {anime.format && (

                            <span>
                                {anime.format}
                            </span>

                        )}


                        {anime.episodes && (

                            <span>
                                {anime.episodes} episódios
                            </span>

                        )}

                    </div>


                    {anime.genres?.length > 0 && (

                        <p className="anime-generos-topo">
                            {anime.genres.join(' • ')}
                        </p>

                    )}


                    <div className="anime-botoes">

                        <button
                            className="botao-assistir"
                        >
                            📖 Ler agora
                        </button>


                        <button
                            className="botao-lista"
                            onClick={adicionarMinhaLista}
                            disabled={adicionando || naLista}
                        >

                            {adicionando
                                ? 'Adicionando...'
                                : naLista
                                    ? '✓ Na minha lista'
                                    : '＋ Minha lista'
                            }

                        </button>

                    </div>

                </div>

            </section>


            <main className="anime-conteudo">


                <section className="anime-sinopse">

                    <h2>
                        Sobre a obra
                    </h2>

                    <p>
                        {descricao}
                    </p>

                </section>


                <section className="anime-sinopse">

                    <h2>
                        Informações
                    </h2>


                    {anime.startDate?.year && (

                        <p>
                            <strong>
                                Ano:
                            </strong>{' '}

                            {anime.startDate.year}
                        </p>

                    )}


                    {anime.format && (

                        <p>
                            <strong>
                                Formato:
                            </strong>{' '}

                            {anime.format}
                        </p>

                    )}


                    {anime.status && (

                        <p>
                            <strong>
                                Status:
                            </strong>{' '}

                            {anime.status}
                        </p>

                    )}


                    {anime.episodes && (

                        <p>
                            <strong>
                                Episódios:
                            </strong>{' '}

                            {anime.episodes}
                        </p>

                    )}


                    {anime.chapters && (

                        <p>
                            <strong>
                                Capítulos:
                            </strong>{' '}

                            {anime.chapters}
                        </p>

                    )}


                    {anime.volumes && (

                        <p>
                            <strong>
                                Volumes:
                            </strong>{' '}

                            {anime.volumes}
                        </p>

                    )}


                    {anime.averageScore && (

                        <p>
                            <strong>
                                Avaliação:
                            </strong>{' '}

                            {anime.averageScore / 10}

                        </p>

                    )}

                </section>


                {anime.genres?.length > 0 && (

                    <section className="anime-sinopse">

                        <h2>
                            Gêneros
                        </h2>


                        <div className="personagens">

                            {anime.genres.map(
                                (genero) => (

                                    <div
                                        className="personagem"
                                        key={genero}
                                    >

                                        <span>
                                            {genero}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </section>

                )}


                <section className="anime-sinopse">

                    <h2>
                        Estúdio
                    </h2>


                    {estudios.length > 0 ? (

                        estudios.map(
                            (estudio) => (

                                <p
                                    key={estudio.name}
                                >
                                    {estudio.name}
                                </p>

                            )
                        )

                    ) : (

                        <p>
                            Estúdio não informado.
                        </p>

                    )}

                </section>


            </main>

        </div>

    );

}

export default Anime;