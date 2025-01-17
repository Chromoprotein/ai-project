import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "./axiosInstance";

export function useChats() {

    const [searchParams, setSearchParams] = useSearchParams();

    // Chat-related state
    const [chatList, setChatList] = useState({}); // Object where keys are chat category names and values are arrays of chats (that have a title and an id)

    // Bot persona -related state
    const [bots, setBots] = useState(); // List of bot personas
    const [currentBot, setCurrentBot] = useState(); // Avatar, name, custom instructions etc. of the active bot

    // Loading states
    const [loadingBots, setLoadingBots] = useState(false);
    const [loadingChatList, setLoadingChatList] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [loadingBot, setLoadingBot] = useState(true);

    // Used when a bot or an old chat is selected
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

    // Used when a new chat is started from the front page, automatically gives the last used bot
    const getLastBot = useCallback((async () => {
        try {
            setLoadingBot(true);
            const response = await axiosInstance.get(process.env.REACT_APP_GETLASTBOT);
            if(response.data.foundLastBot) {
                const bot = response.data.foundLastBot;
                const newBot = {
                    botId: bot._id,
                    botName: bot.botName,
                    instructions: bot.instructions,
                    traits: bot.traits ? JSON.parse(bot.traits) : [],
                    userInfo: bot.userInfo,
                    avatar: bot.avatar,
                };             
                setCurrentBot(newBot);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoadingBot(false);
        }
    }), []);

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
                console.log(response.data.chat)
                if(chat.botId) {
                    setCurrentBot({
                        botId: chat.botId._id,
                        botName: chat.botId.botName,
                        traits: chat.botId.traits,
                        instructions: chat.botId.instructions,
                        userInfo: chat.botId.userInfo,
                        avatar: chat.botId.avatar,
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
                console.log(response.data);
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
            const response = await axiosInstance.get(process.env.REACT_APP_GETBOTS);
            if(response.data.bots.length > 0) {
            const mappedBots = response.data.bots.map((bot) => ({
                botId: bot._id,
                botName: bot.botName,
                instructions: bot.instructions,
                traits: bot.traits?.length > 0 ? JSON.parse(bot.traits) : [],
                userInfo: bot.userInfo,
                avatar: bot.avatar,
            }));
                setBots(mappedBots);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingBots(false);
        }
    }), []);

    return { chatList, getChat, getChatList, saveNewChat, searchParams, setSearchParams, bots, getBots, getLastBot, currentBot, loadingBot, loadingBots, loadingChat, loadingChatList, setLastBotId }

};