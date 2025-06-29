import { useContext, useEffect, useState } from "react";
import { Search, Menu, X, Clock, Eye, ArrowRight, Globe, TrendingUp, BookOpen } from "lucide-react";
import axios from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import LogoutButton from "../components/Logout";
import LoginButton from "../components/Login";
import { AuthContext } from "../context/AuthContext";

const Link = ({ to, children, className }) => (
    <a href={to} className={className}>{children}</a>
);

export default function Home() {
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [trendingNews, setTrendingNews] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        Promise.all([
            axios.get('/news'),
            axios.get('/categories')
        ])
            .then(([newsRes, categoriesRes]) => {
                const publishedNews = newsRes.data.filter(news => news.status === 'published');
                const trendingNews = [...newsRes.data].sort((a, b) => b.views - a.views);
                setNews(publishedNews);
                setTrendingNews(trendingNews);
                setCategories(categoriesRes.data);
            })
            .catch(error => {
                console.error("Failed to fetch data:", error);
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);

    const featuredNews = news.slice(0, 1);
    const mainNews = news.slice(1, 7);
    const trending = trendingNews.slice(0, 5);

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : "Unknown";
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">NewsHub</h1>
                                <p className="text-xs text-slate-500 hidden sm:block">Trusted News Source</p>
                            </div>
                        </div>

                        {/* Search & Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search news..."
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-slate-600">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                                {!user ? (
                                    <LoginButton />
                                ) : (
                                    <LogoutButton />
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white">
                        <div className="px-4 py-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search news..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
                                Sign In
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Category Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto py-4">
                        {categories.map((category) => {
                            const IconComponent = Globe;
                            return (
                                <a
                                    key={category.name}
                                    href="#"
                                    className={`flex items-center space-x-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition ${category.active
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span>{category.name}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="space-y-8">
                        {/* Loading skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="animate-pulse">
                                        <div className="h-64 bg-slate-200"></div>
                                        <div className="p-6 space-y-4">
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-slate-200 rounded"></div>
                                                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Featured Article Placeholder */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-full w-full object-cover bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    {!featuredNews[0].thumbnail_url ? (
                                        <>
                                            <div className="text-center text-slate-500">
                                                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Featured Article</p>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={featuredNews[0].thumbnail_url}
                                            alt={featuredNews[0].title}
                                            className="object-cover w-full h-full rounded-t-lg"
                                        />
                                    )}

                                </div>
                                <div className="p-6">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Breaking</span>
                                        <span className="text-sm text-slate-500">
                                            {formatDistanceToNow(new Date(featuredNews[0].published_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                                        {featuredNews[0].title}
                                    </h2>
                                    <p className="text-slate-600 mb-4 leading-relaxed">
                                        {featuredNews[0].content.substring(0, 200)}...
                                    </p>
                                    <Link
                                        to={`/news/${featuredNews[0].id}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Read more
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* News Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mainNews.map(item => (
                                    <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                            <img
                                                src={item.thumbnail_url}
                                                alt={item.title}
                                                className="object-cover w-full h-full rounded-t-lg"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                                    {getCategoryName(item.category_id)}
                                                </span>
                                                <div className="flex items-center text-xs text-slate-400">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    <span>{item.views}</span>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                                {item.content.substring(0, 200)}...
                                            </p>
                                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                                {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                                            </p>
                                            <Link
                                                to={`/news/${item.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                                            >
                                                Read more
                                                <ArrowRight className="w-3 h-3 ml-1" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Trending News */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-red-500" />
                                    <h3 className="font-bold text-slate-900">Trending</h3>
                                </div>
                                <div className="space-y-4">
                                    {trending.map(item => (
                                        <div key={item.id} className="flex space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {trending.indexOf(item) + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/news/${item.id}`}
                                                    className="text-sm font-medium text-slate-900 hover:text-blue-600 transition line-clamp-2 block"
                                                >
                                                    {item.title}
                                                </Link>
                                                <div className="flex items-center text-xs text-slate-500 mt-1">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    <span>{item.views} views</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter Signup */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                                <h3 className="font-bold text-slate-900 mb-2">Stay Updated</h3>
                                <p className="text-sm text-slate-600 mb-4">Get the latest news delivered to your inbox.</p>
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                        Subscribe
                                    </button>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
                                <div className="space-y-2">
                                    {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                                        <a
                                            key={link}
                                            href="#"
                                            className="block text-sm text-slate-600 hover:text-blue-600 transition py-1"
                                        >
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">N</span>
                                </div>
                                <h4 className="font-bold text-lg">NewsHub</h4>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                                Your trusted source for accurate, timely, and comprehensive news coverage.
                                Delivering quality journalism that matters to you.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-4">Categories</h5>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li><a href="#" className="hover:text-white transition">Politics</a></li>
                                <li><a href="#" className="hover:text-white transition">Technology</a></li>
                                <li><a href="#" className="hover:text-white transition">Business</a></li>
                                <li><a href="#" className="hover:text-white transition">Sports</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-4">Company</h5>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition">Support</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-slate-400">
                            © 2025 NewsHub. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-slate-400 hover:text-white transition text-sm">Privacy</a>
                            <a href="#" className="text-slate-400 hover:text-white transition text-sm">Terms</a>
                            <a href="#" className="text-slate-400 hover:text-white transition text-sm">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}