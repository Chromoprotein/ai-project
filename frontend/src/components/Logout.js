import React, {useEffect, useState} from "react";
import axios from "axios";
import Background from './Backgrounds';
import { useMode } from "../utils/useMode";
import { Link } from "react-router-dom";

export default function Logout() {

    const [message, setMessage] = useState("");

    const { theme, setTheme } = useMode();

    useEffect(() => {
        async function logout() {
            try {
                const response = await axios.post(process.env.REACT_APP_LOGOUT, {}, {
                    withCredentials: true
                });
                setMessage(response.data.message);
            } catch (error) {
                console.error('Logout failed', error);
            }
        }
        logout();
        sessionStorage.removeItem('isAuthenticated');
    }, [])

    return (
        <>
            <Background theme={theme} />
            <div className="container">
                <div className="mainContent">
                    <h1 className="title">{message && message}</h1>
                    <Link className="button" to="/login">Log in again</Link>
                </div>
            </div>
        </>
    );
}