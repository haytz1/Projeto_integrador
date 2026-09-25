import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PaginaInicial from './pages/PaginaInicial'
import ObrasMangas from './pages/ObrasMangas';
import Historico from './pages/Historico'
import Leitura from './pages/Leitura';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Moedas from './pages/Moedas';
import Planos from './pages/Planos';
import Perfil from './pages/Perfil';

function App() {


    return (

        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<PaginaInicial />} />
                    <Route path="/ObrasMangas" element={<ObrasMangas />} />

                    <Route path='/Leitura/:tituloObra' element={<Leitura />} />
                    <Route path="/Leitura" element={<Leitura />} />

                    <Route path='/leitura/:tituloObra' element={<Leitura/>} />
                    <Route path='/leitura' element={<Leitura/>} />

                    <Route path="/Historico" element={<Historico />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/Cadastro" element={<Cadastro />} />
                    <Route path="/Moedas" element={<Moedas />} />
                    <Route path="/Planos" element={<Planos />} />
                    <Route path="/Perfil" element={<Perfil />} />
                </Routes>
            </BrowserRouter>
        </>

    );
}

export default App;