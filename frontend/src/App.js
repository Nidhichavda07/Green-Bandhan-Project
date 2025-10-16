import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Donations from './components/Donations';
import MainPage from './components/MainPage';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard'
import AdminParks from './components/admin/AdminParks';
import AdminCampaigns from './components/admin/AdminCampaigns';
import AdminDonations from './components/admin/AdminDonations';
import AdminWasteReports from './components/admin/AdminWasteReports';
import AdminBlogs from './components/admin/AdminBlogs';
import Blogs from './components/Blogs';
import WasteReport from './components/WasteReport';
import Park from './components/citizen/Parks';
import ParkDetails from './components/citizen/ParkDetails';
import { AuthContext } from './context/AuthContext';


function PrivateRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/parks" element={<Park />} />
        <Route path="/park" element={<Park />} />
        <Route path="/parks/:id" element={<ParkDetails />} />

        {/* Citizen-protected routes */}
        <Route path="/main" element={<PrivateRoute><MainPage /></PrivateRoute>} />
        <Route path="/donations" element={<PrivateRoute><Donations /></PrivateRoute>} />
        <Route path="/wastereport" element={<PrivateRoute><WasteReport /></PrivateRoute>} />

        {/* Admin-protected routes (reuse same guard; refine by role if needed) */}
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/parks" element={<PrivateRoute><AdminParks /></PrivateRoute>} />
        <Route path="/admin/campaigns" element={<PrivateRoute><AdminCampaigns /></PrivateRoute>} />
        <Route path="/admin/donations" element={<PrivateRoute><AdminDonations /></PrivateRoute>} />
        <Route path="/admin/waste-reports" element={<PrivateRoute><AdminWasteReports /></PrivateRoute>} />
        <Route path="/admin/blogs" element={<PrivateRoute><AdminBlogs /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
