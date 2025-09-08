import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const AdminParkForm = ({ onParkAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    oxygen_rating: '',
    features: '',
    address: '',
  });
  
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  
  const [markerPosition, setMarkerPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const mapRef = useRef(null);

  // Default center (New Delhi)
  const defaultCenter = [28.6139, 77.2090];
  const mapCenter = markerPosition || defaultCenter;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleLocationSelect = (lat, lng) => {
    setLocation({ latitude: lat, longitude: lng });
    setMarkerPosition([lat, lng]);
    setError('');
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude);
        setGettingLocation(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleAddressSearch = async () => {
    if (!formData.address.trim()) {
      setError('Please enter an address to search.');
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setError('Address not found. Please try a different address.');
        setGeocoding(false);
        return;
      }

      const { lat, lon } = data[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      handleLocationSelect(latitude, longitude);
      setGeocoding(false);
    } catch (err) {
      setError(`Error searching address: ${err.message}`);
      setGeocoding(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Park name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.oxygen_rating) return 'Oxygen rating is required';
    const rating = Number(formData.oxygen_rating);
    if (rating < 1 || rating > 10) return 'Oxygen rating must be between 1-10';
    if (!formData.features.trim()) return 'Features are required';
    if (!location.latitude || !location.longitude) return 'Please select a location on the map';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      oxygen_rating: Number(formData.oxygen_rating),
      features: formData.features.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      address: formData.address.trim() || null,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/parks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create park');
      }

      setSuccess('Park added successfully!');
      setFormData({
        name: '',
        description: '',
        oxygen_rating: '',
        features: '',
        address: '',
      });
      setLocation({ latitude: null, longitude: null });
      setMarkerPosition(null);
      
      if (onParkAdded) {
        onParkAdded();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <h3 className="text-2xl font-bold text-green-700 mb-6">Add New Park</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Park Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter park name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oxygen Rating *
            </label>
            <input
              type="number"
              name="oxygen_rating"
              min="1"
              max="10"
              value={formData.oxygen_rating}
              onChange={handleInputChange}
              placeholder="1-10"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address for geocoding"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={geocoding || !formData.address.trim()}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {geocoding ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the park, its amenities, and what makes it special"
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features *
          </label>
          <textarea
            name="features"
            value={formData.features}
            onChange={handleInputChange}
            placeholder="List features like: walking trails, playground, benches, parking, etc."
            rows="2"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Map Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={gettingLocation}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {gettingLocation ? 'Getting...' : '📍 Use My Location'}
            </button>
          </div>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        handleLocationSelect(lat, lng);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{formData.name || 'Park Location'}</strong>
                        <br />
                        {location.latitude && location.longitude && (
                          <>
                            Lat: {location.latitude.toFixed(6)}
                            <br />
                            Lng: {location.longitude.toFixed(6)}
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Click on the map to set the park location. You can drag the marker to adjust.
          </p>
          
          {location.latitude && location.longitude && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected Location:</span>
                <br />
                Latitude: {location.latitude.toFixed(6)}
                <br />
                Longitude: {location.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding Park...' : 'Add Park'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminParkForm;
