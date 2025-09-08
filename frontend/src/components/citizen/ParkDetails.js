import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicParksMap from '../shared/DynamicParksMap';

const ParkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPark = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/parks/${id}/`);
        if (!res.ok) throw new Error('Failed to load park');
        const data = await res.json();
        setPark(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPark();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-green-700">Park Details</h2>
            <p className="text-gray-600">View location and information</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading || !park ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading park...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-green-700">{park.name}</h3>
              <div className="text-gray-600 mt-2">
                {park.address && <div className="mb-1">📍 {park.address}</div>}
                <div className="text-sm">Oxygen Rating: <span className="font-medium">{park.oxygen_rating}/10</span></div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-green-700 mb-3">Location</h4>
              <DynamicParksMap 
                parks={[park]}
                height="450px"
                showConsoleLogs={true}
                isAdmin={false}
              />
              <p className="text-xs text-gray-500 mt-2">Tip: Tap the marker to see details.</p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-green-700 mb-3">About this park</h4>
              <p className="text-gray-700 mb-3">{park.description || 'No description provided.'}</p>
              <div className="text-sm text-gray-600">
                <strong>Features:</strong> {park.features || '—'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParkDetails;


