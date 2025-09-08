import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNavbar = ({ title = 'Admin', onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <span className="text-2xl font-bold tracking-tight text-green-700">{title}</span>

          <div className="flex items-center space-x-6">
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `text-base ${isActive ? 'text-green-700 font-semibold' : 'text-gray-700 hover:text-green-700'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/parks"
              className={({ isActive }) =>
                `text-base ${isActive ? 'text-green-700 font-semibold' : 'text-gray-700 hover:text-green-700'}`
              }
            >
              Parks
            </NavLink>
            <NavLink
              to="/admin/campaigns"
              className={({ isActive }) =>
                `text-base ${isActive ? 'text-green-700 font-semibold' : 'text-gray-700 hover:text-green-700'}`
              }
            >
              Campaigns
            </NavLink>
            <NavLink
              to="/admin/donations"
              className={({ isActive }) =>
                `text-base ${isActive ? 'text-green-700 font-semibold' : 'text-gray-700 hover:text-green-700'}`
              }
            >
              Donations
            </NavLink>
            <NavLink
              to="/wastereport"
              className={({ isActive }) =>
                `text-base ${isActive ? 'text-green-700 font-semibold' : 'text-gray-700 hover:text-green-700'}`
              }
            >
              Waste Reports
            </NavLink>
            <NavLink
              to="/admin/waste-reports"
              className={({ isActive }) =>
                `text-base ${isActive ? 'text-green-700 font-semibold' : 'text-gray-700 hover:text-green-700'}`
              }
            >
              Admin Waste
            </NavLink>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;


