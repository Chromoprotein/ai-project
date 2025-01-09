
import { useState, useEffect } from 'react';
import { useChats } from '../utils/useChats';
import { useMode } from '../utils/useMode';
import Background from './Backgrounds';
import { useNavigate } from 'react-router-dom';
import sliderData from "../shared/botTraitData";
import { CiCirclePlus } from "react-icons/ci";
import { Link } from "react-router-dom";
import BotForm from './BotForm';
import axiosInstance from '../utils/axiosInstance';
import { Spinner } from './SmallUIElements';

export default function Bots() {

    const { bots, getBots, loading } = useChats();

    const initialState = {
        botName: '',
        instructions: '',
        userInfo: '',
        traits: []
    };

    const [editBot, setEditBot] = useState();

    const [showForm, setShowForm] = useState(false);
    const [expandedBots, setExpandedBots] = useState({});

    const [isSubmit, setIsSubmit] = useState(false);

    const [avatarGen, setAvatarGen] = useState();

    const toggleAvatarGen = (botId) => {
        if(avatarGen === botId) {
            setAvatarGen();
        } else {
            setAvatarGen(botId);
            setExpandedBots((prev) => ({ // Also expand the bot profile when the avatar generating view is expanded
                ...prev,
                [botId]: true,
            }));
        }
    }

    const { theme } = useMode();

    useEffect(() => {
        getBots();
    }, [getBots, isSubmit])

    const toggleForm = () => {
        setShowForm((prev) => !prev);
    }

    const toggleEdit = (botId) => {
        if(editBot === botId) {
            setEditBot();
        } else {
            setEditBot(botId);
        }
    }

    const expandBot = (botId) => {
        if(expandedBots[botId]) {
            setAvatarGen(); // Also close the avatar generating view when the bot profile is closed
        }
        setExpandedBots((prev) => ({
            ...prev,
            [botId]: !prev[botId],
        }));
    };

    const navigate = useNavigate();
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
                            <BotForm initialState={initialState} edit={false} setIsSubmit={setIsSubmit} />
                        </>}

                        {loading && <Spinner />}

                        {/* The existing bots */}

                        {bots && bots.map((bot, index) => {
                            const imageSrc = bot.avatar ? `data:image/webp;base64,${bot.avatar}` : "/placeholderAvatar.webp";
                            
                            return <>
                            {editBot === bot.botId ?
                                // Form for editing the bot
                                <BotForm initialState={bot} edit={true} toggleEdit={() => toggleEdit(bot.botId)} setIsSubmit={setIsSubmit} /> 
                            :
                                // Displaying the bot
                                <div className={`botWrapper ${!expandedBots[bot.botId] ? "collapsed" : "expanded"}`} key={index}>

                                    <AvatarGen 
                                        botId={bot.botId} 
                                        originalImage={imageSrc} 
                                        avatarGen={avatarGen} 
                                        toggleAvatarGen={() => toggleAvatarGen(bot.botId)} 
                                        setIsSubmit={setIsSubmit} 
                                    />

                                    <h2 className="botTitle">{bot.botName}</h2>

                                    {expandedBots[bot.botId] && 
                                        <BotDetails bot={bot} />
                                    }

                                    <div className="botButtons">
                                        <button className="button" onClick={() => navigateToBot(bot.botId)}>Chat</button>
                                        <button className="textButton" onClick={() => expandBot(bot.botId)}>{!expandedBots[bot.botId] ? "Info" : "Close"}</button>
                                        <button className="textButton" onClick={() => toggleEdit(bot.botId)}>Edit</button>
                                    </div>
                                </div>
                            }
                            </>
                        })}
                    </div>
                </div>

            </div>
        </>
    );
}

function AvatarGen({botId, originalImage, avatarGen, toggleAvatarGen, setIsSubmit}) {

    const [avatar, setAvatar] = useState();

    // States tracking the loading
    const [generating, setGenerating] = useState();
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const generateAvatar = async (botId) => {
        setAvatar();
        setIsSaved(false);
        setGenerating(true);
        try {
            const response = await axiosInstance.post(
                process.env.REACT_APP_GENERATEAVATAR,
                { botId }
            );
            if(response) {
                console.log(response.data[0].url)
                setAvatar(response.data[0].url);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setGenerating(false);
        }
    }

    const saveAvatar = async (botId) => {
        try {
            setSaving(true);
            const response = await axiosInstance.put(
                process.env.REACT_APP_AVATAR,
                { 
                    botId,
                    avatar: avatar
                }
            );
            if(response) {
                //setIsSubmit((prev) => !prev);
                console.log(response.data);
                setIsSaved(true);
                setIsSubmit((prev) => !prev); // to refetch bots
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <img src={(avatar && avatarGen === botId) ? avatar : originalImage} alt="Chatbot avatar" className="botImage" onClick={toggleAvatarGen} />

            {avatarGen === botId && <div className="botButtons">
                <button className="button" disabled={generating} onClick={() => generateAvatar(botId)}>
                    {generating ? "Generating..." : "Generate avatar"}
                </button>

                <button className="button" disabled={isSaved || !avatar || saving} onClick={() => saveAvatar(botId)}>
                    {isSaved ? "Avatar saved" : saving ? "Saving" : "Save this avatar"}
                </button>
            </div>}
        </>
    );
}

function BotDetails({bot}) {
    return (
        <>
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
    );
}