import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import LoginButton from "../components/Login";
import { AuthContext } from "../context/AuthContext";

// --- START: NewsDetailShimmer Component ---
// Define NewsDetailShimmer as a separate component outside of NewsDetail
const NewsDetailShimmer = () => {
    return (
        <div className="max-w-3xl mx-auto mt-6 px-4 bg-white rounded-lg shadow-sm p-6 animate-pulse">
            {/* Shimmer for Title */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            {/* Shimmer for Thumbnail */}
            <div className="h-48 bg-gray-200 rounded mb-6"></div>
            {/* Shimmer for Content */}
            <div className="space-y-2 mb-8">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            {/* "Not Found" message within the shimmer */}
            <p className="text-center text-gray-400 text-sm mt-2">Coba periksa URL atau kembali ke halaman utama.</p>
        </div>
    );
};
// --- END: NewsDetailShimmer Component ---


export default function NewsDetail() {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true); // New loading state
    const [error, setError] = useState(null); // New error state

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null); // Clear any previous errors
            try {
                // Fetch news details
                const newsRes = await axios.get(`/news/${id}`, {
                    signal: controller.signal
                });
                setNews(newsRes.data);

                // Fetch comments for the news
                const commentsRes = await axios.get(`/comments?news_id=${id}`, {
                    signal: controller.signal
                });
                // Ensure commentsRes.data is an array before setting
                setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

            } catch (err) {
                // Check if the error is specifically due to request cancellation (e.g., component unmounts)
                if (err.name === 'CanceledError') {
                    console.log('Fetch aborted:', err.message);
                    return; // Exit without setting error state for cancellations
                }

                console.error("Error fetching data:", err);
                // Set error state based on the HTTP status code
                if (err.response && err.response.status === 404) {
                    setError("Berita tidak ditemukan.");
                } else {
                    setError("Gagal memuat berita atau komentar. Silakan coba lagi.");
                }
                setNews(null); // Clear news if there's an error
                setComments([]); // Clear comments if there's an error

            } finally {
                setLoading(false); // Always set loading to false after fetch attempt
            }
        };

        fetchData();

        // Cleanup function for AbortController
        return () => {
            controller.abort();
        };
    }, [id]); // Re-run effect if 'id' changes

    const handleCommentSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!content.trim()) return; // Don't submit empty comments

        let userId = null;
        if (token) {
            try {
                // Decode JWT token payload
                const payload = JSON.parse(atob(token.split(".")[1]));
                // Assuming 'sub', 'user_id', or 'id' holds the user ID
                userId = payload.sub || payload.user_id || payload.id;
            } catch (decodeError) {
                console.error("Token decode error:", decodeError);
                alert("Token tidak valid, silakan login ulang.");
                return; // Stop execution if token is invalid
            }
        } else {
            alert("Anda harus login untuk berkomentar.");
            return;
        }

        if (!userId) {
            alert("Tidak dapat menemukan ID pengguna dari token. Silakan login ulang.");
            return;
        }

        try {
            await axios.post("/comments", {
                news_id: id,
                content: content,
                user_id: userId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Include token for authentication
                }
            });

            // Clear the comment input after successful submission
            setContent("");

            // Re-fetch comments to display the newly added comment
            const updatedCommentsRes = await axios.get(`/comments?news_id=${id}`);
            setComments(Array.isArray(updatedCommentsRes.data) ? updatedCommentsRes.data : []);

        } catch (err) {
            console.error("Gagal mengirim komentar:", err);
            if (err.response?.status === 401) {
                alert("Sesi login Anda sudah berakhir, silakan login ulang.");
            } else if (err.response?.data?.message) {
                alert(`Gagal mengirim komentar: ${err.response.data.message}`);
            } else {
                alert("Terjadi kesalahan saat mengirim komentar.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-700">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
                {/* Render the Shimmer component directly */}
                <NewsDetailShimmer />
            </div>
        );
    }

    if (!news) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <NewsDetailShimmer />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-6 px-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-3xl font-bold mb-3 text-gray-900 leading-tight">
                    {news.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Views: {news.views?.toLocaleString() || 0}
                </div>
                
                {/* Thumbnail */}
                <div className="mb-6">
                    {news.thumbnail_url ? (
                        <img
                            src={news.thumbnail_url}
                            alt={news.title}
                            className="w-full max-h-96 object-cover rounded-lg shadow-md"
                        />
                    ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">Tidak ada gambar</span>
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                        {news.content}
                    </p>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.984L3 20l1.984-5.874A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Komentar ({comments.length})
                    </h2>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.984L3 20l1.984-5.874A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                            </svg>
                            <p className="text-gray-500">Belum ada komentar.</p>
                        </div>
                    ) : (
                        comments.map((cmt) => (
                            // Use a unique ID from the comment if available, otherwise fallback to index
                            <div key={cmt.id || cmt.comment_id || cmt.user_name + cmt.content} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-white text-sm font-semibold">
                                            {/* Safely get the first letter, default to '?' */}
                                            {(cmt.user_name || '?').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {cmt.user_name || 'Pengguna Anonim'}
                                    </p>
                                </div>
                                <p className="text-gray-700 ml-11">{cmt.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Form */}
                {token ? ( // Check for token existence to determine logged-in state
                    <form onSubmit={handleCommentSubmit} className="border-t pt-6">
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Tambahkan komentar
                            </label>
                            <textarea
                                id="comment"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows={4}
                                placeholder="Tulis komentar Anda di sini..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" // Set type to submit for forms
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!content.trim()} // Disable if textarea is empty or just whitespace
                            >
                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Kirim Komentar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="border-t pt-6 text-center">
                        <p className="text-gray-600 mb-4">Silakan login untuk menambahkan komentar.</p>
                        <LoginButton />
                    </div>
                )}
            </div>
        </div>
    );
}