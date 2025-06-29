import { useState } from "react";
import axios from "axios";

function MediaUpload({ onUploaded }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(res.data.url); // Kirim URL ke parent
    } catch (err) {
      console.error("Upload gagal:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-3 py-1 rounded">
        Upload
      </button>
    </div>
  );
}

export default MediaUpload;
