import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const { pathname } = useLocation();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Manajemen User", path: "/admin/users" },
    { name: "Manajemen Kategori", path: "/admin/categories" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-4 fixed">
      <h2 className="text-xl font-bold mb-6 text-center">Admin Panel</h2>
      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded hover:bg-blue-100 ${
              pathname === item.path ? "bg-blue-200 text-blue-700" : "text-gray-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
