import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminParkForm from './AdminParkForm';
import DynamicParksMap from '../shared/DynamicParksMap';

const AdminParks = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchParks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/parks/');
      if (!res.ok) throw new Error('Failed to load parks');
      const data = await res.json();
      setParks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParks();
  }, []);

  const handleParkAdded = () => {
    fetchParks();
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  const handleMarkerClick = (park) => {
    console.log('Admin clicked marker:', park.name);
    alert(`🔧 Admin clicked: ${park.name}\n⭐ Oxygen Rating: ${park.oxygen_rating}/10\n📍 ${park.address || 'No address'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Manage Parks" onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!showForm ? (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-green-700 mb-2">Parks Management</h2>
                <p className="text-gray-600">Manage green spaces for citizens to discover</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                + Add New Park
              </button>
            </div>
          </>
        ) : (
          <AdminParkForm 
            onParkAdded={handleParkAdded}
            onCancel={() => setShowForm(false)}
          />
        )}

        {!showForm && (
          <>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Parks Overview Map</h3>
              <DynamicParksMap 
                parks={parks}
                height="500px"
                showConsoleLogs={true}
                isAdmin={true}
                onMarkerClick={handleMarkerClick}
              />
              <p className="text-sm text-gray-500 mt-2">
                🔧 Admin Map View • Auto-centers on parks • Click markers for details • {parks.filter(p => p.latitude && p.longitude).length} parks with location data
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-green-700 mb-2">All Parks</h3>
              <p className="text-gray-600">Manage and review all registered green spaces</p>
            </div>
        
            {loading && parks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">Loading parks...</p>
              </div>
            ) : parks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No parks have been added yet. Create your first park above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parks.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-green-700">{p.name}</h4>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {p.oxygen_rating}/10
                      </span>
                    </div>
                    
                    {p.address && (
                      <div className="text-sm text-gray-600 mb-2 flex items-start">
                        <span className="text-gray-400 mr-2">📍</span>
                        {p.address}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-700 mb-3 line-clamp-2">{p.description}</div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <span className="font-medium">Features:</span> {p.features}
                    </div>

                    {(p.latitude && p.longitude) ? (
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✅ Location set on map
                      </div>
                    ) : (
                      <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⚠️ No location data
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminParks;


