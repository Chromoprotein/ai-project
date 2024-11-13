import React, {useEffect, useState} from "react";
import axios from "axios";

export default function Logout() {

    const [message, setMessage] = useState("");

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
        sessionStorage.removeItem('userRole');
    }, [])

    return (
        <p>{message && message}</p>
    );
}