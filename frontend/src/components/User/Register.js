import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import Form from '../Reusables/Form';
import { useMode } from '../../utils/useMode';
import { defaultBot } from '../../utils/defaultBot';
import Layout from '../Reusables/Layout';
import BackButton from '../Reusables/BackButton';
import { Link } from 'react-router-dom';
import { initialSharedData } from '../../utils/defaultBot';
import { useChats } from '../../utils/useChats';
import axiosInstance from '../../utils/axiosInstance';

export default function Register() {
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);

  const { theme, setTheme } = useMode();

  const { setLastBotId } = useChats();

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

  const saveAvatar = async (botId, avatarFilename) => {
      try {
          const response = await axiosInstance.put(
              process.env.REACT_APP_PLACEHOLDERAVATAR,
              { 
                  botId,
                  avatar: avatarFilename
              }
          );
      } catch (error) {
          console.log(error);
          setError(error.message);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(process.env.REACT_APP_REGISTER, formData, { withCredentials: true });
      if (response.status === 201) {
          const token = response.data.jwt;
          setCookie('jwt', token, { path: '/', secure: true, httpOnly: true }); // Set the JWT token as a cookie
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('name', response.data.username)

          // Give the user a default bot
          const formData = defaultBot;
          const sharedData = initialSharedData;

          const allData = { formData, sharedData };

          const createBot = await axios.post(process.env.REACT_APP_CREATEBOT, allData, { withCredentials: true });
          if(createBot) {
            const botId = createBot.data.id;
            await setLastBotId(botId);
            await saveAvatar(botId, "mysteriousTravellerAvatar.webp");

            navigate("/");
          };
      }
    } catch (error) {
      console.error(error);
      setError(error.response.data.message);
    }
  };

  const buttons = (
      <>
          <BackButton />
          <Link to="/login" className="botButton">Log in</Link>
      </>
  );

  return (
    <Layout theme={theme} buttons={buttons}>
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
      />
    </Layout>
  );
};