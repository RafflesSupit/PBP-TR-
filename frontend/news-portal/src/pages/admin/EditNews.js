import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Custom Notification Component (reused from AddNews)
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
  const title = type === 'success' ? 'Berhasil!' : 'Error!';

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 ${bgColor}`}
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

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    status: "draft",
    thumbnail_url: "", // This will store the URL for preview and initial value
  });

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null); // Stores the actual file object for upload
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // { message: "", type: "" }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Fetch categories and news data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Anda tidak terautentikasi. Silakan login.");
        setLoading(false);
        return;
      }

      try {
        // Fetch categories
        const categoryRes = await axios.get("http://localhost:8000/api/categories");
        setCategories(categoryRes.data);

        // Fetch news data if editing
        if (id) {
          const newsRes = await axios.get(`http://localhost:8000/api/news/${id}/edit`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setFormData(newsRes.data);
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError("Gagal memuat data berita atau kategori. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, token]); // Depend on id and token to refetch if they change

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handles file selection and creates a local URL for immediate preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData(prev => ({ ...prev, thumbnail_url: URL.createObjectURL(file) })); // Update thumbnail_url for preview
    } else {
      setImageFile(null);
      setFormData(prev => ({ ...prev, thumbnail_url: "" })); // Clear preview if no file selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null); // Clear previous notifications

    if (!token) {
      setNotification({ message: "Anda tidak terautentikasi. Silakan login.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    let finalThumbnailUrl = formData.thumbnail_url; // Start with current thumbnail_url from formData

    // If a new image file is selected, upload it first
    if (imageFile) {
      const mediaData = new FormData();
      mediaData.append("file", imageFile);
      try {
        const uploadRes = await axios.post("http://localhost:8000/api/media/upload", mediaData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` // Ensure token is sent for media upload
          }
        });
        finalThumbnailUrl = uploadRes.data.url; // Use the actual URL from the upload response
      } catch (err) {
        console.error("Gagal upload gambar:", err);
        setNotification({ message: "Gagal mengunggah gambar. Silakan coba lagi.", type: "error" });
        setIsSubmitting(false);
        return; // Stop submission if image upload fails
      }
    }

    const payload = { ...formData, thumbnail_url: finalThumbnailUrl };

    try {
      if (id) {
        // Update existing news
        await axios.put(`http://localhost:8000/api/news/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setNotification({ message: "Berita berhasil diperbarui!", type: "success" });
      } else {
        // Add new news (this path is less common for EditNews, but kept for completeness)
        await axios.post("http://localhost:8000/api/news", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setNotification({ message: "Berita berhasil ditambahkan!", type: "success" });
      }
      setTimeout(() => navigate("/editor/news"), 1500);
    } catch (err) {
      console.error("Gagal simpan berita:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setNotification({ message: `Gagal menyimpan berita: ${err.response.data.message}`, type: "error" });
      } else {
        setNotification({ message: "Terjadi kesalahan saat menyimpan berita. Silakan coba lagi.", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter flex items-center justify-center">
        <div className="text-blue-600 text-lg">Memuat data...</div>
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
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
          {id ? "Edit Berita" : "Tambah Berita"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Berita</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Masukkan judul berita"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Isi Berita</label>
            <textarea
              id="content"
              name="content"
              placeholder="Tulis isi berita di sini..."
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 h-40 resize-y transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
              required
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
          </div>

          <div>
            <label htmlFor="thumbnailFile" className="block text-sm font-medium text-gray-700 mb-1">Gambar Thumbnail</label>
            <input
              type="file"
              id="thumbnailFile"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*" // Restrict to image files
            />
          </div>

          {formData.thumbnail_url && ( // Show preview if thumbnailUrl is set in formData
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pratinjau Gambar</label>
              <img src={formData.thumbnail_url} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-200" />
            </div>
          )}

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            )}
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>

      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default EditNews;