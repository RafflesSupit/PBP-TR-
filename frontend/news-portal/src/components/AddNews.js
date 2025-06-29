import { useState } from "react";
import axios from "axios";
import MediaUpload from "../components/MediaUpload";

const AddNews = () => {
  const [title, setTitle] = useState("");
  const [category_id, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post("http://localhost:8000/api/news", {
        title,
        content,
        category_id,
        thumbnail_url: imageUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if(!res.data){
        alert("Berita gagal ditambahkan!");
      }

      alert("Berita berhasil ditambahkan!");
      // Redirect atau reset form
    } catch (err) {
      console.error("Gagal menambah berita:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 space-y-4">
      <h2 className="text-xl font-bold">Tambah Berita</h2>

      <input
        type="text"
        placeholder="Judul"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <textarea
        placeholder="Isi berita"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border px-3 py-2 rounded h-40"
      />

      <input
        type="text"
        placeholder="Category"
        value={category_id}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <MediaUpload onUploaded={(url) => setImageUrl(url)} />

      {imageUrl && <img src={imageUrl} alt="Preview" className="w-full mt-2 rounded" />}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Simpan Berita
      </button>
    </div>
  );
};

export default AddNews;
