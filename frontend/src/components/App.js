import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/index.css";
import "../styles/style.css";
import { MainContent } from "./MainContent";
import Background from "./Backgrounds";
import Message from "./Message";
import { Sidebar } from "./Sidebar";
import { useMode } from "../utils/useMode";
import Bots from "./Bots";
import { useBots } from "../utils/useBots";
import { toggle_dark_and_light_mode } from "../utils/toolCalling";
import { useChats } from "../utils/useChats";
import { scrollToBottom } from "../utils/uiHelpers";

export default function App() {

  // Bot persona -related state
  const { bots, currentBotId, isSubmit, setIsSubmit, toggleBot, getBots, showBotList, setShowBotList } = useBots();

  // Messaging-related state
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([bots.find((bot) => bot.botId === currentBotId)?.systemMessage || bots[0]?.systemMessage]);
  const [file, setFile] = useState(null);

  console.log(messages)

  // UI-related state
  const messagesEndRef = useRef(null);
  const { theme, setTheme } = useMode();
  const [loading, setLoading] = useState(false);

  // Chat thread-related state from hook
  const { chatId, setChatId, chatList, getChat, getChatList, saveNewChat, searchParams, setSearchParams } = useChats();

  // User data -related state
  const [username, setUsername] = useState(sessionStorage.getItem("name") || "User");

  // 1. HELPER FUNCTIONS

  // Add messages to state
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Multimodal AI request
  const fetchAIResponse = async (payload, chatId) => {
    return await axios.post(
      process.env.REACT_APP_AI,
      { messages: payload, chatId: chatId },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  };

  // Clear the screen out of the way of a new chat
  const clearScreen = () => {
    setChatId();
    setSearchParams();
    setMessages([]);
  }

  // 2. MAIN FUNCTIONALITY

  // User prompt
  const handleQuery = (e) => setQuery(e.target.value);

  // Image prompt
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFile(reader.result); // base64 encoded image
    };
  };

  const handleRemoveImage = () => {
    setFile(null);
  };

  // Submit a prompt
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct the user's new message
    let newContent = [];
    if (file) {
      // Message contains a file
      newContent = [
        {
          type: "text",
          text: query,
        },
        {
          type: "image_url",
          image_url: {
            url: file,
          },
        },
      ];
    } else {
      // Message only contains text
      newContent = [
        {
          type: "text",
          text: query,
        },
      ];
    }
    const newMessage = { role: "user", content: newContent };

    addMessage(newMessage); // Add the user's new message to the state for displaying

    // Full chat context
    const allMessages = [
      ...messages, 
      newMessage
    ];

    // Start a new chat thread if you're not currently in a thread. Starting a new chat also generates a title for it based on the user message
    const chatIdForSaving = chatId ? chatId : await saveNewChat(newMessage, currentBotId);

    // Clear the inputs
    setQuery("");
    setFile(null);

    if(chatIdForSaving) {
      try {
        setLoading(true);
        const { data } = await fetchAIResponse(allMessages, chatIdForSaving);

        // Add the AI's message to the messages array to be displayed
        if (data.AIMessage) {
          addMessage(data.AIMessage);
        }

        // Handle function calls that work in the front-end
        if (data.toolParameters) {
          if (data.toolParameters.functionName === "toggle_dark_and_light_mode") {
            toggle_dark_and_light_mode(data.toolParameters.functionArguments, setTheme);
          }
          // More tools can be added here
        }
      } catch (error) {
        console.error("Error fetching response:", error);
      } finally {
        setLoading(false);
      }
    }

  };

  // 3. EFFECTS

  // Automatic scrolling for new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(messagesEndRef);
    }
  }, [messages]);

  // Fetching the chat by chat id and fetch the chats list
  useEffect(() => {
    if (chatId) {
      getChat(chatId, setMessages, toggleBot, bots);
    }
    getChatList();
  }, [bots, chatId, getChat, getChatList, toggleBot]);

  // Navigation to chats
  useEffect(() => {
    setChatId(searchParams.get("chatId"));
  }, [searchParams, setChatId]);

  // Get the available bots
  useEffect (() => {
    getBots();
  }, [isSubmit, getBots])

  // Find the current bot's system prompt and add it to the chat context
  useEffect(() => {
    if(messages.length < 2) { // Make sure it can only overwrite a system prompt
      const systemMessage = bots.find((bot) => bot.botId === currentBotId)?.systemMessage || bots[0]?.systemMessage;
      if (systemMessage) {
        setMessages([systemMessage]);
      }
    }
  }, [bots, currentBotId, messages.length]);

  // 4. UI ELEMENTS

  const foundBot = bots.find((bot) => bot.botId === currentBotId);
  const currentBotName = (foundBot ? foundBot.botName : bots[0]?.botName);
  console.log(currentBotName)
  const mappedMessages = (messages && messages.length > 1) && messages
    .filter((message) => message.role !== "system" || !message.content) // Filter system and empty content
    .map((message, index) => {
      let name;
      if(message.role === "user") {
        name = username;
      } else if(message.role === "assistant") {
        name = currentBotName;
      }
      return <Message message={message} index={index} name={name} />
  });

  return (
    <>
      <Background theme={theme} />

      <div className="container">
        <Sidebar 
          chatList={chatList}
          showBotList={showBotList}
          setShowBotList={setShowBotList}
        />

        <div className="mainContent">
          <div className="chatContainer">
            {showBotList ? 
              <Bots bots={bots} toggleBot={toggleBot} clearScreen={clearScreen} setIsSubmit={setIsSubmit} /> :
              <MainContent mappedMessages={mappedMessages} loading={loading} messagesEndRef={messagesEndRef} handleSubmit={handleSubmit} query={query} handleQuery={handleQuery} handleFileChange={handleFileChange} file={file} handleRemoveImage={handleRemoveImage} bot={currentBotName} />
            }
          </div>
        </div>
      </div>
    </>
  );
};