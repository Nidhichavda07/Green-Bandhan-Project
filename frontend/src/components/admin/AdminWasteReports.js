import React, { useEffect, useMemo, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import DynamicParksMap from '../shared/DynamicParksMap';

const AdminWasteReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/waste-reports/');
      if (!res.ok) throw new Error('Failed to load waste reports');
      const data = await res.json();
      setReports(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  const markers = useMemo(() => {
    return reports.map((r) => {
      const name = `${r.title} (${r.issue_type})`;
      const base = {
        id: r.id,
        name,
        description: r.description,
        address: r.location,
        features: `Status: ${r.status}`,
        oxygen_rating: 0,
      };
      if (r.latitude && r.longitude) {
        return { ...base, latitude: r.latitude, longitude: r.longitude };
      }
      return null;
    }).filter(Boolean);
  }, [reports]);

  const handleMarkerClick = (m) => {
    console.log('Admin clicked waste marker:', m.name);
    alert(`${m.name}\n${m.address || ''}`);
  };

  const updateStatus = async (id, status) => {
    setSavingId(id);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/waste-reports/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to update status');
      }
      await fetchReports();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const STATUS_OPTIONS = [
    { value: 'reported', label: 'Reported' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Manage Waste Reports" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Waste Reports</h2>
          <p className="text-gray-600">Track and update report statuses. Map shows reports with coordinates.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-green-700 mb-3">Reports Map</h3>
            <DynamicParksMap parks={markers} height="500px" showConsoleLogs={true} isAdmin={true} onMarkerClick={handleMarkerClick} />
            <p className="text-sm text-gray-500 mt-2">Only reports with coordinates are shown on the map.</p>
          </div>

          {/* List */}
          <div>
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">All Reports</h3>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : reports.length === 0 ? (
                <p className="text-gray-600">No reports yet.</p>
              ) : (
                <ul className="space-y-3">
                  {reports.map((r) => (
                    <li key={r.id} className="border border-gray-200 rounded p-3">
                      <div className="flex items-start justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-green-700">{r.title}</div>
                          <div className="text-xs text-gray-500">{r.issue_type} • {r.location}</div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</div>
                        </div>
                        <div className="text-right">
                          <label className="block text-xs text-gray-500 mb-1">Status</label>
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                            disabled={savingId === r.id}
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
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

export default AdminWasteReports;


