import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  Package,
  Award,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading dashboard...</div>;
  }

  // Key KPI metrics
  const totalProducts = products.length;
  const avgScore = totalProducts > 0
    ? (products.reduce((acc, p) => acc + p.score, 0) / totalProducts).toFixed(1)
    : 0;
  const poorCount = products.filter((p) => p.label === 'Poor').length;
  const goodCount = products.filter((p) => p.label === 'Good').length;
  const moderateCount = products.filter((p) => p.label === 'Moderate').length;

  const highestProduct = products.reduce((prev, curr) => (curr.score > (prev?.score || 0) ? curr : prev), null);

  // Chart data
  const bandDistributionData = [
    { band: 'Good (71-100)', count: goodCount, color: '#16A34A' },
    { band: 'Moderate (41-70)', count: moderateCount, color: '#F59E0B' },
    { band: 'Poor (0-40)', count: poorCount, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-8 h-8 text-brand-600" />
            Circularity Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time lifecycle sustainability metrics and portfolio health</p>
        </div>

        <Link to="/products/new" className="btn-primary self-start sm:self-auto gap-2 text-sm shadow-md">
          <Plus className="w-4 h-4" />
          Evaluate New Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-eco flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluated Products</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalProducts}</p>
          </div>
        </div>

        <div className="card-eco flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Circularity</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {avgScore} <span className="text-xs font-medium text-slate-400">/ 100</span>
            </p>
          </div>
        </div>

        <div className="card-eco flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 text-green-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Circular Design</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5 truncate max-w-[150px]">
              {highestProduct ? `${highestProduct.name} (${highestProduct.score})` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="card-eco flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requires Redesign</p>
            <p className="text-2xl font-extrabold text-red-600 mt-0.5">
              {poorCount} <span className="text-xs font-medium text-slate-400">in Poor band</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Distribution Chart */}
        <div className="lg:col-span-8 card-eco">
          <h2 className="text-base font-bold text-slate-800 mb-4">Circularity Score Band Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="band" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bandDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="lg:col-span-4 card-eco flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-2">Sustainable PLM Engine</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time scoring incorporates 7 properties per material: recyclability, recycled content, disassembly ease, reusability, repairability, lifetime, and hazardous penalties.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-200 space-y-1.5 text-xs text-brand-800">
              <p className="font-semibold">Band Thresholds:</p>
              <p>• 71 - 100 : Good (Circular compliant)</p>
              <p>• 41 - 70  : Moderate (Improvement viable)</p>
              <p>• 0 - 40   : Poor (High hazardous / non-recyclable)</p>
            </div>
          </div>

          <Link
            to="/products"
            className="btn-secondary w-full justify-between mt-6 text-sm py-2 px-3.5"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="card-eco p-0 overflow-hidden">
        <div className="p-6 border-b border-brand-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Assessments</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest evaluations logged to your account.</p>
          </div>
          <Link to="/products" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
            View All →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No products evaluated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-50 border-b border-brand-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Score</th>
                  <th className="py-3 px-6">Circularity Band</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200/60">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/40 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3.5 px-6 text-slate-600">{p.category}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{p.score.toFixed(1)}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          p.label === 'Good'
                            ? 'bg-green-100 text-green-800'
                            : p.label === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/products/${p.id}/result`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
