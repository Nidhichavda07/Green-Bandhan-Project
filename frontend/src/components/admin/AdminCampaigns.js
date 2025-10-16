import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

const initialForm = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  location: '',
  max_volunteers: 50,
  is_active: true,
};

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/campaigns/');
      if (!res.ok) throw new Error('Failed to load campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://127.0.0.1:8000/api/campaigns/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create campaign');
      }
      setForm(initialForm);
      fetchCampaigns();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Manage Campaigns" onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Campaigns</h2>
          <p className="text-gray-600">Create and manage environmental campaigns</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-4">Add New Campaign</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="4" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">End Date</label>
                  <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., City Hall Grounds" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Volunteers</label>
                  <input type="number" name="max_volunteers" value={form.max_volunteers} onChange={handleChange} className="w-full border rounded px-3 py-2" min="1" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                  Active
                </label>
              </div>
              <button disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save Campaign'}
              </button>
            </form>
          </div>

          {/* List */}
          <div>
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Existing Campaigns</h3>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : campaigns.length === 0 ? (
                <p className="text-gray-600">No campaigns yet.</p>
              ) : (
                <ul className="space-y-3">
                  {campaigns.map((c) => (
                    <li key={c.id} className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-700">{c.title}</div>
                          <div className="text-xs text-gray-500">{c.start_date} → {c.end_date} • {c.location}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaigns;


