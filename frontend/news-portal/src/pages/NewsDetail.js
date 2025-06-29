import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function NewsDetail() {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const newsRes = await axios.get(`/news/${id}`, {
                    signal: controller.signal
                });
                setNews(newsRes.data);

                const commentsRes = await axios.get(`/comments?news_id=${id}`, {
                    signal: controller.signal
                });
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Error fetching data:", err);
                    setComments([]);
                }
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
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

            await axios.post("/comments", {
                news_id: id,
                content,
                user_id: userId,
            });

            setContent("");
            const updated = await axios.get(`/comments?news_id=${id}`);
            setComments(Array.isArray(updated.data) ? updated.data : []);
        } catch (err) {
            console.error("Gagal kirim komentar:", err);
            if (err.response?.status === 401) {
                alert("Sesi login sudah berakhir, silakan login ulang");
            }
        }
    };

    if (!news) return <p className="p-4">Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto mt-6 px-4">
            <h1 className="text-2xl font-bold mb-2">{news.title}</h1>
            <p className="text-sm text-gray-600 mb-4">Views: {news.views}</p>
            <div className="mb-4">
                {news.thumbnail_url ? (
                    <img
                        src={news.thumbnail_url}
                        alt={news.title}
                        className="w-full max-h-96 object-cover rounded"
                    />
                ) : (
                    <span className="text-gray-400">Tidak ada gambar</span>
                )}
            </div>
            <p className="mb-6">{news.content}</p>

            <div className="my-10">
                <h2 className="text-lg font-semibold mb-2">Komentar</h2>
                {comments.length === 0 && <p>Belum ada komentar.</p>}
                {comments.map((cmt, i) => (
                    <div key={i} className="mb-2 border-b pb-2">
                        <p className="text-sm text-gray-700 font-semibold">
                            {cmt.user_name}
                        </p>
                        <p>{cmt.content}</p>
                    </div>
                ))}

                {token && (
                    <form onSubmit={handleCommentSubmit} className="mt-4">
                        <textarea
                            className="w-full border p-2 rounded"
                            rows={3}
                            placeholder="Tulis komentar..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                        <button className="my-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Kirim
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
