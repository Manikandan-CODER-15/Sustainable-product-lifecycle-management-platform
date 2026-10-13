import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Leaf, 
  AlertCircle, 
  ArrowRight, 
  Droplet, 
  Layers, 
  Lightbulb, 
  BarChart3,
  X,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Cpu,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import ecoGlobeHd from '../assets/eco_earth_hands_hd.jpg';
import ecoProductsRow from '../assets/eco_products_row.jpg';

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('ecoplm_remembered_email') || '');
  const [rememberEmail, setRememberEmail] = useState(() => !!localStorage.getItem('ecoplm_remembered_email'));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'features' | 'how-it-works' | 'help' | null

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });
      
      // Manage explicit user preference for remembering email only
      if (rememberEmail && email.trim()) {
        localStorage.setItem('ecoplm_remembered_email', email.trim());
      } else {
        localStorage.removeItem('ecoplm_remembered_email');
      }

      login(response.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#effbf2] flex flex-col justify-between">
      {/* Top Navigation Bar from Mockup */}
      <header className="w-full bg-[#f4fcf6] border-b border-[#ddf3e3] px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100/80 border border-emerald-300/80 flex items-center justify-center text-emerald-700">
            <Leaf className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="font-bold text-lg text-emerald-950 tracking-tight leading-none block">EcoPLM</span>
            <span className="text-[11px] text-emerald-800/80 font-medium leading-none block mt-0.5">Sustainable Product Lifecycle Management</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-emerald-900/80">
          <Link to="/" className="hover:text-emerald-700 transition">Home</Link>
          <button 
            type="button" 
            onClick={() => setActiveModal('features')} 
            className="hover:text-emerald-700 transition cursor-pointer font-medium"
          >
            Features
          </button>
          <button 
            type="button" 
            onClick={() => setActiveModal('how-it-works')} 
            className="hover:text-emerald-700 transition cursor-pointer font-medium"
          >
            How it works
          </button>
          <button 
            type="button" 
            onClick={() => setActiveModal('help')} 
            className="hover:text-emerald-700 transition cursor-pointer font-medium"
          >
            Help
          </button>
        </nav>
      </header>

      {/* Main Hero & Login Split Section */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        
        {/* Left Column - Product Story & Illustrated Graphics */}
        <div className="lg:col-span-7 flex flex-col space-y-8">
          
          {/* Headline and Earth Hands Graphic */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#114b2d] leading-[1.15] tracking-tight">
                Know how recyclable your product really is.
              </h1>
              <p className="mt-4 text-[#2d5f43] text-base leading-relaxed">
                Pick the materials, enter their weights, and get an instant recyclability score from 0 to 100, with a clear breakdown of what helps and what hurts.
              </p>
            </div>

            {/* Crystal Clear HD Eco Earth Hands Artwork */}
            <div className="hidden sm:flex flex-col items-center flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-b from-emerald-200/50 to-emerald-300/30 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <img 
                  src={ecoGlobeHd} 
                  alt="Better Choices, Greener Future" 
                  className="relative w-44 sm:w-48 h-auto object-contain rounded-2xl drop-shadow-md border border-emerald-200/60 bg-[#effbf2]"
                />
              </div>
            </div>
          </div>

          {/* Clean Flat Product Packaging Banner - HD Image */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-[#bbf7d0]">
            <img 
              src={ecoProductsRow} 
              alt="Eco-friendly product packaging — bottle, jar, box, bag, plant" 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Droplet className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-[#184e31]">Instant recyclability score</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-[#184e31]">Just material name and weight</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-[#184e31]">Rule-based improvement tips</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-[#184e31]">Charts and cited data sources</span>
            </div>
          </div>


        </div>

        {/* Right Column - Exact Floating Card Login Form */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-200/80 shadow-[0_10px_35px_-8px_rgba(16,80,40,0.12)] p-8 sm:p-9">
            
            {/* Header Icon & Title */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-xs text-slate-500 mt-0.5">Sign in to check your product's score.</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/90 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-600 hover:text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400 hover:text-emerald-700" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 select-none">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Remember email</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-[#167d43] hover:bg-[#126b38] text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-semibold underline">
                Register
              </Link>
            </p>

            <p className="text-center text-[11px] text-slate-400 mt-4">
              Admins and users sign in here. Your role is set by your account.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar from Mockup */}
      <footer className="w-full bg-[#f4fcf6] border-t border-[#ddf3e3] px-6 sm:px-12 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-900/70">
        <span>EcoPLM: material data comes from cited sources.</span>
        <div className="flex items-center space-x-6 mt-2 sm:mt-0 font-medium">
          <span>Eco-friendly</span>
          <span>Secure login</span>
          <span>Rule-based scoring</span>
        </div>
      </footer>

      {/* Modal Dialog for Features, How It Works, and Help */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Features Modal */}
            {activeModal === 'features' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Key Features</h3>
                    <p className="text-xs text-slate-500">Comprehensive sustainability management</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-950">Instant Recyclability Scoring (0-100)</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">Calculates multi-material recyclability scores factoring in weight proportions, material recyclability percentages, and separation penalties.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-950">Rule-Based Recommendations</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">Automated suggestions identify heavy, non-recyclable components and recommend greener, mono-material alternatives.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-950">Materials Database</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">29+ curated polymer, metal, glass, paper, and bio-material grades with benchmark recyclability factors.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-950">Interactive Analytics & Radar Charts</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">Visual breakdowns across material composition, weight share, and improvement potential.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works Modal */}
            {activeModal === 'how-it-works' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">How It Works</h3>
                    <p className="text-xs text-slate-500">4-step circular product assessment</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Add Product & Materials</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Specify product name, category, and list components with their material grade and weight in grams.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Automated Weighted Calculation</h4>
                      <p className="text-xs text-slate-500 mt-0.5">The engine multiplies each component's weight share by its recyclability rating and applies separation difficulty factors.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Inspect Results & Score Breakdown</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Get a score from 0 to 100 with color-coded classification: Poor, Moderate, Good, or Excellent.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">4</span>
                    <div>
                      <h4 className="font-semibold text-slate-800">Apply Sustainable Redesigns</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Read actionable improvement tips to swap materials or eliminate multi-layer composites.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Modal */}
            {activeModal === 'help' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Help & Support</h3>
                    <p className="text-xs text-slate-500">Quick guide for new and existing users</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Logging In</h4>
                    <p>Use your registered email and password. If you don't have an account yet, click <Link to="/register" onClick={() => setActiveModal(null)} className="text-emerald-700 underline font-semibold">Register</Link> to create one.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">User Roles</h4>
                    <p><strong className="text-slate-700">USER:</strong> Create and evaluate products, track your design portfolio, and view recyclability scores.</p>
                    <p className="mt-1"><strong className="text-slate-700">ADMIN:</strong> Manage materials catalog, adjust recyclability factors, and configure threshold settings.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Account Access</h4>
                    <p>Sign in using your registered email and password. New team members can register an account directly.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Close action */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
