// MainPage.js
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import '../output.css';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MainPage = ({ user }) => {
  const { user: authUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const userFromState = location.state && location.state.user ? location.state.user : null;
  const effectiveUser = authUser || user || userFromState || { username: 'Guest', role: 'guest' };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left: Logo + Links */}
            <div className="flex items-center space-x-8">
              <span className="font-bold text-2xl text-green-700">GreenBandhan</span>
              <div className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-green-700 font-medium transition">Home</Link>
                <Link to="/campaigns" className="text-gray-700 hover:text-green-700 font-medium transition">Campaigns</Link>
                <Link to="/park" className="text-gray-700 hover:text-green-700 font-medium transition">Parks</Link>
                <Link to="/wastereport" className="text-gray-700 hover:text-green-700 font-medium transition">Reports</Link>
                <Link to="/donations" className="text-gray-700 hover:text-green-700 font-medium transition">Donations</Link>
              </div>
            </div>

            {/* Right: User Info */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Hello, {effectiveUser.username}</span>
              <button 
                onClick={handleLogout} 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
              >
                Logout
              </button>
              <button 
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Profile
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-6">Welcome, {effectiveUser.username}!</h2>
          <p className="text-gray-700 text-lg mb-2">
            Role: <span className="font-semibold">{effectiveUser.role}</span>
          </p>
          <p className="text-gray-600 text-md">This is your main dashboard after registration.</p>
        </div>
      </main>
    </div>
  );
};

export default MainPage;
