import React from 'react';
import { Link } from 'react-router-dom';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/historico.css';

function Seguindo() {
    return (
        <>
            <NavbarPesquisa />

            <main className="container" style={{ padding: '2rem 2rem 4rem', paddingTop: 'calc(64px + 2rem)', minHeight: '80vh' }}>
                <header className="cabecalho-historico" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Autores que você segue
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1rem' }}>
                        Fique por dentro das novidades dos seus autores favoritos
                    </p>
                </header>

                <section aria-label="Seguindo">
                    <div style={{
                        background: 'rgba(168, 85, 247, 0.07)',
                        border: '1px dashed rgba(168, 85, 247, 0.3)',
                        padding: '4rem 2rem',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}>
                        <i className="ph ph-user-circle-plus" style={{
                            fontSize: '4.5rem',
                            color: '#a855f7',
                            display: 'block',
                            marginBottom: '1.2rem'
                        }}></i>
                        <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Você ainda não está seguindo ninguém
                        </p>
                        <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                            Explore postagens e comece a seguir autores para ver o conteúdo deles aqui!
                        </p>
                        <Link to="/" style={{
                            display: 'inline-block',
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}>
                            Explorar postagens
                        </Link>
                    </div>
                </section>
            </main>

            <Rodape />
        </>
    );
}

export default Seguindo;
