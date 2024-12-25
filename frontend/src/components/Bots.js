import SimpleForm from './SimpleForm';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useChats } from '../utils/useChats';
import { useMode } from '../utils/useMode';
import Background from './Backgrounds';
import { useNavigate } from 'react-router-dom';

export default function Bots() {

    const { bots, searchParams, getBots } = useChats();

    const { theme, setTheme } = useMode();

    useEffect(() => {
        getBots();
    }, [getBots])

    const initialState = {
        botName: '',
        systemMessage: '',
    };
    const [formData, setFormData] = useState(initialState);

    const [error, setError] = useState("");

    const navigate = useNavigate();

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
                process.env.REACT_APP_CREATEBOT,
                formData,
                { withCredentials: true }
            );
            if (response) {
                console.log(response.status.message);
                navigateToBot(response.data.id);
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
        setFormData(initialState);
    };

    const navigateToBot = (botId) => {
        navigate(`/`, { state: { botId } });
    }

    return (
        <>
            <Background theme={theme} />

            <div className="container">

                <div className="mainContent">
                    <div className="chatContainer">
                        <SimpleForm 
                            title="Add a bot persona" 
                            fields={[
                            { label: "Name", type: "text", name: "botName", value: formData.botName, onChange: handleChange, inputType: "input" },
                            { label: "Instructions", type: "text", name: "systemMessage", value: formData.systemMessage, onChange: handleChange, inputType: "textarea" }
                            ]}
                            onSubmit={handleSubmit} 
                            error={error}
                        />

                        {bots.map((bot, index) => (
                            <div className="message" key={index}>
                                <h2>{bot.botName}</h2>
                                <p>{bot.botId}</p>
                                <p>
                                    <span className="name">Instructions: </span>
                                    {bot.systemMessage.content[0].text}
                                </p>
                                <button className="button" onClick={() => navigateToBot(bot.botId)}>Chat</button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}