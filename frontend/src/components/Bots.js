import ReactSlider from "react-slider";
import { useState, useEffect } from 'react';
import axiosInstance from "../utils/axiosInstance";
import { useChats } from '../utils/useChats';
import { useMode } from '../utils/useMode';
import Background from './Backgrounds';
import { useNavigate } from 'react-router-dom';
import sliderData from "../shared/botTraitData";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import { Link } from "react-router-dom";

export default function Bots() {

    const { bots, getBots } = useChats();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [expandedBots, setExpandedBots] = useState({});

    const { theme } = useMode();

    useEffect(() => {
        getBots();
    }, [getBots])

    const initialState = {
        botName: '',
        instructions: '',
        userInfo: '',
        traits: []
    };
    const [formData, setFormData] = useState(initialState);

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const toggleAdvanced = () => {
        setShowAdvanced((prev) => !prev);
    }

    const toggleForm = () => {
        setShowForm((prev) => !prev);
    }

    const expandBot = (botId) => {
        setExpandedBots((prev) => ({
            ...prev,
            [botId]: !prev[botId],
        }));
    };

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
            const response = await axiosInstance.post(
                process.env.REACT_APP_CREATEBOT,
                formData
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

                        <div className="botButtons">
                            <Link to="/" className="button">Back</Link>

                            <button className="button" onClick={toggleForm}><CiCirclePlus /> Add bot</button>
                        </div>

                        {/* The bot form */}

                        {showForm && <>

                            <form onSubmit={handleSubmit} className="formContainer">

                                <div className="formItem">
                                    <h1>New bot persona</h1>
                                </div>

                                <div className="formItem">
                                    <label className="smallLabel">Name *</label>
                                    <input type="text" name="botName" value={formData.botName} onChange={handleChange} />
                                </div>

                                <div className="formItem">
                                    <label className="smallLabel">Instructions *
                                    </label>
                                    <textarea type="text" name="instructions" value={formData.instructions} onChange={handleChange}></textarea>
                                </div>

                                <div className="formItem">
                                    <label className="smallLabel">Traits</label>

                                    {sliderData.map(traitPair => {
                                        // Find the current score for this slider's ID
                                        const currentScore = formData.traits?.find((trait) => trait.id === traitPair.id)?.score || 0;

                                        if(traitPair.isAdvanced && !showAdvanced) {
                                            return null;
                                        }

                                        return (<div>
                                            <label className="smallLabel sliderLabel">
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
                                    <label className="smallLabel">The bot should know about you:</label>
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
                        </>}
                        

                        {/* The existing bots */}

                        {bots && bots.map((bot, index) => {
                            const imageSrc = bot.avatar ? `data:image/webp;base64,${bot.avatar}` : "/placeholderAvatar.webp";
                            
                            return <div className={`botWrapper ${!expandedBots[bot.botId] ? "collapsed" : "expanded"}`} key={index}>

                                <img src={imageSrc} alt="Chatbot avatar" className="botImage" />
                                <h2 className="botTitle">{bot.botName}</h2>

                                {expandedBots[bot.botId] && 
                                <>
                                    <img src="/placeholderAvatar.webp" alt="Chatbot avatar" className="botImage" />
                                    <h2 className="botTitle">{bot.botName}</h2>

                                    <div className="botTraits">
                                        {bot.traits ? bot.traits.map(botTrait => {
                                            // Find the current score for this slider's ID
                                            const sliderTrait = sliderData?.find((trait) => trait.id === botTrait.id);

                                            let displayTrait;

                                            if(botTrait.score < 0) {
                                                displayTrait = sliderTrait.leftTrait;
                                            } else {
                                                displayTrait = sliderTrait.rightTrait;
                                            }

                                            return <div className="labelBubble">
                                                        <span>{displayTrait} ({Math.abs(botTrait.score)})</span>
                                                    </div>
                                        }) : <span  className="italic">No traits added</span>}
                                    </div>

                                    <p>
                                        <span className="smallLabel">Instructions: </span>
                                        {bot.instructions ? bot.instructions : <span className="italic">No instructions added</span>}
                                    </p>

                                    <p>
                                        <span className="smallLabel">Knowledge about the user: </span>
                                        {bot.userInfo ? bot.userInfo : <span className="italic">No user information added</span>}
                                    </p>
                                </>
                                }

                                <div className="botButtons">
                                    <button className="button" onClick={() => navigateToBot(bot.botId)}>Chat</button>
                                    <button className="textButton" onClick={() => expandBot(bot.botId)}>{!expandedBots[bot.botId] ? "Info" : "Close"}</button>
                                    <Link to={`/edit/${bot.botId}`} className="textButton">Edit</Link>
                                </div>
                            </div>
                        })}
                    </div>
                </div>

            </div>
        </>
    );
}