import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  ShieldCheck,
  Layers,
  Sliders,
  BookOpen,
  Users,
  Plus,
  Trash2,
  Edit,
  Upload,
  AlertCircle,
  CheckCircle2,
  Save,
  ShieldAlert,
} from 'lucide-react';

const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState('materials');

  // Materials State
  const [materials, setMaterials] = useState([]);
  const [sources, setSources] = useState([]);
  const [materialModal, setMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [matForm, setMatForm] = useState({
    name: '',
    typeOrGrade: '',
    recyclabilityPct: 80,
    recycledContentPct: 20,
    disassemblyEase: 7,
    reusabilityPct: 50,
    repairability: 6,
    lifetimeYears: 10,
    hazardous: false,
    sourceId: '',
    notes: '',
  });

  // Settings State
  const [settings, setSettings] = useState({
    weightRecyclability: 0.25,
    weightRecycledContent: 0.15,
    weightDisassembly: 0.15,
    weightReusability: 0.15,
    weightRepairability: 0.15,
    weightLifetime: 0.15,
    hazardousPenaltyWeight: 0.30,
    maxLifetimeYears: 20,
    thresholdPoorMax: 40,
    thresholdModerateMax: 70,
  });

  // Sources State
  const [sourceModal, setSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [srcForm, setSrcForm] = useState({
    title: '',
    publisher: '',
    year: 2026,
    linkOrFilePath: '',
    pageReference: '',
  });

  // Users State
  const [usersList, setUsersList] = useState([]);

  // General Status State
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes, setRes, uRes] = await Promise.all([
        api.get('/materials'),
        api.get('/sources'),
        api.get('/settings'),
        api.get('/users'),
      ]);
      setMaterials(mRes.data);
      setSources(sRes.data);
      setSettings(setRes.data);
      setUsersList(uRes.data);
    } catch (err) {
      setError('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  // 1. Materials Management
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...matForm,
        recyclabilityPct: parseFloat(matForm.recyclabilityPct),
        recycledContentPct: parseFloat(matForm.recycledContentPct),
        disassemblyEase: parseInt(matForm.disassemblyEase, 10),
        reusabilityPct: parseFloat(matForm.reusabilityPct),
        repairability: parseInt(matForm.repairability, 10),
        lifetimeYears: parseFloat(matForm.lifetimeYears),
        sourceId: matForm.sourceId ? parseInt(matForm.sourceId, 10) : null,
      };

      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial.id}`, payload);
        showNotification('Material updated successfully');
      } else {
        await api.post('/materials', payload);
        showNotification('Material added successfully');
      }

      setMaterialModal(false);
      setEditingMaterial(null);
      loadData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error saving material', true);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      showNotification('Material deleted');
      setMaterials(materials.filter((m) => m.id !== id));
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error deleting material', true);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    try {
      setUploadingCsv(true);
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await api.post('/materials/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification(`Imported: ${res.data.imported}, Updated: ${res.data.updated}`);
      setCsvFile(null);
      loadData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'CSV upload failed', true);
    } finally {
      setUploadingCsv(false);
    }
  };

  // 2. Settings Live Sum Check
  const positiveWeightsSum =
    (parseFloat(settings.weightRecyclability) || 0) +
    (parseFloat(settings.weightRecycledContent) || 0) +
    (parseFloat(settings.weightDisassembly) || 0) +
    (parseFloat(settings.weightReusability) || 0) +
    (parseFloat(settings.weightRepairability) || 0) +
    (parseFloat(settings.weightLifetime) || 0);

  const isSumValid = Math.abs(positiveWeightsSum - 1.0) <= 0.001;

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isSumValid) {
      showNotification('The 6 positive parameter weights must sum strictly to 1.0', true);
      return;
    }
    try {
      await api.put('/settings', settings);
      showNotification('Scoring settings updated successfully');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error updating settings', true);
    }
  };

  // 3. Source Management
  const handleSaveSource = async (e) => {
    e.preventDefault();
    try {
      if (editingSource) {
        await api.put(`/sources/${editingSource.id}`, srcForm);
        showNotification('Citation updated');
      } else {
        await api.post('/sources', srcForm);
        showNotification('Citation added');
      }
      setSourceModal(false);
      setEditingSource(null);
      loadData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error saving source', true);
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm('Delete this citation source?')) return;
    try {
      await api.delete(`/sources/${id}`);
      showNotification('Source deleted');
      setSources(sources.filter((s) => s.id !== id));
    } catch (err) {
      showNotification('Failed to delete source', true);
    }
  };

  // 4. User Status & Role Toggles
  const handleToggleUserStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}/status?active=${!user.active}`);
      setUsersList(usersList.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)));
      showNotification('User status updated');
    } catch (err) {
      showNotification('Failed to update status', true);
    }
  };

  const handleToggleUserRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.put(`/users/${user.id}/role?role=${newRole}`);
      setUsersList(usersList.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      showNotification(`User role updated to ${newRole}`);
    } catch (err) {
      showNotification('Failed to update role', true);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading admin console...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
            System Administration Console
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure models, curate materials, calibrate algorithms, and manage users</p>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-200 space-x-2">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm rounded-t-xl transition ${
            activeTab === 'materials'
              ? 'bg-brand-100 text-brand-700 border-b-2 border-brand-600 font-semibold'
              : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
          }`}
        >
          <Layers className="w-4 h-4" /> Materials Catalog ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm rounded-t-xl transition ${
            activeTab === 'settings'
              ? 'bg-brand-100 text-brand-700 border-b-2 border-brand-600 font-semibold'
              : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
          }`}
        >
          <Sliders className="w-4 h-4" /> Scoring Weights & Settings
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm rounded-t-xl transition ${
            activeTab === 'sources'
              ? 'bg-brand-100 text-brand-700 border-b-2 border-brand-600 font-semibold'
              : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Citations & Sources ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm rounded-t-xl transition ${
            activeTab === 'users'
              ? 'bg-brand-100 text-brand-700 border-b-2 border-brand-600 font-semibold'
              : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
          }`}
        >
          <Users className="w-4 h-4" /> User Management ({usersList.length})
        </button>
      </div>

      {/* TAB 1: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* CSV Import */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border file:border-brand-200 file:bg-white file:text-xs file:font-medium file:text-slate-700 hover:file:bg-brand-50"
              />
              <button
                type="button"
                onClick={handleCsvUpload}
                disabled={!csvFile || uploadingCsv}
                className="btn-secondary text-xs py-2 px-3 gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingCsv ? 'Importing...' : 'Upload CSV'}
              </button>
            </div>

            <button
              onClick={() => {
                setEditingMaterial(null);
                setMatForm({
                  name: '',
                  typeOrGrade: '',
                  recyclabilityPct: 80,
                  recycledContentPct: 20,
                  disassemblyEase: 7,
                  reusabilityPct: 50,
                  repairability: 6,
                  lifetimeYears: 10,
                  hazardous: false,
                  sourceId: sources[0]?.id || '',
                  notes: '',
                });
                setMaterialModal(true);
              }}
              className="btn-primary text-sm py-2 px-3.5 gap-2"
            >
              <Plus className="w-4 h-4" /> Add New Material
            </button>
          </div>

          <div className="card-eco p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50 border-b border-brand-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Material</th>
                    <th className="py-3 px-6">Grade</th>
                    <th className="py-3 px-6">Recyclable</th>
                    <th className="py-3 px-6">PCR Content</th>
                    <th className="py-3 px-6">Disassembly</th>
                    <th className="py-3 px-6">Hazardous</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-200/60">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-brand-50/40 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{m.name}</td>
                      <td className="py-3.5 px-6 text-slate-600">{m.typeOrGrade || '-'}</td>
                      <td className="py-3.5 px-6 text-slate-600">{m.recyclabilityPct}%</td>
                      <td className="py-3.5 px-6 text-slate-600">{m.recycledContentPct}%</td>
                      <td className="py-3.5 px-6 text-slate-600">{m.disassemblyEase}/10</td>
                      <td className="py-3.5 px-6">
                        {m.hazardous ? (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Hazardous
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Non-hazardous</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingMaterial(m);
                            setMatForm({
                              name: m.name,
                              typeOrGrade: m.typeOrGrade || '',
                              recyclabilityPct: m.recyclabilityPct,
                              recycledContentPct: m.recycledContentPct,
                              disassemblyEase: m.disassemblyEase,
                              reusabilityPct: m.reusabilityPct,
                              repairability: m.repairability,
                              lifetimeYears: m.lifetimeYears,
                              hazardous: m.hazardous,
                              sourceId: m.sourceId || '',
                              notes: m.notes || '',
                            });
                            setMaterialModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg"
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
        </div>
      )}

      {/* TAB 2: SCORING SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
          <div className="card-eco space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Circularity Scoring Algorithm Weights</h2>
              <p className="text-xs text-slate-500 mt-1">
                The 6 positive parameter weights must sum strictly to 1.0 (100%).
              </p>
            </div>

            {/* Live Sum Indicator */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isSumValid
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {isSumValid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-semibold">
                  Sum of Positive Weights: {positiveWeightsSum.toFixed(3)}
                </span>
              </div>
              <span className="text-xs font-medium">
                {isSumValid ? 'Weights balanced (1.000)' : 'Must equal exactly 1.000'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Recyclability Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.weightRecyclability}
                  onChange={(e) => setSettings({ ...settings, weightRecyclability: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Recycled Content Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.weightRecycledContent}
                  onChange={(e) => setSettings({ ...settings, weightRecycledContent: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Disassembly Ease Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.weightDisassembly}
                  onChange={(e) => setSettings({ ...settings, weightDisassembly: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reusability Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.weightReusability}
                  onChange={(e) => setSettings({ ...settings, weightReusability: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Repairability Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.weightRepairability}
                  onChange={(e) => setSettings({ ...settings, weightRepairability: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Lifetime Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.weightLifetime}
                  onChange={(e) => setSettings({ ...settings, weightLifetime: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-t border-brand-200 pt-4">Penalties & Thresholds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hazardous Penalty Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={settings.hazardousPenaltyWeight}
                  onChange={(e) => setSettings({ ...settings, hazardousPenaltyWeight: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Max Baseline Lifetime (Years)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={settings.maxLifetimeYears}
                  onChange={(e) => setSettings({ ...settings, maxLifetimeYears: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Poor Band Ceiling</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="99"
                  required
                  value={settings.thresholdPoorMax}
                  onChange={(e) => setSettings({ ...settings, thresholdPoorMax: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Moderate Band Ceiling</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="99"
                  required
                  value={settings.thresholdModerateMax}
                  onChange={(e) => setSettings({ ...settings, thresholdModerateMax: parseFloat(e.target.value) })}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isSumValid}
              className="btn-primary w-full gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Calibrated Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SOURCES & CITATIONS */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingSource(null);
                setSrcForm({ title: '', publisher: '', year: 2026, linkOrFilePath: '', pageReference: '' });
                setSourceModal(true);
              }}
              className="btn-primary text-sm py-2 px-3.5 gap-2"
            >
              <Plus className="w-4 h-4" /> Add Citation Source
            </button>
          </div>

          <div className="card-eco p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50 border-b border-brand-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-6">Publisher / Journal</th>
                    <th className="py-3 px-6">Year</th>
                    <th className="py-3 px-6">Page / Ref</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-200/60">
                  {sources.map((s) => (
                    <tr key={s.id} className="hover:bg-brand-50/40 transition">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{s.title}</td>
                      <td className="py-3.5 px-6 text-slate-600">{s.publisher || '-'}</td>
                      <td className="py-3.5 px-6 text-slate-600">{s.year || '-'}</td>
                      <td className="py-3.5 px-6 text-slate-600">{s.pageReference || '-'}</td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingSource(s);
                            setSrcForm({ ...s });
                            setSourceModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(s.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg"
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
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card-eco p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-50 border-b border-brand-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-50/40 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3.5 px-6 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-6">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-brand-200 bg-white hover:bg-brand-50 text-brand-700 font-medium"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                          u.active
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Material Form */}
      {materialModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-eco max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingMaterial ? 'Edit Material Parameter Record' : 'Add New Verified Material'}
            </h3>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  value={matForm.name}
                  onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Grade / Specification</label>
                <input
                  type="text"
                  value={matForm.typeOrGrade}
                  onChange={(e) => setMatForm({ ...matForm, typeOrGrade: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Recyclability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={matForm.recyclabilityPct}
                    onChange={(e) => setMatForm({ ...matForm, recyclabilityPct: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">PCR Content (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={matForm.recycledContentPct}
                    onChange={(e) => setMatForm({ ...matForm, recycledContentPct: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Disassembly Ease (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={matForm.disassemblyEase}
                    onChange={(e) => setMatForm({ ...matForm, disassemblyEase: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Repairability (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={matForm.repairability}
                    onChange={(e) => setMatForm({ ...matForm, repairability: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reusability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={matForm.reusabilityPct}
                    onChange={(e) => setMatForm({ ...matForm, reusabilityPct: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lifetime (Years)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={matForm.lifetimeYears}
                    onChange={(e) => setMatForm({ ...matForm, lifetimeYears: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hazardousCheckbox"
                  checked={matForm.hazardous}
                  onChange={(e) => setMatForm({ ...matForm, hazardous: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-300 w-4 h-4"
                />
                <label htmlFor="hazardousCheckbox" className="text-sm font-semibold text-slate-700">
                  Hazardous Material (incurs scoring penalty)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Citation Source</label>
                <select
                  value={matForm.sourceId}
                  onChange={(e) => setMatForm({ ...matForm, sourceId: e.target.value })}
                  className="input-field text-sm"
                >
                  <option value="">No source linked</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-brand-200">
                <button
                  type="button"
                  onClick={() => setMaterialModal(false)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-4"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Source Form */}
      {sourceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-eco max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingSource ? 'Edit Citation' : 'Add New Citation Reference'}
            </h3>

            <form onSubmit={handleSaveSource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={srcForm.title}
                  onChange={(e) => setSrcForm({ ...srcForm, title: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Publisher</label>
                <input
                  type="text"
                  value={srcForm.publisher}
                  onChange={(e) => setSrcForm({ ...srcForm, publisher: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Year</label>
                  <input
                    type="number"
                    value={srcForm.year}
                    onChange={(e) => setSrcForm({ ...srcForm, year: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Page Ref</label>
                  <input
                    type="text"
                    value={srcForm.pageReference}
                    onChange={(e) => setSrcForm({ ...srcForm, pageReference: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-brand-200">
                <button
                  type="button"
                  onClick={() => setSourceModal(false)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-4"
                >
                  Save Citation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
