import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Mengubah import agar langsung menggunakan axios

// Custom Notification Component (reused for consistent UX)
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
  const title = type === 'success' ? 'Berhasil!' : 'Error!';

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 font-inter ${bgColor}`}
      role="alert"
    >
      <strong className="font-bold">{title}</strong>
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // { message: "", type: "" }

  const handleNotificationClose = () => {
    setNotification(null);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, you'd likely pass a token here for authorization
        // const token = localStorage.getItem('token');
        // const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Mengubah endpoint agar menjadi URL lengkap
        const res = await axios.get('http://localhost:8000/api/admin/stats' /*, { headers } */);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Gagal memuat statistik dashboard. Silakan coba lagi.");
        setNotification({ message: "Gagal memuat statistik dashboard.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter flex items-center justify-center">
        <div className="text-blue-600 text-lg">Memuat data dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md text-center" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users Card */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Total Pengguna</p>
              <h2 className="text-3xl font-bold text-blue-900">{stats.users || 0}</h2>
            </div>
            <div className="mt-4 text-right">
              <svg className="w-8 h-8 text-blue-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M9 20v-2m3 2v-2m-3 2H9m1.5-11a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-1.5 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm6 0a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-1.5 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"></path></svg>
            </div>
          </div>

          {/* Total News Card */}
          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Total Berita</p>
              <h2 className="text-3xl font-bold text-green-900">{stats.news || 0}</h2>
            </div>
            <div className="mt-4 text-right">
              <svg className="w-8 h-8 text-green-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v10m-3 0l-4 4m0 0l-4-4m4 4V3"></path></svg>
            </div>
          </div>

          {/* Most Viewed News Card */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Berita Paling Banyak Dilihat</p>
              <h2 className="text-lg font-semibold text-purple-900">
                {stats.most_viewed_news?.title || "N/A"}
              </h2>
              <p className="text-sm text-purple-600 mt-1">
                {stats.most_viewed_news?.views ? `${stats.most_viewed_news.views} views` : "Tidak ada data"}
              </p>
            </div>
            <div className="mt-4 text-right">
              <svg className="w-8 h-8 text-purple-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default AdminDashboard;
