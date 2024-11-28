import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import Background from './Backgrounds';
import Form from './Form';
import { HashLink } from "react-router-hash-link";
import { useMode } from '../utils/useMode';

export default function Login() {
  
  const navigate = useNavigate();
  const { theme, setTheme } = useMode();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState("");

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
          setError(error.message);
      }
  };

  return (
    <>
      <Background theme={theme} />
      <div className="fixedContainer">

        <div className="introWrapper">
          <h1 className="title">Hello, human</h1>
          <p>Welcome to my chatbot page! It's based on GPT-4o-mini. Features:</p>
          <ul>
            <li>Dall-e image generation</li>
            <li>Automatic folders for organizing the chats</li>
            <li>And more coming soon!</li>
          </ul>

          <HashLink smooth to="#Login" className="button">
              Log in
          </HashLink>
          <Link className="button" to="/register">Sign up</Link>
        </div>

        <div className="introWrapper" id="Login">
          <Form
            title="Log in"
            fields={[
              { label: "Email", type: "text", name: "email", value: formData.email, onChange: handleChange },
              { label: "Password", type: "password", name: "password", value: formData.password, onChange: handleChange }
            ]}
            buttonText="Log in"
            onSubmit={handleSubmit}
            error={error}
            linkInfo="Don't have an account?"
            linkText="Create an account"
            linkTo="/register"
          />
        </div>

      </div>
    </>
  );
};