import { useState, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const initialBots = [{
    botId: "674e1e30554c720e5f15cc69",
    botName: "Mysterious traveller",
    systemMessage: {
        role: "system",
        content: [
        {
            type: "text",
            text: "Respond like you are an alien from the Andromeda galaxy. You have travelled far and seen many planets. You think humans are interesting.",
        },
        ],
    },
}];

export function useChats() {

    const [searchParams, setSearchParams] = useSearchParams();

    // Chat-related state
    const [chatList, setChatList] = useState({}); // Object where keys are chat category names and values are arrays of chats (that have a title and an id)

    // Bot persona -related state
    const [bots, setBots] = useState(initialBots); // List of bot personas
    const [currentBot, setCurrentBot] = useState(initialBots[0]);

    // Fetch an old chat based on the chat ID in the URL
    const getChat = useCallback((async (chatId, setMessages) => {
        try {
            const response = await axios.get(process.env.REACT_APP_GETCHAT, {
                withCredentials: true,
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
                if(chat.botId) { // custom bot
                    setCurrentBot({
                        botId: chat.botId._id,
                        botName: chat.botId.botName,
                        systemMessage: chat.botId.systemMessage,
                    });
                } else {
                    setCurrentBot(bots[0]); // default bot
                }
            }
        } catch (error) {
            console.log(error);
        }
    }), [bots]);

    // Get the list of chats for the sidebar
    const getChatList = useCallback((async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_GETCHATLIST, {
                withCredentials: true
            });
            if (response.data) {
                setChatList(response.data.groupedChats);
            }
        } catch (error) {
            console.log(error);
        };
    }), []);

    // Start a new chat when the user sends the first message
    const saveNewChat = async (userMessage, currentBotId) => {
        const newChatData = { userMessage, botId: currentBotId };

        try {
            const response = await axios.post(
                process.env.REACT_APP_NEWCHAT,
                { newChatData: newChatData },
                {
                    headers: {
                    "Content-Type": "application/json",
                    },
                    withCredentials: true,
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
            const response = await axios.get(process.env.REACT_APP_GETBOTS, {       
                withCredentials: true 
            });
            if(response.data.bots.length > 0) {
            const mappedBots = response.data.bots.map((bot) => ({
                botId: bot._id,
                botName: bot.botName,
                systemMessage: JSON.parse(bot.systemMessage),
            }));
            setBots([
                ...initialBots, // keep the default bot in the list
                ...mappedBots
            ]);
            }
        } catch (error) {
            console.log(error);
        }
    }), []);

    const getBot = useCallback((async (botToSearch) => {
        try {
            const response = await axios.get(process.env.REACT_APP_GETBOT, {       
                withCredentials: true,
                params: { botId: botToSearch },
            });
            if(response.data.bot) {
                const newBot = {
                    botId: response.data.bot._id,
                    botName: response.data.bot.botName,
                    systemMessage: JSON.parse(response.data.bot.systemMessage),
                };             
                setCurrentBot(newBot);
            }
        } catch (error) {
            console.log(error);
        }
    }), []);

    return { chatList, getChat, getChatList, saveNewChat, searchParams, setSearchParams, bots, getBots, getBot, currentBot, setCurrentBot }

};