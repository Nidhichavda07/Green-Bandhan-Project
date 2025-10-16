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
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ pickup_latitude: '', pickup_longitude: '' });
  const [selectedDonation, setSelectedDonation] = useState(null);

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
    const donation = donations.find(d => d.id === m.id);
    if (donation) setSelectedDonation(donation);
  };

  const startEdit = (d) => {
    setEditing(d.id);
    setForm({
      pickup_latitude: d.pickup_latitude ?? '',
      pickup_longitude: d.pickup_longitude ?? ''
    });
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem('access_token');
    const body = {
      pickup_latitude: form.pickup_latitude === '' ? null : parseFloat(form.pickup_latitude),
      pickup_longitude: form.pickup_longitude === '' ? null : parseFloat(form.pickup_longitude),
    };
    await fetch(`http://127.0.0.1:8000/api/donations/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    setEditing(null);
    fetchDonations();
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
                      <div className="text-xs text-gray-500">Pickup coords: {d.pickup_latitude ?? '–'}, {d.pickup_longitude ?? '–'}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="text-green-700 text-xs underline" onClick={() => setSelectedDonation(d)}>View Details</button>
                        <a className="text-green-700 text-xs underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.pickup_latitude || ''},${d.pickup_longitude || ''}`)}`} target="_blank" rel="noreferrer">Open pickup in Maps</a>
                      </div>

                      {editing === d.id ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <input className="border rounded px-2 py-1 text-xs" placeholder="Pickup lat" value={form.pickup_latitude} onChange={(e)=>setForm((f)=>({...f, pickup_latitude: e.target.value}))} />
                          <input className="border rounded px-2 py-1 text-xs" placeholder="Pickup lng" value={form.pickup_longitude} onChange={(e)=>setForm((f)=>({...f, pickup_longitude: e.target.value}))} />
                          <div className="col-span-2 flex gap-2">
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded" onClick={()=>saveEdit(d.id)}>Save</button>
                            <button className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded" onClick={()=>setEditing(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <button className="text-xs bg-green-600 text-white px-2 py-1 rounded" onClick={()=>startEdit(d)}>Edit coordinates</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-green-700">Donation Details</h3>
                <button onClick={() => setSelectedDonation(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donation Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">Donation Information</h4>
                    <p><strong>Type:</strong> {selectedDonation.donation_type}</p>
                    <p><strong>Status:</strong> {selectedDonation.status}</p>
                    <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
                    <p><strong>Donor:</strong> {selectedDonation.donor_username || 'Unknown'}</p>
                    <p><strong>Contact:</strong> {selectedDonation.contact_number || 'Not provided'}</p>
                    {selectedDonation.preferred_pickup_time && (
                      <p><strong>Preferred Pickup:</strong> {new Date(selectedDonation.preferred_pickup_time).toLocaleString()}</p>
                    )}
                    {selectedDonation.notes && (
                      <p><strong>Notes:</strong> {selectedDonation.notes}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">Description</h4>
                    <p>{selectedDonation.description}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">Pickup Location</h4>
                    <p><strong>Address:</strong> {selectedDonation.pickup_address}</p>
                    {(selectedDonation.pickup_latitude || selectedDonation.pickup_longitude) && (
                      <p><strong>Coordinates:</strong> {selectedDonation.pickup_latitude ?? '–'}, {selectedDonation.pickup_longitude ?? '–'}</p>
                    )}
                  </div>

                </div>

                {/* Map */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-3">Location Map</h4>
                  <DynamicParksMap 
                    parks={[{
                      id: selectedDonation.id,
                      name: `${selectedDonation.donation_type} pickup`,
                      description: selectedDonation.description,
                      address: selectedDonation.pickup_address,
                      latitude: selectedDonation.pickup_latitude || coordsCache[selectedDonation.id]?.latitude,
                      longitude: selectedDonation.pickup_longitude || coordsCache[selectedDonation.id]?.longitude,
                      features: `Status: ${selectedDonation.status}`,
                      oxygen_rating: 0
                    }]}
                    height="400px"
                    showConsoleLogs={true}
                    isAdmin={true}
                  />
                  <div className="mt-3 flex gap-2">
                    <a 
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700" 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedDonation.pickup_latitude || ''},${selectedDonation.pickup_longitude || ''}`)}`} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      Open Pickup in Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDonations;


