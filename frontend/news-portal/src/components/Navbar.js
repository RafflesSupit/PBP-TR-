import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="flex justify-between px-6 py-3 bg-gray-800 text-white">
      <div>
        <Link to="/" className="font-bold text-lg">Portal Berita</Link>
      </div>
      <div className="space-x-4">
        {token ? (
          <>
            <Link to="/profile">Profil</Link>
            <button onClick={logout} className="text-red-400">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
