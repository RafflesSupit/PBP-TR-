import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Menu,
  Search,
  Globe,
  Flame,
  Video,
  Clock,
  Eye,
  ArrowRight,
  BookOpen,
  UserCircle,
  X,
  TrendingUp,
  Calendar,
  MapPin,
  Share2,
  Bell,
  ChevronDown,
  Play
} from "lucide-react";
import axios from "../api/axios";
import LogoutButton from "../components/Logout";
import LoginButton from "../components/Login";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

export default function NewsHomepage() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    Promise.all([
      axios.get('/news'),
      axios.get('/categories')
    ])
      .then(([newsRes, categoriesRes]) => {
        const publishedNews = newsRes.data.filter(news => news.status === 'published');
        const trendingNews = publishedNews.sort((a, b) => b.views - a.views);
        setNews(publishedNews);
        setTrendingNews(trendingNews);
        setCategories(categoriesRes.data);
      })
      .catch(error => {
        console.error("Gagal mengambil data:", error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNews(news);
      setTrendingNews([trendingNews]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featured = news[0] || null;
  const mainNews = news.slice(1, 7);
  const trending = trendingNews.slice(0, 5);

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : "News";
  };

  const getCategoryColor = (id) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-green-100 text-green-800",
      4: "bg-yellow-100 text-yellow-800",
      5: "bg-purple-100 text-purple-800",
      6: "bg-pink-100 text-pink-800"
    };
    return colors[id] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-xl' : ''}`}>
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Global Edition
              </span>

            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg mr-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    GlobalNews
                  </h1>
                  <p className="text-xs text-gray-500 hidden md:block">Truth. Integrity. Impact.</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative group"
                >
                  {cat.name}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
                </button>
              ))}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-3">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>

              {!user ? (
                <LoginButton className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-sm font-medium" />
              ) : (
                <LogoutButton className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm font-medium" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <nav className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Subscribe to Newsletter
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gray-200 rounded-2xl animate-pulse h-[500px]"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        featured && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Article */}
              <div className="lg:col-span-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
                  <img
                    src={featured.thumbnail_url}
                    alt={featured.title}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(featured.category_id)}`}>
                        {getCategoryName(featured.category_id)}
                      </span>
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        BREAKING
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      {featured.title}
                    </h1>
                    <p className="text-lg text-gray-200 mb-6 line-clamp-3 leading-relaxed">
                      {featured.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-white/80 text-sm">
                        <span className="flex items-center gap-1 mr-4">
                          <Eye className="w-4 h-4" />
                          {featured.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(featured.published_at)}
                        </span>
                      </div>
                      <button className="flex items-center gap-2 text-white hover:text-blue-300 font-semibold group">
                        <Link
                          to={`/news/${featured.id}`}
                          className="flex items-center gap-2 text-white hover:text-blue-300 font-semibold group"
                        >
                          Read Full Story
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    </div>
                    Trending Now
                  </h3>
                  <div className="space-y-4">
                    {trending.map((article, idx) => (
                      <div key={article.id} className="group cursor-pointer">
                        <Link
                          to={`/news/${article.id}`}
                        >
                          <div className="flex gap-4">
                            <div className="relative">
                              <img
                                src={article.thumbnail_url}
                                alt={article.title}
                                className="w-20 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(article.category_id)}`}>
                                {getCategoryName(article.category_id)}
                              </span>
                              <h4 className="font-semibold text-sm leading-snug mt-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {article.title}
                              </h4>
                              <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views.toLocaleString()}
                                </span>
                                <span>{formatTimeAgo(article.published_at)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Stay Informed</h3>
                  <p className="text-blue-100 text-sm mb-4">Get breaking news delivered to your inbox</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    />
                    <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      )}

      {/* Video & Editor's Picks */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            Video & Editor's Choice
          </h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
            {/* Featured Video */}
            <div className="w-96 bg-white rounded-2xl shadow-lg overflow-hidden group">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop"
                  alt="Featured Video"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-gray-800 ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  LIVE
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Breaking News Live Coverage</h3>
                <p className="text-gray-600 text-sm">Watch our live coverage of the latest developments</p>
              </div>
            </div>

            {/* Editor's Picks */}
            {mainNews.slice(0, 4).map((article) => (
              <div key={article.id} className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                <Link
                  to={`/news/${article.id}`}
                >
                  <img
                    src={article.thumbnail_url}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(article.category_id)}`}>
                      {getCategoryName(article.category_id)}
                    </span>
                    <h3 className="font-bold text-lg mt-3 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTimeAgo(article.published_at)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Stories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-lg mb-4">Categories</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* About Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">About GlobalNews</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Delivering balanced, in-depth, and trusted news coverage from around the world.
                </p>
                <button className="flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-700 font-semibold group">

                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Latest Stories</h2>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Sort by
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-2xl animate-pulse h-80"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {news.slice(6).map((article) => (
                  <article key={article.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Link
                      to={`/news/${article.id}`}
                    >
                      <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(article.category_id)}`}>
                            {getCategoryName(article.category_id)}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h3 className="font-bold text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {article.content.substring(0, 120)}...
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center text-xs text-gray-500 gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(article.published_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {article.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                Load More Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg mr-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">GlobalNews</h3>
                  <p className="text-gray-400 text-sm">Truth. Integrity. Impact.</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted source for breaking news, in-depth analysis, and comprehensive coverage from around the world.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Globe className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button className="text-gray-400 hover:text-white transition-colors text-sm">
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">About Us</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Our Team</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Careers</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Advertise</button></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Cookie Policy</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Disclaimer</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} GlobalNews. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <button className="text-gray-400 hover:text-white transition-colors text-sm">
                  RSS Feed
                </button>
                <button className="text-gray-400 hover:text-white transition-colors text-sm">
                  Newsletter
                </button>
                <button className="text-gray-400 hover:text-white transition-colors text-sm">
                  Mobile App
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {isScrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowRight className="w-5 h-5 mx-auto rotate-[-90deg]" />
        </button>
      )}

      {/* Breaking News Ticker */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-2 z-40 overflow-hidden">
          <div className="flex items-center">
            <div className="bg-red-700 px-4 py-1 text-xs font-bold whitespace-nowrap">
              BREAKING
            </div>
            <div className="animate-marquee whitespace-nowrap px-4 text-sm">
              Latest: {featured?.title} • Click to read more breaking news updates
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translate3d(100%, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}