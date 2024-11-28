import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import Background from './Backgrounds';

export default function Login() {
  
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Don't allow logged-in users to look at the login page
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return "Loading...";
  }
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await axios.post(
            process.env.REACT_APP_LOGIN,
            formData,
            { withCredentials: true }
          );
          if (response.status === 201) {
              console.log("user logged in")
              sessionStorage.setItem('isAuthenticated', 'true');
              navigate("/");
          }
      } catch (error) {
          console.error(error);
      }
  };

  return (
    <>
      <Background theme={theme} />
      <div className="container">
        <div className="mainContent">
          <h1>Log in</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit">Log in</button>
          </form>

          <div>
            Don't have an account?
            <button>
              <Link to="/register">Create an account</Link>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};