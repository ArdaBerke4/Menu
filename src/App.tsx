import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './pages/Menu';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import QRCustomizer from './pages/QRCustomizer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana siteye girenleri direkt Giriş/Kayıt sayfasına yolla */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        {/* Mekan Sahipleri İçin */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />

        {/* QR Kod Özelleştirici */}
        <Route path="/qr/:restaurantId" element={<QRCustomizer />} />
        
        {/* Müşteriler İçin (Dinamik Link) */}
        <Route path="/menu/:id" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;