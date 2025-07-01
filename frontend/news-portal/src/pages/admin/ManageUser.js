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

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // { message: "", type: "" }
  const [deletingId, setDeletingId] = useState(null); // State to track which user is being deleted

  const token = localStorage.getItem('token');

  const handleNotificationClose = () => {
    setNotification(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Anda tidak terautentikasi. Silakan login.");
        setNotification({ message: "Anda tidak terautentikasi. Silakan login.", type: "error" });
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('http://localhost:8000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUsers(res.data.data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Gagal memuat daftar pengguna. Silakan coba lagi.");
        setNotification({ message: "Gagal memuat daftar pengguna.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setNotification(null); // Clear previous notifications

    try {
      await axios.delete(`http://localhost:8000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}` // Ensure token is sent for deletion
        }
      });
      setUsers(users.filter(user => user.id !== id));
      setNotification({ message: "Pengguna berhasil dihapus!", type: "success" });
    } catch (err) {
      console.error("Error deleting user:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setNotification({ message: `Gagal menghapus pengguna: ${err.response.data.message}`, type: "error" });
      } else {
        setNotification({ message: "Terjadi kesalahan saat menghapus pengguna. Silakan coba lagi.", type: "error" });
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter flex items-center justify-center">
        <div className="text-blue-600 text-lg">Memuat pengguna...</div>
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Manajemen Pengguna</h1>

        {users.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-600 text-lg bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="mb-2">Belum ada pengguna yang terdaftar.</p>
            <p>Data pengguna akan muncul di sini setelah ada pendaftaran.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        )}
                        {deletingId === user.id ? 'Menghapus...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default ManageUser;
