import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getMaterials } from '../api/materialsApi';
import { Calculator, Plus, Trash2, AlertCircle, Scale, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Consumer Electronics',
  'Packaging & Containers',
  'Automotive & Transport',
  'Consumer Goods',
  'Construction & Building',
  'Textiles & Apparel',
  'Medical Devices',
  'Other',
];

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialRows, setMaterialRows] = useState([
    { materialId: '', weightG: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch available materials from database
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getMaterials();
        setMaterialsList(data);
      } catch (err) {
        setError('Failed to load materials catalog. Please refresh.');
      } finally {
        setFetchingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  // 2. If edit mode, load existing product data
  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          setName(res.data.name);
          setCategory(res.data.category);
          if (res.data.calculationResult?.materialBreakdowns) {
            setMaterialRows(
              res.data.calculationResult.materialBreakdowns.map((m) => ({
                materialId: m.materialId.toString(),
                weightG: m.weightG.toString(),
              }))
            );
          }
        } catch (err) {
          setError('Failed to load product details');
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  // Dynamic row management
  const handleAddRow = () => {
    setMaterialRows([...materialRows, { materialId: '', weightG: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (materialRows.length > 1) {
      setMaterialRows(materialRows.filter((_, idx) => idx !== index));
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...materialRows];
    updated[index][field] = value;
    setMaterialRows(updated);
  };

  // Live calculations
  const totalWeightG = materialRows.reduce((acc, row) => {
    const w = parseFloat(row.weightG);
    return acc + (isNaN(w) || w <= 0 ? 0 : w);
  }, 0);

  // Duplicate material check
  const selectedMaterialIds = materialRows
    .map((r) => r.materialId)
    .filter((mId) => mId !== '');
  const hasDuplicates = new Set(selectedMaterialIds).size !== selectedMaterialIds.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (hasDuplicates) {
      setError('Duplicate material detected. Please combine weights into a single row.');
      return;
    }

    const formattedMaterials = materialRows.map((r) => ({
      materialId: parseInt(r.materialId, 10),
      weightG: parseFloat(r.weightG),
    }));

    for (let r of formattedMaterials) {
      if (!r.materialId || isNaN(r.materialId)) {
        setError('Please select a material for all rows.');
        return;
      }
      if (!r.weightG || r.weightG <= 0) {
        setError('Weight must be greater than 0g for all materials.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name,
        category,
        materials: formattedMaterials,
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/products/${id}`, payload);
      } else {
        response = await api.post('/products', payload);
      }

      // Navigate to results page with product calculation
      navigate(`/products/${response.data.id}/result`, { state: { product: response.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error calculating recyclability score.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Calculator className="w-8 h-8 text-brand-600" />
          {isEditMode ? 'Edit Product Configuration' : 'Calculate Product Recyclability Score'}
        </h1>
        <p className="text-slate-500 mt-1">
          Specify material composition and weights in grams. The backend automatically looks up stored sustainability parameters to compute the circularity score.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {hasDuplicates && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <span>You have selected the same material more than once. Please merge their weights into one entry.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <div className="card-eco space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-brand-200 pb-3">1. Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eco-Friendly Wireless Mouse"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Material Composition Rows */}
        <div className="card-eco space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-200 pb-3 gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">2. Material Composition Breakdown</h2>
              <p className="text-xs text-slate-500">Pick materials from the database catalog; values are pre-verified.</p>
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="btn-secondary text-sm py-1.5 px-3 self-start sm:self-auto gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          </div>

          {fetchingMaterials ? (
            <div className="text-center py-8 text-slate-500">Loading verified materials database...</div>
          ) : (
            <div className="space-y-3">
              {materialRows.map((row, index) => {
                const selectedMat = materialsList.find((m) => m.id.toString() === row.materialId);
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-brand-50/50 border border-brand-200">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Material Name & Grade</label>
                      <select
                        required
                        value={row.materialId}
                        onChange={(e) => handleRowChange(index, 'materialId', e.target.value)}
                        className="input-field text-sm py-2 bg-white"
                      >
                        <option value="">Select material...</option>
                        {materialsList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.typeOrGrade ? `(${m.typeOrGrade})` : ''} {m.hazardous ? '⚠️ Hazardous' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-48">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Weight (grams)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          value={row.weightG}
                          onChange={(e) => handleRowChange(index, 'weightG', e.target.value)}
                          placeholder="e.g. 120"
                          className="input-field text-sm py-2 pr-8 bg-white"
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">g</span>
                      </div>
                    </div>

                    {/* Metadata pill badge */}
                    <div className="hidden lg:flex flex-col justify-end w-40 text-xs">
                      {selectedMat && (
                        <div className="text-[11px] text-slate-600 bg-white border border-brand-200 rounded-lg p-1.5 leading-tight">
                          <p><span className="font-semibold">Recyclable:</span> {selectedMat.recyclabilityPct}%</p>
                          <p><span className="font-semibold">PCR Content:</span> {selectedMat.recycledContentPct}%</p>
                        </div>
                      )}
                    </div>

                    <div className="self-end sm:self-center pt-2 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        disabled={materialRows.length === 1}
                        title="Remove material row"
                        className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Live Weight Summary Card */}
          <div className="mt-6 p-4 rounded-xl bg-white border-2 border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Total Product Weight</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  {totalWeightG.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
                  <span className="text-sm font-medium text-slate-500">grams</span>
                  {totalWeightG >= 1000 && (
                    <span className="text-xs text-brand-700 ml-2 font-semibold">
                      ({(totalWeightG / 1000).toFixed(2)} kg)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || hasDuplicates || totalWeightG <= 0}
              className="btn-primary w-full sm:w-auto px-6 py-3 gap-2 text-base shadow-md"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Evaluating Model...' : 'Calculate Recyclability Score'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
