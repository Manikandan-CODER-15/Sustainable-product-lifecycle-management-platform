import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, LayoutDashboard, Calculator, PackageCheck, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-brand-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-800 tracking-tight">EcoPLM</span>
                <span className="hidden sm:inline-block text-xs text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full ml-2 font-medium">Sustainable Lifecycle</span>
              </div>
            </Link>

            {/* Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <Link
                  to="/"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/products/new"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/products/new')
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  Calculate Score
                </Link>

                <Link
                  to="/products"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/products')
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  <PackageCheck className="w-4 h-4" />
                  My Products
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-brand-100 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Console
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Side User Profile & Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
                    <span className="text-[10px] text-brand-700 font-medium uppercase tracking-wider">{user?.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
