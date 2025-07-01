import { useEffect, useState, useContext } from "react";
import axios from "axios"; // Assuming axios is configured to point to your backend base URL
// import { AuthContext } from "../context/AuthContext"; // Uncomment if you use AuthContext

// Custom Notification Component (reused from other components)
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

const Profile = () => {
  // const { token } = useContext(AuthContext); // Uncomment if using AuthContext
  // For demonstration, getting token from localStorage directly
  const token = localStorage.getItem('token'); 

  const [profile, setProfile] = useState({
    bio: "",
    avatar_url: "",
  });
  const [notification, setNotification] = useState(null); // { message: "", type: "" }
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Decode userId from token
  let userId = null;
  if (token && token.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.user_id || payload.id;
    } catch (decodeError) {
      console.error("Token decode error:", decodeError);
      // Handle invalid token, e.g., redirect to login
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (!token) {
        setNotification({ message: "Anda tidak terautentikasi. Silakan login.", type: "error" });
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("http://localhost:8000/api/me", { // Assuming /me is relative to base URL or full path
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        setNotification({ message: "Gagal memuat profil. Silakan coba lagi.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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

    try {
      await axios.put(
        "http://localhost:8000/api/me", // Assuming /me is relative to base URL or full path
        {
          ...profile,
          user_id: userId, // Ensure user_id is sent if required by backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      setNotification({ message: "Profil berhasil diperbarui!", type: "success" });
    } catch (err) {
      console.error("Gagal update profil:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setNotification({ message: `Gagal update profil: ${err.response.data.message}`, type: "error" });
      } else {
        setNotification({ message: "Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter flex items-center justify-center">
        <div className="text-blue-600 text-lg">Memuat profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Profil Saya</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              placeholder="Tulis bio Anda di sini..."
              value={profile.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
            />
          </div>
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">URL Avatar</label>
            <input
              type="text"
              id="avatar_url"
              name="avatar_url"
              placeholder="Masukkan URL avatar Anda"
              value={profile.avatar_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          {profile.avatar_url && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pratinjau Avatar</label>
              <img
                src={profile.avatar_url}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/96x96/cccccc/333333?text=No+Image"; }} // Fallback for broken image
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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

export default Profile;
