
import { useState, useEffect } from 'react';
import { useChats } from '../../utils/useChats';
import { useMode } from '../../utils/useMode';
import { useNavigate } from 'react-router-dom';
import { CiCirclePlus } from "react-icons/ci";
import BotForm from './BotForm';
import { MiniSpinner } from '../Reusables/SmallUIElements';
import BotDetails from './BotDetails';
import AvatarGen from './AvatarGen';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiExpandDiagonalLine } from "react-icons/ri";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import axiosInstance from '../../utils/axiosInstance';
import Layout from '../Reusables/Layout';
import IconButton from '../Reusables/IconButton';
import BackButton from '../Reusables/BackButton';
import { initialSharedData } from '../../utils/defaultBot';

export default function Bots() {

    const { bots, getBots, setBots, currentBot, setLastBotId, loadingBots, getUser, userData, addUserDataToBots, getLastBot } = useChats();

    const initialState = {
        botName: '',
        instructions: '',
        userInfo: '', // additional info about the user specifically for that bot
        traits: [],
    };

    const { theme } = useMode();

    const [editBot, setEditBot] = useState();

    const [showForm, setShowForm] = useState(false);
    const [expandedBots, setExpandedBots] = useState({});

    const [isSubmit, setIsSubmit] = useState(false);

    const [avatarGen, setAvatarGen] = useState();

    useEffect(() => {
        const getUserAndBots = async () => {
            // Fetch the bot data and the user data
            const [botResult, userResult] = await Promise.all([getBots(), getUser()])

            // Check what user data is shared with bots and add it to the bots
            const combinedData = addUserDataToBots(userResult, botResult);
            setBots(combinedData);
        }
        getUserAndBots();
    }, [getBots, getUser, isSubmit, addUserDataToBots, setBots])

    useEffect(() => {
        getLastBot();
    }, [getLastBot])

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

    const forgetBot = async () => {
        try {
            const response = await axiosInstance.patch(process.env.REACT_APP_FORGETBOT);
            if(response) {
                navigate("/");
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const buttons = (
        <>
            <BackButton />
            <IconButton func={toggleForm} icon={<CiCirclePlus />} changeClass="botButton" text="Add bot" />
        </>
    );
    
    return (
        <>
            <Layout theme={theme} buttons={buttons}>

                {/* The bot form */}

                {showForm && <>
                    <BotForm 
                        userData={userData} 
                        initialState={initialState} 
                        edit={false} 
                        setIsSubmit={setIsSubmit} 
                        initialSharedData={initialSharedData}
                    />
                </>}

                {loadingBots && <MiniSpinner />}

                {/* The existing bots */}

                {bots && bots.map((bot, index) => {

                    return <div key={index}>
                    {editBot === bot.botId ?
                        // Form for editing the bot
                        <BotForm 
                            userData={userData} 
                            initialState={bot} 
                            initialSharedData={userData.sharedWithBots.find(shared => shared.botId === bot.botId)} 
                            edit={true} 
                            toggleEdit={() => toggleEdit(bot.botId)} 
                            setIsSubmit={setIsSubmit} 
                        /> 
                    :
                        // Displaying the bot
                        <div className={`botWrapper ${!expandedBots[bot.botId] ? "collapsed" : "expanded"} ${currentBot?.botId === bot.botId ? "activeBot" : "inactiveBot"}`} key={index}>

                            <AvatarGen 
                                botId={bot.botId} 
                                originalImage={bot.avatar ? `data:image/webp;base64,${bot.avatar}` : "/placeholderAvatar.webp"}
                                avatarGen={avatarGen} 
                                toggleAvatarGen={() => toggleAvatarGen(bot.botId)} 
                                setIsSubmit={setIsSubmit} 
                            />

                            <h2 className="botTitle">{bot.botName}</h2>

                            {expandedBots[bot.botId] && 
                                <BotDetails bot={bot} />
                            }

                            <div className="botButtons">
                                <Chat func={() => navigateToBot(bot.botId)} />

                                <IconButton changeClass="botButton" func={() => expandBot(bot.botId)} condition={!expandedBots[bot.botId]} falseIcon={<RiCollapseDiagonal2Line/>} trueIcon={<RiExpandDiagonalLine/>} falseText="Close" trueText="Info" />

                                <IconButton changeClass="botButton" func={() => toggleEdit(bot.botId)} icon={<FaEdit/>} text="Edit" />
                            </div>
                        </div>
                    }
                    </div>
                })}

                <div className={`botWrapper expanded ${currentBot?.botId ? "inactiveBot" : "activeBot"}`}>
                    <div className="botButtons">
                        <p>Chat without custom instructions</p>
                        <Chat func={forgetBot} />
                    </div>
                </div>

            </Layout>
        </>
    );
};

function Chat({func}) {
    return (
        <IconButton changeClass="botButton" icon={<IoChatbubbleEllipsesOutline />} text="Chat" func={func} />
    );
}