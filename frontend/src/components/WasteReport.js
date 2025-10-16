import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../output.css";

// Static category data
const issueCategories = [
  { type: "garbage", name: "Garbage", icon: "https://img.icons8.com/color/96/garbage.png", description: "Report uncollected garbage or waste." },
  { type: "recycling", name: "Recycling", icon: "https://img.icons8.com/color/96/recycle.png", description: "Report recycling issues or missed pickups." },
  { type: "water", name: "Water Issue", icon: "https://img.icons8.com/color/96/water.png", description: "Report water leakage or contamination." },
  { type: "other", name: "Other", icon: "https://img.icons8.com/color/96/miscellaneous.png", description: "Report other environmental concerns." },
];

const WasteReport = ({ user }) => {
  const formRef = useRef(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    issue_type: "garbage", // Default to garbage
    latitude: "",
    longitude: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/waste-reports/");
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((d) => ({ 
          ...d, 
          latitude: latitude.toFixed(6), 
          longitude: longitude.toFixed(6) 
        }));
        alert(`Location found! Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const body = new FormData();
      body.append('title', formData.title);
      body.append('description', formData.description);
      body.append('location', formData.location);
      body.append('issue_type', formData.issue_type);
      if (formData.latitude && formData.latitude.trim() !== "") body.append('latitude', parseFloat(formData.latitude));
      if (formData.longitude && formData.longitude.trim() !== "") body.append('longitude', parseFloat(formData.longitude));
      if (imageFile) body.append('image', imageFile);

      console.log('Submitting waste report with data:', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        issue_type: formData.issue_type,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image: imageFile ? 'File selected' : 'No file'
      });

      const response = await axios.post("http://127.0.0.1:8000/api/waste-reports/", body, {
        headers: { 
          ...(token ? { Authorization: `Token ${token}` } : {}),
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('Waste report submitted successfully:', response.data);
      alert("Waste report submitted successfully!");
    setShowForm(false);
      setFormData({ title: "", description: "", location: "", issue_type: "garbage", latitude: "", longitude: "" });
      setImageFile(null);
      fetchReports(); // Refresh the list
    } catch (err) {
      console.error('Waste report submission error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = "Failed to submit waste report.";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object' && data !== null) {
          const formatted = Object.entries(data).map(([field, msgs]) => {
            const messages = Array.isArray(msgs) ? msgs : [String(msgs)];
            return `${field}: ${messages.join(', ')}`;
          });
          if (formatted.length > 0) {
            errorMessage = formatted.join('\n');
          } else {
            errorMessage = 'An error occurred while submitting the report.';
          }
        } else {
          errorMessage = String(data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    window.location.reload();
  };

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
                <Link to="/wastereport" className="text-green-700 font-semibold border-b-2 border-green-700">Reports</Link>
                <Link to="/donations" className="text-gray-700 hover:text-green-700 font-medium transition">Donations</Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* <span className="text-gray-700 font-medium">Hello, {user.username}</span> */}
              <button onClick={handleLogout} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">Logout</button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200">Profile</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-green-100 text-center pt-20 pb-12">
        <h2 className="text-4xl font-extrabold text-green-800">Waste Reports</h2>
        <p className="text-lg text-gray-700 mt-2">Submit and view environmental issues in your area.</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-green-700 mb-2">Report Environmental Issues</h3>
          <p className="text-gray-600 mb-6">Click on a category below to start reporting an environmental issue in your area</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {issueCategories.map(cat => (
            <div
              key={cat.type}
                className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center hover:shadow-2xl cursor-pointer transition transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200"
                onClick={() => {
                  setFormData({ ...formData, issue_type: cat.type });
                  if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <img src={cat.icon} alt={cat.name} className="w-20 h-20 mb-4" />
                <h4 className="text-lg font-semibold mb-2 text-green-700">{cat.name}</h4>
                <p className="text-gray-600 text-sm">{cat.description}</p>
                <div className="mt-3 text-xs text-green-600 font-medium">Click to report →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">💡 Tips for Effective Reporting</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="font-medium mb-1">📝 Be Specific:</p>
              <p>Provide clear details about the issue, including size, duration, and impact.</p>
            </div>
            <div>
              <p className="font-medium mb-1">📍 Location Matters:</p>
              <p>Use landmarks or exact coordinates to help authorities find the issue quickly.</p>
            </div>
            <div>
              <p className="font-medium mb-1">📸 Visual Evidence:</p>
              <p>Photos help authorities understand the severity and nature of the problem.</p>
            </div>
            <div>
              <p className="font-medium mb-1">⏰ Report Promptly:</p>
              <p>The sooner you report, the faster authorities can take action.</p>
            </div>
          </div>
        </div>

        {/* Report Issue (Inline Form) */}
        <section ref={formRef} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-green-50 to-green-100">
              <h3 className="text-2xl font-bold text-green-800">Submit a Waste Report</h3>
              <p className="text-gray-600 mt-1">Provide details about the issue so the authorities can act quickly</p>
            </div>
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-4">Report Details</h4>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Report Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Garbage pile near school gate" className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Issue Type *</label>
                        <select name="issue_type" value={formData.issue_type} onChange={handleChange} className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800" required>
                          {issueCategories.map(cat => (
                            <option key={cat.type} value={cat.type}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Detailed Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder={"Describe the issue in detail. Include information like:\n• How long has this been an issue?\n• What impact is it having?\n• Any specific details that would help authorities address it?"} className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 resize-none" rows="5" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Location Details</h4>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Location Address *</label>
                        <textarea name="location" value={formData.location} onChange={handleChange} placeholder={"e.g., Near Central Park, Sector 15, Chandigarh\nor\nOpposite ABC School, Main Road, Delhi"} className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 resize-none" rows="3" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Exact Coordinates (Optional)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude (e.g., 30.7333)" className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800" />
                          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude (e.g., 76.7794)" className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800" />
                        </div>
                        <button type="button" onClick={useMyLocation} className="w-full mt-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">📍 Use my current location</button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 mb-4">Evidence (Optional)</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Upload Photo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <input type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="hidden" id="image-upload-inline" />
                        <label htmlFor="image-upload-inline" className="cursor-pointer">
                          <div className="text-4xl text-gray-400 mb-2">📷</div>
                          <p className="text-gray-600 font-medium">Click to upload photo</p>
                          <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button type="reset" className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Clear</button>
                <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl">Submit Report</button>
              </div>
            </form>
          </div>
        </section>

        {/* Recent Reports */}
        <h3 className="text-2xl font-bold text-green-700 mb-6">Recent Reports</h3>
        {loading ? (
          <p className="text-center text-gray-600">Loading reports...</p>
        ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map(report => (
            <div key={report.id} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-2">
              <h3 className="text-xl font-bold mb-2 capitalize text-green-700">{report.title}</h3>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Reporter:</span> {report.reporter_username || 'Anonymous'}</p>
              <p className="text-gray-700 mb-1"><span className="font-semibold">Status:</span> {report.status}</p>
              <p className="text-gray-600 mb-1"><span className="font-semibold">Location:</span> {report.location}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Type:</span> {report.issue_type}</p>
                {(report.latitude || report.longitude) && (
                  <p className="text-gray-600 mb-1"><span className="font-semibold">Coordinates:</span> {report.latitude ?? '–'}, {report.longitude ?? '–'}</p>
                )}
                {report.image && (
                  <img src={report.image} alt="Report" className="mt-2 w-full h-32 object-cover rounded" />
                )}
              <p className="text-gray-500 text-sm mt-2">Reported at: {new Date(report.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No waste reports found yet.</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to report an environmental issue!</p>
          </div>
        )}
      </main>

      {/* Popup Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto overscroll-contain" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 px-8 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-3xl font-bold text-green-700">Submit Waste Report</h2>
                <p className="text-gray-600 mt-1">Help keep your community clean by reporting environmental issues</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
                aria-label="Close waste report form"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="p-8 pb-24 flex-1 overflow-y-auto space-y-8">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Report Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <h3 className="text-xl font-semibold text-green-800 border-b border-green-300 pb-3 mb-6 flex items-center">
                        <span className="text-2xl mr-2">📋</span>
                        Report Information
                      </h3>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Report Title *</label>
                          <input 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="e.g., Garbage pile near school gate" 
                            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800" 
                            required 
                          />
                          <p className="text-sm text-gray-600 mt-2">Give a clear, brief title for your report</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Issue Type *</label>
                          <select 
                            name="issue_type" 
                            value={formData.issue_type} 
                            onChange={handleChange} 
                            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                            required
                          >
                            {issueCategories.map(cat => (
                              <option key={cat.type} value={cat.type}>{cat.name}</option>
                            ))}
                          </select>
                          <p className="text-sm text-gray-600 mt-2">Select the type of environmental issue</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Detailed Description *</label>
                          <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            placeholder={"Describe the issue in detail. Include information like:\n• How long has this been an issue?\n• What impact is it having?\n• Any specific details that would help authorities address it?"} 
                            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800 resize-none" 
                            rows="5"
                            required 
                          />
                          <p className="text-sm text-gray-600 mt-2">The more details you provide, the better authorities can help</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Evidence */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <h3 className="text-xl font-semibold text-blue-800 border-b border-blue-300 pb-3 mb-6 flex items-center">
                        <span className="text-2xl mr-2">📍</span>
                        Location Details
                      </h3>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Location Address *</label>
                          <textarea 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange} 
                            placeholder={"e.g., Near Central Park, Sector 15, Chandigarh\nor\nOpposite ABC School, Main Road, Delhi"} 
                            className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 resize-none" 
                            rows="3"
                            required 
                          />
                          <p className="text-sm text-gray-600 mt-2">Provide a clear address or landmark for easy identification</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Exact Coordinates (Optional)</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <input 
                                type="text" 
                                name="latitude" 
                                value={formData.latitude} 
                                onChange={handleChange} 
                                placeholder="Latitude (e.g., 30.7333)" 
                                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800" 
                              />
                            </div>
                            <div>
                              <input 
                                type="text" 
                                name="longitude" 
                                value={formData.longitude} 
                                onChange={handleChange} 
                                placeholder="Longitude (e.g., 76.7794)" 
                                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800" 
                              />
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={useMyLocation} 
                            className="w-full mt-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            📍 Use my current location
                          </button>
                          <p className="text-sm text-gray-600 mt-2">Coordinates help authorities find the exact location quickly</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <h3 className="text-xl font-semibold text-purple-800 border-b border-purple-300 pb-3 mb-6 flex items-center">
                        <span className="text-2xl mr-2">📸</span>
                        Evidence (Optional)
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Upload Photo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e)=>setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} 
                            className="hidden" 
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="text-4xl text-gray-400 mb-2">📷</div>
                            <p className="text-gray-600 font-medium">Click to upload photo</p>
                            <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">A photo helps authorities understand the issue better. Max file size: 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                {/* Status Information (inside scroll area, but after sections) */}
                <div className="px-8 pb-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-4 flex items-center">
                    <span className="text-xl mr-2">ℹ️</span>
                    Report Status
                  </h3>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">📝 Status: Reported</span>
                    <span className="text-gray-600">• Your report will be reviewed by authorities</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">You'll receive updates on your report status via email or SMS</p>
                  </div>
                </div>

                {/* Action Bar (sticky inside modal) */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 px-8 py-4 flex justify-end gap-4 rounded-b-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl">Submit Report</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteReport;
