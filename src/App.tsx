import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Menu = lazy(() => import('./pages/Menu'));
const Admin = lazy(() => import('./pages/Admin'));
const Auth = lazy(() => import('./pages/Auth'));
const QRCustomizer = lazy(() => import('./pages/QRCustomizer'));
const ManagementDashboard = lazy(() => import('./pages/ManagementDashboard'));
const StaffLogin = lazy(() => import('./pages/StaffLogin'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    if (error.name === 'ChunkLoadError' || error.message.includes('fetch')) {
      window.location.reload();
    }
  }
  render() {
    if (this.state.hasError) return <div className="min-h-screen flex items-center justify-center font-pixel">Sayfa güncelleniyor... Lütfen bekleyin.</div>;
    return this.props.children;
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center font-pixel text-3xl text-brand-dark">
      Yükleniyor...
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Ana siteye girenleri direkt Giriş/Kayıt sayfasına yolla */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Mekan Sahipleri İçin */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/staff-login/:restaurantId" element={<StaffLogin />} />
            
            {/* QR Kod Özelleştirici */}
            <Route path="/qr/:restaurantId" element={<QRCustomizer />} />
            
            {/* Masa ve Sipariş Yönetimi (POS) */}
            <Route path="/pos/:restaurantId" element={<ManagementDashboard />} />
            
            {/* Personel (Garson/Şef) Girişi (Dinamik Link) */}
            <Route path="/staff/:restaurantId" element={<StaffLogin />} />
            
            {/* Müşteriler İçin (Dinamik Link) */}
            <Route path="/menu/:slug" element={<Menu />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;