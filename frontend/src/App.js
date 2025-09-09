import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/wastereport" element={<WasteReport />} />
        <Route path="/login" element={<Login />} />
        <Route path="/park" element={<Park />} />
        <Route path="/parks" element={<Park />} />
        <Route path="/parks/:id" element={<ParkDetails />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/parks" element={<AdminParks />} />
        <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/admin/donations" element={<AdminDonations />} />
        <Route path="/admin/waste-reports" element={<AdminWasteReports />} />
        <Route path="/admin/blogs" element={<AdminBlogs />} />
        <Route path="/blogs" element={<Blogs />} />
      </Routes>
    </Router>
  );
}

export default App;
