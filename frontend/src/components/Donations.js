import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../output.css";

const donationImages = {
  clothing: "https://img.icons8.com/color/96/shirt.png",
  books: "https://img.icons8.com/color/96/books.png",
  electronics: "https://img.icons8.com/color/96/electronics.png",
  furniture: "https://img.icons8.com/color/96/sofa.png",
  other: "https://img.icons8.com/color/96/miscellaneous.png",
};

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ username: "GuestUser", id: 1 }); // Replace with actual logged-in user ID
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    pickup_address: "",
    quantity: 1,
    contact_number: "",
    preferred_pickup_time: "",
    pickup_latitude: "",
    pickup_longitude: "",
    notes: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/donations/", {
        headers: { "Content-Type": "application/json" },
      });
      setDonations(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const handleCardClick = (type) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const body = new FormData();
      body.append('donation_type', selectedType);
      body.append('description', formData.description);
      body.append('pickup_address', formData.pickup_address);
      body.append('quantity', formData.quantity);
      body.append('contact_number', formData.contact_number);
      if (formData.preferred_pickup_time) body.append('preferred_pickup_time', formData.preferred_pickup_time);
      if (formData.notes) body.append('notes', formData.notes);
      if (formData.pickup_latitude && formData.pickup_latitude.trim() !== "") body.append('pickup_latitude', parseFloat(formData.pickup_latitude));
      if (formData.pickup_longitude && formData.pickup_longitude.trim() !== "") body.append('pickup_longitude', parseFloat(formData.pickup_longitude));
      if (imageFile) body.append('image', imageFile);
      body.append('status', 'pending');

      console.log('Submitting donation with data:', {
        donation_type: selectedType,
        description: formData.description,
        pickup_address: formData.pickup_address,
        quantity: formData.quantity,
        contact_number: formData.contact_number,
        preferred_pickup_time: formData.preferred_pickup_time,
        notes: formData.notes,
        pickup_latitude: formData.pickup_latitude,
        pickup_longitude: formData.pickup_longitude,
        image: imageFile ? 'File selected' : 'No file'
      });

      const response = await axios.post("http://127.0.0.1:8000/api/donations/", body, {
        headers: { 
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('Donation submitted successfully:', response.data);
      alert("Donation submitted successfully!");
      setShowForm(false);
      setFormData({
        description: "",
        pickup_address: "",
        quantity: 1,
        contact_number: "",
        preferred_pickup_time: "",
        pickup_latitude: "",
        pickup_longitude: "",
        notes: "",
      });
      setImageFile(null);
      fetchDonations();
    } catch (err) {
      console.error('Donation submission error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = "Failed to submit donation.";
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errors = Object.values(err.response.data).flat();
          errorMessage = `Error: ${errors.join(', ')}`;
        } else {
          errorMessage = `Error: ${err.response.data}`;
        }
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }
    
    // Show loading state
    const button = document.querySelector('[data-location-button]');
    if (button) {
      button.textContent = '📍 Getting location...';
      button.disabled = true;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((d) => ({ 
          ...d, 
          pickup_latitude: latitude.toFixed(6), 
          pickup_longitude: longitude.toFixed(6) 
        }));
        
        // Reset button
        if (button) {
          button.textContent = '📍 Use my current location';
          button.disabled = false;
        }
        
        alert(`Location found! Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        // Reset button
        if (button) {
          button.textContent = '📍 Use my current location';
          button.disabled = false;
        }
        
        let message = 'Unable to retrieve your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message += 'Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable. Please enter coordinates manually.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out. Please try again or enter coordinates manually.';
            break;
          default:
            message += 'Please enter coordinates manually.';
            break;
        }
        alert(message);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading donations...</p>;

  const donationTypes = Object.keys(donationImages);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <span className="font-bold text-2xl text-green-700">GreenBandhan</span>
              <div className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-green-700 font-medium transition">Home</Link>
                <Link to="/campaigns" className="text-gray-700 hover:text-green-700 font-medium transition">Campaigns</Link>
                <Link to="/parks" className="text-gray-700 hover:text-green-700 font-medium transition">Parks</Link>
                <Link to="/reports" className="text-gray-700 hover:text-green-700 font-medium transition">Reports</Link>
                <Link to="/donations" className="text-green-700 font-semibold border-b-2 border-green-700">Donations</Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button onClick={handleLogout} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                    Logout
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200">
                    Profile
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-green-100 text-center pt-28 pb-16">
        <h2 className="text-4xl font-extrabold text-green-800">Our Donations</h2>
        <p className="text-lg text-gray-700 mt-2">
          Browse through ongoing and past donations from our community.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Donation Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12">
          {donationTypes.map((type) => (
            <div
              key={type}
              onClick={() => handleCardClick(type)}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col items-center hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
            >
              <img src={donationImages[type]} alt={type} className="w-20 h-20 object-contain mb-3" />
              <p className="text-gray-700 font-semibold capitalize">{type}</p>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6">Latest Donations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
              <img src={donationImages[donation.donation_type] || donationImages["other"]} alt={donation.donation_type} className="w-full h-48 object-contain bg-gray-50" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 capitalize text-green-700">{donation.donation_type}</h3>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Donor:</span> {donation.donor_username || 'Donor'}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Status:</span> {donation.status}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Pickup Address:</span> {donation.pickup_address}</p>
                {(donation.pickup_latitude || donation.pickup_longitude) && (
                  <p className="text-gray-600 mb-1"><span className="font-semibold">Pickup Coords:</span> {donation.pickup_latitude ?? '–'}, {donation.pickup_longitude ?? '–'}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">Created at: {new Date(donation.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-700">Donate {selectedType}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-700 border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="How many items?"
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        min={1}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pickup Time</label>
                      <input
                        type="datetime-local"
                        name="preferred_pickup_time"
                        value={formData.preferred_pickup_time}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe what you're donating..."
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows="3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any additional notes..."
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows="2"
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-700 border-b pb-2">Location Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address *</label>
                      <textarea
                        name="pickup_address"
                        value={formData.pickup_address}
                        onChange={handleChange}
                        placeholder="Full address where items can be picked up"
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows="2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Coordinates (Optional)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          name="pickup_latitude" 
                          value={formData.pickup_latitude} 
                          onChange={handleChange} 
                          placeholder="Latitude" 
                          className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                        />
                        <input 
                          type="text" 
                          name="pickup_longitude" 
                          value={formData.pickup_longitude} 
                          onChange={handleChange} 
                          placeholder="Longitude" 
                          className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={useMyLocation} 
                        data-location-button
                        className="w-full mt-2 bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        📍 Use my current location
                      </button>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e)=>setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} 
                        className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload a photo of the items you're donating</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Submit Donation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
