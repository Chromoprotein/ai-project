import ReactSlider from "react-slider";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useChats } from '../utils/useChats';
import { useMode } from '../utils/useMode';
import Background from './Backgrounds';
import { useNavigate } from 'react-router-dom';

export default function Bots() {

    const { bots, getBots } = useChats();

    const { theme } = useMode();

    useEffect(() => {
        getBots();
    }, [getBots])

    const sliderData = [
        { id: 1, leftTrait: "kind", rightTrait: "sarcastic" },
        { id: 2, leftTrait: "serious", rightTrait: "playful" },
        { id: 3, leftTrait: "formal", rightTrait: "casual" },
        { id: 4, leftTrait: "solution-oriented", rightTrait: "empathetic" },
        { id: 5, leftTrait: "detailed", rightTrait: "concise" },
        { id: 6, leftTrait: "flowery", rightTrait: "plainspoken" },
        { id: 7, leftTrait: "agreeable", rightTrait: "sceptic" },
    ]

    const initialState = {
        botName: '',
        systemMessage: '',
        userInfo: '',
        traits: [],
        sliderData: sliderData // for reference for the chatbot
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

    const handleSliderChange = (id, newScore) => {
        setFormData((prevFormData) => {
            const updatedTraits = newScore === 0
                ? prevFormData.traits.filter((trait) => trait.id !== id) // Remove if score is 0
                : prevFormData.traits.some((trait) => trait.id === id)
                    ? prevFormData.traits.map((trait) =>
                        trait.id === id ? { ...trait, score: newScore } : trait
                    ) // Update existing
                    : [...prevFormData.traits, { id, score: newScore }]; // Add new

            return {
                ...prevFormData,
                traits: updatedTraits, // Only update traits
            };
        });
    };

    console.log(formData.traits)

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

                        <form onSubmit={handleSubmit} className="formContainer">
                            <div className="formItem">
                            <h2>Add a new bot persona</h2>
                            </div>
                            <div className="formItem">
                                <label>Name</label>
                                <input type="text" name="botName" value={formData.botName} onChange={handleChange} />
                            </div>

                            {sliderData.map(traitPair => {
                                // Find the current score for this slider's ID
                                const currentScore = formData.traits?.find((trait) => trait.id === traitPair.id)?.score || 0;

                                return (<div className="formItem">
                                    <label className="sliderLabel">
                                        <span className="labelLeft">{traitPair.leftTrait}</span>
                                        <span className="labelRight">{traitPair.rightTrait}</span>
                                    </label>
                                    <ReactSlider
                                        className="customSlider"
                                        thumbClassName="customThumb"
                                        trackClassName="customTrack"
                                        value={currentScore}
                                        onChange={(value) => handleSliderChange(traitPair.id, value)}
                                        min={-100}
                                        max={100}
                                        step={10} // Interval
                                    />
                                </div>)
                            })}

                            <div className="formItem">
                                <label>Free instructions</label>
                                <textarea type="text" name="systemMessage" value={formData.systemMessage} onChange={handleChange}></textarea>
                            </div>

                            <div className="formItem">
                                <label>The bot should know about you:</label>
                                <textarea type="text" name="userInfo" value={formData.userInfo} onChange={handleChange}></textarea>
                            </div>

                            <div className="formItem">
                                <button className="button" type="submit">
                                    Submit
                                </button>
                            </div>

                            {error && (
                                <div className="formItem">
                                    {error}
                                </div>
                            )}
                        </form>

                        <div>
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

            </div>
        </>
    );
}