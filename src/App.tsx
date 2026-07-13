import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Menu = lazy(() => import('./pages/Menu'));
const Admin = lazy(() => import('./pages/Admin'));
const Auth = lazy(() => import('./pages/Auth'));
const QRCustomizer = lazy(() => import('./pages/QRCustomizer'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center font-pixel text-3xl text-brand-dark">
      Yükleniyor...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;