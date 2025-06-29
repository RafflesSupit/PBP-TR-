import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditNews = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category_id: "",
        status: "draft",
        thumbnail_url: "",
    });

    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get("http://localhost:8000/api/categories")
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));

        if (id) {
            axios.get(`http://localhost:8000/api/news/${id}/edit`)
                .then(res => setFormData(res.data))
                .catch(err => console.error(err));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageUrl = formData.thumbnail_url;

        if (imageFile) {
            const mediaData = new FormData();
            mediaData.append("file", imageFile);
            try {
                const uploadRes = await axios.post("http://localhost:8000/api/media/upload", mediaData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                imageUrl = uploadRes.data.url;
            } catch (err) {
                console.error("Gagal upload gambar", err);
            }
        }

        const payload = { ...formData, thumbnail_url: imageUrl };

        try {
            if (id) {
                try {
                    const response = await axios.put(`http://localhost:8000/api/news/${id}`, payload, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log(response.status);
                } catch (error) {
                    console.error('Update gagal:', error);
                }
            } else {
                await axios.post("http://localhost:8000/api/news", payload);
            }
            navigate("/admin/news");
        } catch (err) {
            console.error("Gagal simpan berita", err);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">{id ? "Edit" : "Tambah"} Berita</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="title"
                    placeholder="Judul"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border px-4 py-2"
                    required
                />

                <textarea
                    name="content"
                    placeholder="Isi berita"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full border px-4 py-2"
                    rows="6"
                    required
                />

                <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full border px-4 py-2"
                    required
                >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border px-4 py-2"
                >
                    <option value="draft">Draft</option>
                    <option value="published">Publish</option>
                </select>

                <input
                    type="file"
                    onChange={handleImageChange}
                    className="w-full"
                />

                {formData.thumbnail_url && (
                    <img src={formData.thumbnail_url} alt="preview" className="w-32 h-32 object-cover mt-2" />
                )}

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Simpan
                </button>
            </form>
        </div>
    );
};

export default EditNews;
