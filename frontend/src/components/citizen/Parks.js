import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DynamicParksMap from '../shared/DynamicParksMap';

const Parks = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://127.0.0.1:8000/api/parks/');
        if (!response.ok) throw new Error('Failed to fetch parks');
        const data = await response.json();
        setParks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  const handleMarkerClick = (park) => {
    console.log('Citizen clicked marker:', park.name);
    alert(`🌱 Discovered: ${park.name}\n⭐ Oxygen Rating: ${park.oxygen_rating}/10\n📍 ${park.address || 'Location available'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Green Spaces Near You</h2>
          <p className="text-gray-600">Discover parks and green spaces in your area</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading parks...</p>
          </div>
        ) : parks.length > 0 ? (
          <>
            {/* Interactive Map */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Interactive Map</h3>
              <DynamicParksMap 
                parks={parks}
                height="500px"
                showConsoleLogs={true}
                isAdmin={false}
                onMarkerClick={handleMarkerClick}
              />
              <p className="text-sm text-gray-500 mt-2">
                🗺️ Map automatically centers on your parks • Click markers for details • {parks.filter(p => p.latitude && p.longitude).length} parks with location data
              </p>
            </div>

            {/* Parks List */}
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-4">All Parks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parks.map((park) => (
                  <Link
                    key={park.id}
                    to={`/parks/${park.id}`}
                    className="block bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow hover:-translate-y-0.5 transform duration-150"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-green-700">{park.name}</h4>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {park.oxygen_rating}/10
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-3">{park.description}</p>
                    
                    {park.address && (
                      <div className="text-sm text-gray-600 mb-2 flex items-start">
                        <span className="text-gray-400 mr-2">📍</span>
                        {park.address}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Features:</span> {park.features}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <p className="text-gray-600 text-lg">No parks found in your area yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for new green spaces!</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto mt-10">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Parks;


