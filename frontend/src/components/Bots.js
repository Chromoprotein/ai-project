import SimpleForm from './SimpleForm';
import { useState } from 'react';
import axios from 'axios';

export default function Bots({ bots, toggleBot, clearScreen, setIsSubmit }) {

    const initialState = {
        botName: '',
        systemMessage: '',
    };
    const [formData, setFormData] = useState(initialState);

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
            const response = await axios.post(
                process.env.REACT_APP_CREATEBOT,
                formData,
                { withCredentials: true }
            );
            if (response) {
                console.log(response.status.message);
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
        setIsSubmit(true); // This triggers refetching the bots list
        setFormData(initialState);
    };

    // Clears the old chat from the states and selects a new bot for a fresh chat
    const switchBots = (botId) => {
        clearScreen();
        toggleBot(botId);
    }

    return (
        <div>
            <SimpleForm 
                title="Add a bot persona" 
                fields={[
                { label: "Name", type: "text", name: "botName", value: formData.botName, onChange: handleChange },
                { label: "Instructions", type: "text", name: "systemMessage", value: formData.systemMessage, onChange: handleChange }
                ]}
                onSubmit={handleSubmit} 
                error={error}
            />

            {bots.map((bot, index) => (
                <div className="message" key={index}>
                    <h2>{bot.botName}</h2>
                    <p>
                        <span className="name">Instructions: </span>
                        {bot.systemMessage.content[0].text}
                    </p>
                    <button className="button" onClick={() => switchBots(bot.botId)}>Chat</button>
                </div>
            ))}
        </div>
    );
}