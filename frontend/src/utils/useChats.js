import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "./axiosInstance";

export function useChats() {

    const [searchParams, setSearchParams] = useSearchParams();

    // Chat-related state
    const [chatList, setChatList] = useState({}); // Object where keys are chat category names and values are arrays of chats (that have a title and an id)

    // Bot persona -related state
    const [bots, setBots] = useState(); // List of bot personas
    const [currentBot, setCurrentBot] = useState();

    // Loading states
    const [loadingBots, setLoadingBots] = useState(false);
    const [loadingChatList, setLoadingChatList] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [loadingBot, setLoadingBot] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);

    // User data for display purposes
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        aboutMe: '',
        interestsHobbies: '',
        currentGoals: [],
        currentMood: '',
        sharedWithBots: []
    });

    const getUser = useCallback(async () => {
        try {
            setLoadingUser(true);
            const response = await axiosInstance.get(process.env.REACT_APP_GETUSER);
            if(response) {
                const user = response.data;
                setUserData({
                    username: user.username,
                    email: user.email,
                    aboutMe: user.aboutMe,
                    interestsHobbies: user.interestsHobbies,
                    currentGoals: user.currentGoals.length > 0 ? user.currentGoals : [],
                    currentMood: user.currentMood,
                    sharedWithBots: user.sharedWithBots.length > 0 ? user.sharedWithBots : []
                });
                return response.data;
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingUser(false);
        }
    }, []);

    // Used when a bot is selected. Saves what was the last active bot
    const setLastBotId = useCallback((async (botId) => {
        try {
            const response = await axiosInstance.post(process.env.REACT_APP_SETLASTBOTID, 
                { botId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if(response) {
                return response.data.message;
            }
            return null;
        } catch (error) {
            console.log(error.message);
        }
    }), []);

    // Used when a new chat is started from the front page, automatically gives the last selected bot as a suggestion
    const getLastBot = useCallback((async () => {
        try {
            setLoadingBot(true);
            const response = await axiosInstance.get(process.env.REACT_APP_GETLASTBOT);
            if(response.data?.foundLastBot) {
                const bot = response.data.foundLastBot;
                const formattedBot =
                    {
                        botId: bot._id,
                        botName: bot.botName,
                        avatar: bot.avatar,
                        instructions: bot.instructions,
                        traits: bot.traits?.length > 0 ? JSON.parse(bot.traits) : [],
                        userInfo: bot.userInfo,
                        sharedData: {}
                    };
                setCurrentBot(formattedBot);
                return formattedBot;
            } else {
                return null;
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoadingBot(false);
        }
    }), []);

    const addUserDataToBots = useCallback((userResult, botResult) => {
        // Convert shared data into a quick lookup map
        const sharedMap = new Map();
        userResult.sharedWithBots.forEach((shared) => {
            sharedMap.set(shared.botId.toString(), shared);
        });

        // A helper function to process a single bot
        const processBot = (bot) => {
            const sharedData = sharedMap.get(bot.botId.toString()) || null;
            return {
                ...bot,
                sharedData: sharedData
                    ? {
                        shareUsername: sharedData.shareUsername ? userResult.username : null,
                        shareAboutMe: sharedData.shareAboutMe ? userResult.aboutMe : null,
                        shareInterestsHobbies: sharedData.shareInterestsHobbies ? userResult.interestsHobbies : null,
                        shareCurrentMood: sharedData.shareCurrentMood ? userResult.currentMood : null,
                        sharedGoals: userResult.currentGoals.filter((g) => sharedData.sharedGoals.includes(g.id))
                    }
                    : null
            };
        };

        // Check if botResult is an array or a single object
        if (Array.isArray(botResult)) {
            return botResult.map(processBot);
        } else {
            return processBot(botResult);
        }
    }, []);

    // Fetch an old chat based on the chat ID in the URL
    const getChat = useCallback((async (chatId, setMessages) => {
        try {
            setLoadingChat(true);
            const response = await axiosInstance.get(process.env.REACT_APP_GETCHAT, {
                params: { chatId: chatId },
            });
            if (response.data) {
                const mappedMessages = response.data.chat.messages.map((message) =>
                    JSON.parse(message.content)
                );
                if (mappedMessages.length > 0) {
                    setMessages(mappedMessages);
                }
                const chat = response.data.chat;
                if(chat.botId) {
                    setCurrentBot({ 
                        botId: chat.botId._id,
                        botName: chat.botId.botName,
                        avatar: chat.botId.avatar,
                        instructions: null,
                        traits: [],
                        userInfo: null,
                        sharedData: {}
                    });
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingChat(false);
        }
    }), []);

    // Get the list of chats for the sidebar
    const getChatList = useCallback((async () => {
        try {
            setLoadingChatList(true);
            const response = await axiosInstance.get(process.env.REACT_APP_GETCHATLIST);
            if (response.data) {
                setChatList(response.data.groupedChats);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingChatList(false);
        }
    }), []);

    // Start a new chat when the user sends the first message
    const saveNewChat = async (userMessage, currentBotId = null) => {
        const newChatData = { userMessage, botId: currentBotId };

        try {
            const response = await axiosInstance.post(
                process.env.REACT_APP_NEWCHAT,
                { newChatData: newChatData },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data) {
                const chatId = response.data.id;
                setSearchParams({ chatId: chatId });
                return chatId;
            }
        } catch (error) {
            console.log(error);
        }

        return "";
    };

    // Get the list of bot personas / system prompts
    const getBots = useCallback((async () => {
        try {
            setLoadingBots(true);
            const fetchBotsResponse = await axiosInstance.get(process.env.REACT_APP_GETALLBOTS);

            if(fetchBotsResponse) {
                const fetchBots = fetchBotsResponse.data.bots;
                const formattedBots = fetchBots.map((bot) => (
                    {
                        botId: bot._id,
                        botName: bot.botName,
                        avatar: bot.avatar,
                        instructions: bot.instructions,
                        traits: bot.traits?.length > 0 ? JSON.parse(bot.traits) : [],
                        userInfo: bot.userInfo
                    }
                ));
                setBots(formattedBots);
                return formattedBots;
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingBots(false);
        }
    }), []);

    return { chatList, getChat, getChatList, saveNewChat, searchParams, setSearchParams, bots, getBots, getLastBot, currentBot, setCurrentBot, loadingBot, setLoadingBot, loadingBots, loadingChat, loadingChatList, setLastBotId, getUser, userData, setBots, addUserDataToBots, loadingUser }

};