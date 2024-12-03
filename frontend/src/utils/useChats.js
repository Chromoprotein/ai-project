import { useState, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export function useChats() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [chatId, setChatId] = useState(searchParams.get("chatId"));
    const [chatList, setChatList] = useState({}); // Object where keys are chat category names and values are arrays of chats (that have a title and an id)

    // Fetch an old chat based on the chat ID in the URL
    const getChat = useCallback((async (chatId, setMessages, toggleBot, bots) => {
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
            if(chat.botId) {
                toggleBot(chat.botId._id);
            } else {
                toggleBot(bots[0].botId); // Default bot
            }

            }
        } catch (error) {
            console.log(error);
        }
    }), []);

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
                setChatId(chatId);
                return chatId;
            }
        } catch (error) {
            console.log(error);
        }

        return "";
    };

    return { chatId, setChatId, chatList, getChat, getChatList, saveNewChat, searchParams, setSearchParams }

};