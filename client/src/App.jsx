import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import Hub from './pages/Hub';
import OsinQuest from './pages/OsinQuest';
import RavenEyes from './pages/RavenEyes';
import Infos from './pages/Infos';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Hub />} />
            <Route path="/osinquest" element={<OsinQuest />} />
            <Route path="/raven-eyes" element={<RavenEyes />} />
            <Route path="/infos" element={<Infos />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Analytics />
    </>
  );
}