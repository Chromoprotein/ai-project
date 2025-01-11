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
    const [lastActiveId, setLastActiveId] = useState(); // last active bot's id, this is saved in the database so the user can continue chatting easily

    const [loading, setLoading] = useState(false);

    // Used when a bot or an old chat is selected
    const setLastBotId = useCallback((async (botId) => {
        if(botId !== lastActiveId) { // bot has changed
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
                    setLastActiveId(botId);
                }
                console.log(response.data)
                return response.data.message;
            } catch (error) {
                console.log(error.message);
            }
        }
    }), [lastActiveId]);

    // Used when a new chat is started from the front page, automatically gives the last used bot
    const getLastBotId = useCallback((async () => {
        try {
            const response = await axiosInstance.get(process.env.REACT_APP_GETLASTBOTID);
            if (response.data.lastBotId) {
                console.log("response is" + response.data.lastBotId)
                setLastActiveId(response.data.lastBotId);
                return response.data.lastBotId;
            }
            return null; // Explicitly return null if no lastBotId is found
        } catch (error) {
            console.log(error.message);
            return null; // Handle errors gracefully
        }
    }), []);

    // Fetch an old chat based on the chat ID in the URL
    const getChat = useCallback((async (chatId, setMessages) => {
        try {
            setLoading(true);
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
                    if(lastActiveId !== chat.botId._id) {
                        await setLastBotId(chat.botId._id);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }), [lastActiveId, setLastBotId]);

    // Get the list of chats for the sidebar
    const getChatList = useCallback((async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(process.env.REACT_APP_GETCHATLIST);
            if (response.data) {
                setChatList(response.data.groupedChats);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
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
            setLoading(true);
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
            setLoading(false);
        }
    }), []);

    const getBot = useCallback((async (botToSearch) => {
        try {
            const response = await axiosInstance.get(process.env.REACT_APP_GETBOT, {       
                params: { botId: botToSearch },
            });
            if(response.data.bot) {
                const newBot = {
                    botId: response.data.bot._id,
                    botName: response.data.bot.botName,
                    instructions: response.data.bot.instructions,
                    traits: response.data.bot.traits ? JSON.parse(response.data.bot.traits) : [],
                    userInfo: response.data.bot.userInfo,
                    avatar: response.data.bot.avatar,
                };             
                setCurrentBot(newBot);
            }
        } catch (error) {
            console.log(error);
        }
    }), []);

    return { chatList, getChat, getChatList, saveNewChat, searchParams, bots, getBots, getBot, currentBot, setCurrentBot, loading, getLastBotId, setLastBotId, lastActiveId }

};