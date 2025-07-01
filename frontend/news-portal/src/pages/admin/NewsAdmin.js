import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Assuming react-router-dom is available for Link

// Custom Confirmation Modal Component
const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 font-inter">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

const NewsAdmin = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newsToDeleteId, setNewsToDeleteId] = useState(null);

  // In a real application, you would get the token from a secure context or state management
  // For this example, we'll keep it as is, but be aware of security implications.
  const token = localStorage.getItem('token');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    let userId = null;

    // Safely decode and validate the token
    if (token && token.split(".").length === 3) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || payload.user_id || payload.id;
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        setError("Token tidak valid, silakan login ulang.");
        setLoading(false);
        return;
      }
    } else {
      setError("Token tidak ditemukan atau tidak valid, silakan login ulang.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("User ID tidak dapat ditemukan dari token.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8000/api/news/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNews(res.data || []);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Gagal memuat berita. Silakan coba lagi.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [token]); // Re-run if token changes

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Function to open the confirmation modal
  const handleDeleteClick = (id) => {
    setNewsToDeleteId(id);
    setShowModal(true);
  };

  // Function to confirm deletion
  const confirmDeleteNews = async () => {
    if (newsToDeleteId) {
      try {
        await axios.delete(`http://localhost:8000/api/news/${newsToDeleteId}`, {
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is sent for deletion
          }
        });
        setNews(news.filter(item => item.id !== newsToDeleteId));
      } catch (err) {
        console.error("Error deleting news:", err);
        setError("Gagal menghapus berita. Silakan coba lagi.");
      } finally {
        setShowModal(false);
        setNewsToDeleteId(null);
      }
    }
  };

  // Function to cancel deletion
  const cancelDeleteNews = () => {
    setShowModal(false);
    setNewsToDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">Manajemen Berita</h2>
          <Link
            to="/news/add"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Tambah Berita Baru
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8 text-blue-600 text-lg">Memuat berita...</div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && news.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-lg bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="mb-2">Belum ada berita yang dipublikasikan.</p>
            <p>Klik "Tambah Berita Baru" untuk memulai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {news.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/news/edit/${item.id}`} className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        show={showModal}
        title="Konfirmasi Hapus Berita"
        message="Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteNews}
        onCancel={cancelDeleteNews}
      />
    </div>
  );
};

export default NewsAdmin;
