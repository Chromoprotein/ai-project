import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import Form from './Form';
import Background from './Backgrounds';
import { useMode } from '../utils/useMode';

export default function Register() {
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);

  const { theme, setTheme } = useMode();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(process.env.REACT_APP_REGISTER, formData, { withCredentials: true });
      console.log(response.data);
      if (response.status === 201) {
          const token = response.data.jwt;
          setCookie('jwt', token, { path: '/', secure: true, httpOnly: true }); // Set the JWT token as a cookie
          console.log(response.data)
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
          <Form
            title="Register"
            fields={[
              { label: "Username", type: "text", name: "username", value: formData.username, onChange: handleChange },
              { label: "Email", type: "text", name: "email", value: formData.email, onChange: handleChange },
              { label: "Password", type: "password", name: "password", value: formData.password, onChange: handleChange }
            ]}
            buttonText="Register"
            onSubmit={handleSubmit}
            error={error}
            linkInfo="Already have an account?"
            linkText="Log in"
            linkTo="/login"
          />
        </div>
      </div>
    </>
  );
};