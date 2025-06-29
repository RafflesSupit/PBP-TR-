import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    bio: "",
    avatar_url: "",
  });
  const [message, setMessage] = useState("");

  let userId;
  const payload = JSON.parse(atob(token.split(".")[1]));
  userId = payload.sub || payload.user_id || payload.id;

  useEffect(() => {
    axios
      .get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch(() => setMessage("Gagal memuat profil"));
  }, [token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "/me",
        {
          ...profile,
          user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Profil berhasil diperbarui!");
    } catch (err) {
      setMessage("Gagal update profil");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 px-4">
      <h2 className="text-xl font-bold mb-4">Profil Saya</h2>

      {message && <div className="mb-4 text-blue-600">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            rows="3"
            value={profile.bio}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input
            type="text"
            name="avatar_url"
            value={profile.avatar_url}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-24 h-24 rounded-full border mt-2"
          />
        )}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
