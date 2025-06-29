import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import AddNews from "./components/AddNews";
import NewsAdmin from "./pages/admin/NewsAdmin";
import EditNews from "./pages/admin/EditNews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageUsers from "./pages/admin/ManageUser";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NewsDetail from "./pages/NewsDetail";
import Profile from "./pages/Profile";
import ProtectedRoute from "./ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/news/add"
          element={
            <ProtectedRoute>
              <AddNews />
            </ProtectedRoute>
          }
        />
        <Route path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/editor/news" element={
          <ProtectedRoute allowedRoles={['editor']}>
            <NewsAdmin />
          </ProtectedRoute>
        } />

        <Route path="/news/add" element={
          <ProtectedRoute allowedRoles={['editor']}>
            <EditNews />
          </ProtectedRoute>
        } />

        <Route path="/news/edit/:id" element={
          <ProtectedRoute allowedRoles={['editor']}>
            <EditNews />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <ManageUsers />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <ManageCategories />
            </AdminLayout>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
