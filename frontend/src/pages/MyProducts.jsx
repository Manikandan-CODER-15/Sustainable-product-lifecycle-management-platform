import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  PackageCheck,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Info,
  AlertTriangle,
  Scale,
} from 'lucide-react';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBand, setSelectedBand] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch your product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/products/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my_products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${deleteId}`);
      setProducts(products.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBand = selectedBand === 'ALL' || p.label.toUpperCase() === selectedBand;
    return matchesName && matchesBand;
  });

  const getBadge = (label) => {
    if (label === 'Good') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Good
        </span>
      );
    }
    if (label === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Info className="w-3.5 h-3.5" /> Moderate
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5" /> Poor
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <PackageCheck className="w-8 h-8 text-brand-600" />
            My Products Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your assessed circular products</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={products.length === 0}
            className="btn-secondary text-sm py-2 px-3.5 gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link to="/products/new" className="btn-primary text-sm py-2 px-4 gap-2">
            <Plus className="w-4 h-4" />
            New Evaluation
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-eco p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-sm py-2 bg-white"
          />
        </div>

        {/* Band Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Band:
          </span>
          {['ALL', 'GOOD', 'MODERATE', 'POOR'].map((band) => (
            <button
              key={band}
              onClick={() => setSelectedBand(band)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                selectedBand === band
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-brand-200 text-slate-600 hover:bg-brand-50'
              }`}
            >
              {band.charAt(0) + band.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading your catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="card-eco text-center py-16 space-y-4">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 border border-brand-200 rounded-2xl mx-auto flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No products found</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedBand !== 'ALL'
              ? 'Try adjusting your search criteria or band filter.'
              : 'You have not evaluated any products yet. Calculate your first circularity score now.'}
          </p>
          <Link to="/products/new" className="btn-primary inline-flex gap-2 text-sm mt-2">
            <Plus className="w-4 h-4" />
            Calculate First Product
          </Link>
        </div>
      ) : (
        <div className="card-eco p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-50 border-b border-brand-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Total Weight</th>
                  <th className="py-3.5 px-6">Recyclability Score</th>
                  <th className="py-3.5 px-6">Circularity Band</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/40 transition">
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <Link to={`/products/${p.id}/result`} className="hover:text-brand-600 transition">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{p.category}</td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{p.totalWeightG} g</td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-800 text-base">{p.score.toFixed(1)}</span>
                      <span className="text-xs text-slate-400 ml-1">/ 100</span>
                    </td>
                    <td className="py-4 px-6">{getBadge(p.label)}</td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/products/${p.id}/result`)}
                        title="View Full Calculation"
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                        title="Edit Product"
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        title="Delete Product"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-eco max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Delete Product Evaluation?</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to remove this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-primary bg-red-600 hover:bg-red-700 text-sm py-2 px-4"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
