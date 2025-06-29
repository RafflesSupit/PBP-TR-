import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const NewsAdmin = () => {
    const [news, setNews] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        let userId;

        // Validasi dan decode token dengan aman
        if (token && token.split(".").length === 3) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                userId = payload.sub || payload.user_id || payload.id;
            } catch (decodeError) {
                console.error("Token decode error:", decodeError);
                alert("Token tidak valid, silakan login ulang");
                return;
            }
        } else {
            alert("Token tidak valid, silakan login ulang");
            return;
        }

        axios.get(`http://localhost:8000/api/news/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                console.log(res.data);
                setNews(res.data || []);
            })
            .catch(err => {
                console.error(err);
                setNews([]);
            });
    }, []);

    const deleteNews = async (id) => {
        if (window.confirm("Yakin ingin menghapus?")) {
            await axios.delete(`http://localhost:8000/api/news/${id}`);
            setNews(news.filter(item => item.id !== id));
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Manajemen Berita</h2>
                <Link to="/news/add" className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Berita</Link>
            </div>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th>Judul</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {news.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center text-gray-500 py-4">
                                Belum ada berita. Tambahkan berita baru.
                            </td>
                        </tr>
                    ) : (
                        news.map(item => (
                            <tr key={item.id}>
                                <td>{item.title}</td>
                                <td>{item.status}</td>
                                <td>{item.views}</td>
                                <td>
                                    <Link to={`/news/edit/${item.id}`} className="text-blue-600 mr-2">Edit</Link>
                                    <button onClick={() => deleteNews(item.id)} className="text-red-600">Hapus</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default NewsAdmin;
