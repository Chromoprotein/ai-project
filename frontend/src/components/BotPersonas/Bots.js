
import { useState, useEffect } from 'react';
import { useChats } from '../../utils/useChats';
import { useMode } from '../../utils/useMode';
import Background from '../Reusables/Backgrounds';
import { useNavigate } from 'react-router-dom';
import { CiCirclePlus } from "react-icons/ci";
import { Link } from "react-router-dom";
import BotForm from './BotForm';
import { Spinner } from '../Reusables/SmallUIElements';
import BotDetails from './BotDetails';
import AvatarGen from './AvatarGen';

export default function Bots() {

    const { bots, getBots, loading, setLastBotId } = useChats();

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
    
    const navigateToBot = async (botId) => {
        const response = await setLastBotId(botId);
        if(response) {
            navigate("/");
        }
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
};