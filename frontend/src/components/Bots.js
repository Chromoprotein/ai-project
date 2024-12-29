import ReactSlider from "react-slider";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useChats } from '../utils/useChats';
import { useMode } from '../utils/useMode';
import Background from './Backgrounds';
import { useNavigate } from 'react-router-dom';
import sliderData from "../shared/botTraitData";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";

export default function Bots() {

    const { bots, getBots } = useChats();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { theme } = useMode();

    useEffect(() => {
        getBots();
    }, [getBots])

    const initialState = {
        botName: '',
        systemMessage: '',
        userInfo: '',
        traits: []
    };
    const [formData, setFormData] = useState(initialState);

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const toggleAdvanced = () => {
        setShowAdvanced((prev) => !prev);
    }
    console.log(showAdvanced)

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
                : prevFormData.traits.some((trait) => trait.id === id) // Check whether object exists in formData
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
                                <label>Name *</label>
                                <input type="text" name="botName" value={formData.botName} onChange={handleChange} />
                            </div>

                            <div className="formItem">
                                <label>Instructions *
                                </label>
                                <textarea type="text" name="systemMessage" value={formData.systemMessage} onChange={handleChange}></textarea>
                            </div>

                            <div className="formItem">
                                <label>Traits</label>

                                {sliderData.map(traitPair => {
                                    // Find the current score for this slider's ID
                                    const currentScore = formData.traits?.find((trait) => trait.id === traitPair.id)?.score || 0;

                                    if(traitPair.isAdvanced && !showAdvanced) {
                                        return null;
                                    }

                                    return (<div>
                                        <label className="sliderLabel">
                                            <span className="labelLeft">{traitPair.leftTrait}</span>
                                            <span className="labelCenter">{Math.abs(currentScore)}/100</span>
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

                                <p className="textButton" onClick={toggleAdvanced}>
                                    {showAdvanced ? (<>Show Less <FaChevronUp /> </>) : (<>Show More <FaChevronDown /></>)}
                                </p>
                            </div>

                            <div className="formItem">
                                <label>The bot should know about you:</label>
                                <textarea type="text" name="userInfo" value={formData.userInfo} onChange={handleChange}></textarea>
                            </div>

                            <div className="formItem">
                                <button className="button removeMargin" type="submit">
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