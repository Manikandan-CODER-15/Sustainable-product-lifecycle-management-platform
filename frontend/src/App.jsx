import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded route components for ultra-fast initial bundle and route-level code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductForm = lazy(() => import('./pages/ProductForm'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const MyProducts = lazy(() => import('./pages/MyProducts'));
const AdminConsole = lazy(() => import('./pages/AdminConsole'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading...</span>
  </div>
);

function MainLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isLoginPage ? 'bg-[#effbf2]' : 'bg-brand-50/40'}`}>
      {!isLoginPage && <Navbar />}
      <main className={`flex-1 w-full mx-auto ${isLoginPage ? 'p-0 max-w-none' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
            <Route path="/products/:id/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminConsole /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
