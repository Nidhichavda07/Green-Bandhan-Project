import React, { useEffect, useMemo, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import DynamicParksMap from '../shared/DynamicParksMap';

const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const { lat, lon } = data[0];
  return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
};

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coordsCache, setCoordsCache] = useState({});

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/donations/');
      if (!res.ok) throw new Error('Failed to load donations');
      const data = await res.json();
      setDonations(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonations(); }, []);

  useEffect(() => {
    const fetchMissingCoords = async () => {
      const updates = {};
      for (const d of donations) {
        if (!coordsCache[d.id] && d.pickup_address) {
          const coord = await geocodeAddress(d.pickup_address).catch(() => null);
          if (coord) updates[d.id] = coord;
        }
      }
      if (Object.keys(updates).length > 0) {
        setCoordsCache((c) => ({ ...c, ...updates }));
      }
    };
    if (donations.length > 0) fetchMissingCoords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donations]);

  const markers = useMemo(() => {
    return donations.map((d) => {
      const base = { id: d.id, name: `${d.donation_type} by ${d.donor_username || 'Donor'}`, description: d.description, address: d.pickup_address, features: `Qty: ${d.quantity || 1}`, oxygen_rating: 0 };
      if (d.latitude && d.longitude) {
        return { ...base, latitude: d.latitude, longitude: d.longitude };
      }
      if (coordsCache[d.id]) {
        return { ...base, latitude: coordsCache[d.id].latitude, longitude: coordsCache[d.id].longitude };
      }
      return null;
    }).filter(Boolean);
  }, [donations, coordsCache]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  const handleMarkerClick = (m) => {
    console.log('Admin clicked donation marker:', m.name);
    alert(`Pickup: ${m.name}\nAddress: ${m.address || 'N/A'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Manage Donations" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Donations</h2>
          <p className="text-gray-600">View recent donations and their pickup locations</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-green-700 mb-3">Pickup Map</h3>
            <DynamicParksMap parks={markers} height="500px" showConsoleLogs={true} isAdmin={true} onMarkerClick={handleMarkerClick} />
            <p className="text-sm text-gray-500 mt-2">Shows donations with coordinates or geocoded from pickup address.</p>
          </div>

          {/* List */}
          <div>
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Recent Donations</h3>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : donations.length === 0 ? (
                <p className="text-gray-600">No donations yet.</p>
              ) : (
                <ul className="space-y-3">
                  {donations.map((d) => (
                    <li key={d.id} className="border border-gray-200 rounded p-3">
                      <div className="font-medium text-green-700 flex items-center justify-between">
                        <span>{d.donation_type}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{d.status}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{d.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Pickup: {d.pickup_address}</div>
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

export default AdminDonations;


