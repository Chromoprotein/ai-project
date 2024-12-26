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

    const initialState = {
        botName: '',
        systemMessage: '',
        userInfo: '',
        traits: {},
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

    const handleSliderChange = (name, value) => {
        setFormData((prevFormData) => {
            const updatedTraits = { ...prevFormData.traits };

            if (value < 0) {
                updatedTraits[name.leftTrait] = value;
            } else if (value > 0) {
                updatedTraits[name.rightTrait] = value;
            } else { // remove if the trait is average (50)
                if(updatedTraits[name.leftTrait]) {
                    delete updatedTraits[name.leftTrait];
                }
                if(updatedTraits[name.rightTrait]) {
                    delete updatedTraits[name.rightTrait];
                }
            }

            return {
                ...prevFormData,
                traits: updatedTraits, // Update traits object
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Turn the left side traits' values positive
        const formattedTraits = Object.fromEntries(
            Object.entries(formData.traits)
            .map(([key, value]) => [key, Math.abs(value)])
        );
        const formattedData = {...formData, traits: formattedTraits};

        try {
            const response = await axios.post(
                process.env.REACT_APP_CREATEBOT,
                formattedData,
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

    const sliderData = [
        { leftTrait: "kind", rightTrait: "sarcastic" },
        { leftTrait: "serious", rightTrait: "playful" },
        { leftTrait: "formal", rightTrait: "casual" },
        { leftTrait: "solution-oriented", rightTrait: "empathetic" },
        { leftTrait: "detailed", rightTrait: "concise" },
        { leftTrait: "flowery", rightTrait: "plainspoken" },
        { leftTrait: "agreeable", rightTrait: "sceptic" },
    ]

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

                            {sliderData.map(item => (
                                <div className="formItem">
                                    <label className="sliderLabel">
                                        <span className="labelLeft">{item.leftTrait}</span>
                                        <span className="labelRight">{item.rightTrait}</span>
                                    </label>
                                    <ReactSlider
                                        className="customSlider"
                                        thumbClassName="customThumb"
                                        trackClassName="customTrack"
                                        value={formData.traits[item.leftTrait] !== undefined ? formData.traits[item.leftTrait] : formData.traits[item.rightTrait] !== undefined ? formData.traits[item.rightTrait] : 0}
                                        onChange={(value) => handleSliderChange(item, value)}
                                        min={-100}
                                        max={100}
                                        step={10} // Interval
                                    />
                                </div>
                            ))}

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