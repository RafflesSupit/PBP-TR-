import React from "react";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">{children}</main>
    </div>
  );
};

export default AdminLayout;
