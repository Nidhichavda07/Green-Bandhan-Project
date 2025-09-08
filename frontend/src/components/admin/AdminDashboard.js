import React from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Admin Dashboard" onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Quick Actions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/parks" className="bg-white rounded-xl shadow p-6 border hover:shadow-lg transition">
            <div className="text-xl font-semibold text-green-700 mb-2">Manage Parks</div>
            <p className="text-gray-600">Add or review green spaces and oxygen ratings.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;