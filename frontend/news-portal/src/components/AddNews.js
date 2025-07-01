import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


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

const AddNews = () => {
  const [title, setTitle] = useState("");
  const [category_id, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // Stores the URL for preview and final submission
  const [imageFile, setImageFile] = useState(null); // Stores the actual image file object
  const [notification, setNotification] = useState(null); // { message: "", type: "" }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Handles file selection and creates a local URL for immediate preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setThumbnailUrl(URL.createObjectURL(file)); // Create a local URL for instant preview
    } else {
      setImageFile(null);
      setThumbnailUrl(""); // Clear preview if no file selected
    }
  };

  useEffect(() => {
        axios.get("http://localhost:8000/api/categories")
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    },[]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    setNotification(null); // Clear previous notifications

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotification({ message: "Anda tidak terautentikasi. Silakan login.", type: "error" });
        setIsSubmitting(false);
        return;
      }

      let finalThumbnailUrl = thumbnailUrl; // Start with the current preview URL or empty

      // If an image file is selected, upload it first
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
          setThumbnailUrl(finalThumbnailUrl); // Update state with the real URL for consistent display
        } catch (err) {
          console.error("Gagal upload gambar:", err);
          setNotification({ message: "Gagal mengunggah gambar. Silakan coba lagi.", type: "error" });
          setIsSubmitting(false);
          return;
        }
      }

      const res = await axios.post("http://localhost:8000/api/news", {
        title,
        content,
        category_id,
        thumbnail_url: finalThumbnailUrl, // Use the potentially updated URL from upload
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.data) {
        setNotification({ message: "Berita berhasil ditambahkan!", type: "success" });
        // Reset form fields after successful submission
        setTitle("");
        setCategory("");
        setContent("");
        setThumbnailUrl(""); // Clear thumbnail URL
        setImageFile(null); // Clear image file
      } else {
        setNotification({ message: "Berita gagal ditambahkan! Respon tidak sesuai.", type: "error" });
      }
    } catch (err) {
      console.error("Gagal menambah berita:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setNotification({ message: `Gagal menambah berita: ${err.response.data.message}`, type: "error" });
      } else {
        setNotification({ message: "Terjadi kesalahan saat menambah berita. Silakan coba lagi.", type: "error" });
      }
    } finally {
      setTimeout(() => navigate("/editor/news"), 1500);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Tambah Berita Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Berita</label>
            <input
              type="text"
              id="title"
              placeholder="Masukkan judul berita"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Isi Berita</label>
            <textarea
              id="content"
              placeholder="Tulis isi berita di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 h-40 resize-y transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
                    name="category_id"
                    className="w-full border px-4 py-2"
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
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

          {thumbnailUrl && ( // Show preview if thumbnailUrl is set
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pratinjau Gambar</label>
              <img src={thumbnailUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-200" />
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Berita'}
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

export default AddNews;
