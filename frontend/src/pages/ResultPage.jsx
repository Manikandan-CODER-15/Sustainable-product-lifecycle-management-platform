import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowLeft,
  Edit,
  Leaf,
  Scale,
  Sparkles,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';

const CHART_COLORS = ['#16A34A', '#22C55E', '#86EFAC', '#BBF7D0', '#64748B', '#0EA5E9', '#F59E0B'];

const ResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(location.state?.product || null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!product) {
          const prodRes = await api.get(`/products/${id}`);
          setProduct(prodRes.data);
        }
        const srcRes = await api.get('/sources');
        setSources(srcRes.data);
      } catch (err) {
        setError('Failed to load product calculation results.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, product]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading scoring calculation...</div>;
  }

  if (error || !product) {
    return (
      <div className="card-eco max-w-lg mx-auto text-center py-10">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Error</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Product not found.'}</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">Back to My Products</Link>
      </div>
    );
  }

  const calc = product.calculationResult || {};
  const score = calc.score ?? product.score;
  const label = calc.label ?? product.label;

  // Prepare data for Recharts
  const pieData = (calc.materialBreakdowns || []).map((m) => ({
    name: m.materialName,
    value: m.weightG,
    share: m.weightSharePct,
  }));

  const barData = Object.entries(calc.normalizedAverages || {}).map(([key, val]) => ({
    parameter: key,
    score: val,
  }));

  // SVG circular gauge properties
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getLabelBadge = () => {
    if (label === 'Good') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Good Circularity
        </span>
      );
    }
    if (label === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Info className="w-4 h-4 text-amber-600" />
          Moderate Circularity
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        Poor Circularity
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-slate-600 transition"
            title="Back to products"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mt-1">
              {product.name}
            </h1>
          </div>
        </div>

        <Link
          to={`/products/${product.id}/edit`}
          className="btn-secondary self-start sm:self-auto gap-2 text-sm"
        >
          <Edit className="w-4 h-4" />
          Edit Composition
        </Link>
      </div>

      {/* Main Score Hero Card */}
      <div className="card-eco p-8 bg-gradient-to-br from-white via-white to-brand-50/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Circular Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className="text-slate-100"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  className={`${
                    label === 'Good'
                      ? 'text-green-600'
                      : label === 'Moderate'
                      ? 'text-amber-500'
                      : 'text-red-500'
                  } transition-all duration-1000 ease-out`}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-800">{score.toFixed(1)}</span>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">out of 100</span>
              </div>
            </div>
            <div className="mt-3">{getLabelBadge()}</div>
          </div>

          {/* Quick Metrics & Explanation */}
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Circularity Performance Summary</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Based on the 6 weighted lifecycle indicators and hazardous substance penalties, this product has been classified into the <strong className="text-slate-800">{label}</strong> band.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-brand-200">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Weight</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{product.totalWeightG} g</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-brand-200">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Positive Score</p>
                <p className="text-lg font-bold text-brand-700 mt-0.5">{calc.positiveScore ?? '-'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-brand-200">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hazardous Penalty</p>
                <p className="text-lg font-bold text-red-600 mt-0.5">-{calc.hazardousPenalty ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rule-Based Suggestions Card */}
      {calc.suggestions && calc.suggestions.length > 0 && (
        <div className="card-eco border-l-4 border-l-brand-600">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Actionable Eco-Design Suggestions
          </h2>
          <ul className="space-y-2.5">
            {calc.suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Analytics (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Composition by Weight */}
        <div className="card-eco">
          <h2 className="text-base font-bold text-slate-800 mb-4">Material Composition by Weight</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, share }) => `${name} (${share}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} g`, 'Weight']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Normalized Parameter Averages */}
        <div className="card-eco">
          <h2 className="text-base font-bold text-slate-800 mb-4">Sustainability Parameter Averages (0-100)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="parameter" tick={{ fontSize: 11, fill: '#64748B' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip formatter={(val) => [`${val}/100`, 'Average Score']} />
                <Bar dataKey="score" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-Material Breakdown Table */}
      <div className="card-eco p-0 overflow-hidden">
        <div className="p-6 border-b border-brand-200">
          <h2 className="text-lg font-bold text-slate-800">Detailed Material Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">Individual performance contributions to the aggregate score.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 border-b border-brand-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Material</th>
                <th className="py-3 px-6">Weight</th>
                <th className="py-3 px-6">Share</th>
                <th className="py-3 px-6">Hazardous</th>
                <th className="py-3 px-6">Indiv. Score</th>
                <th className="py-3 px-6">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-200/60">
              {(calc.materialBreakdowns || []).map((m) => (
                <tr key={m.materialId} className="hover:bg-brand-50/40 transition">
                  <td className="py-4 px-6 font-semibold text-slate-800">{m.materialName}</td>
                  <td className="py-4 px-6 text-slate-600">{m.weightG} g</td>
                  <td className="py-4 px-6 text-slate-600">{m.weightSharePct}%</td>
                  <td className="py-4 px-6">
                    {m.hazardous ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Hazardous
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">Non-hazardous</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">{m.individualScore}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        m.impact === 'POSITIVE'
                          ? 'bg-green-100 text-green-800'
                          : m.impact === 'NEGATIVE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cited Sources & References */}
      {sources.length > 0 && (
        <div className="card-eco">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-brand-600" />
            Verified Scientific Citations & Standards
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Material parameters in EcoPLM are derived from verified published data and international standards.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {sources.map((src) => (
              <div key={src.id} className="p-3 rounded-xl bg-brand-50/60 border border-brand-200">
                <p className="font-semibold text-slate-800">{src.title}</p>
                <p className="text-slate-500 mt-0.5">{src.publisher || 'Reference Dataset'} ({src.year || '2026'})</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
