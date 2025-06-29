import React, { useEffect, useState } from 'react';
import axios from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get('/admin/stats')
      .then(res =>{
        setStats(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Users</p>
          <h2 className="text-xl font-bold">{stats.users}</h2>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total News</p>
          <h2 className="text-xl font-bold">{stats.news}</h2>
        </div>
        {/* <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Pending Comments</p>
          <h2 className="text-xl font-bold">{stats.comments_pending}</h2>
        </div> */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Most Viewed</p>
          <h2 className="text-md">{stats.most_viewed_news?.title}</h2>
          <h2 className="text-md">{stats.most_viewed_news?.views} views</h2>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
