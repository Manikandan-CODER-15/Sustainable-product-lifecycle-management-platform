import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';
import ResultPage from './pages/ResultPage';
import MyProducts from './pages/MyProducts';
import AdminConsole from './pages/AdminConsole';

function MainLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isLoginPage ? 'bg-[#effbf2]' : 'bg-brand-50/40'}`}>
      {!isLoginPage && <Navbar />}
      <main className={`flex-1 w-full mx-auto ${isLoginPage ? 'p-0 max-w-none' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}`}>
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
