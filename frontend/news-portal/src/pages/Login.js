import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/login.css";
import axios from "../api/axios";

export default function Login() {
  const { login,token,user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  if(token || user){
    return <Navigate to="/" />
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/login", form);
      login(res.data.data.token, res.data.data.user);
      navigate("/");
    } catch (err) {
      setError("Email atau password tidak cocok");
    }
  };

  return (
    <div className="all">
      <div className="container">
        <div className="form-container">
          <h1>Login Now</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center justify-end mt-8">
              <button type="submit" className="button">Log in</button>
            </div>
          </form>

          <div className="signin">
            Don't have an account? <a href="/register">Sign Up</a>
          </div>
        </div>
        <div className="image-container"></div>
      </div>
    </div>
  );
}
