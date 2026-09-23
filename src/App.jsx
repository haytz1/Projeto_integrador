import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PaginaInicial from './pages/PaginaInicial'
import ObrasMangas from './ObrasMangas';
import Historico from './Historico'


function App() {


    return (

        <>


            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<PaginaInicial />} />
                    <Route path="/ObrasMangas" element={<ObrasMangas />} />
                    <Route path="/Historico" element={<Historico />} />
                </Routes>
            </BrowserRouter>

        </>

    );
}

export default App;