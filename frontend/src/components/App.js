import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/index.css";
import "../styles/style.css";
import { InputContainer } from "./InputContainer";
import Background from "./Backgrounds";
import { Typing } from "./Loaders";
import { Hello } from "./SmallUIElements";
import Message from "./Message";
import { GoSidebarExpand } from "react-icons/go";
import { GoSidebarCollapse } from "react-icons/go";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useMode } from "../utils/useMode";
import { GoPlus } from "react-icons/go";
import Bots from "./Bots";

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

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { theme, setTheme } = useMode();
  const [file, setFile] = useState(null);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatId, setChatId] = useState(searchParams.get("chatId"));
  const [chatList, setChatList] = useState({}); // Object where keys are chat category names and values are arrays of chats (that have a title and an id)
  const [collapsedCategory, setCollapsedCategory] = useState({}); // Chat categories that are collapsed. Key is the category's name and value is boolean
  const [bots, setBots] = useState(initialBots); // List of bot personas
  const [currentBotId, setCurrentBotId] = useState(JSON.parse(localStorage.getItem("currentBotId")) || bots[0].botId);
  const [showBotList, setShowBotList] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [username, setUsername] = useState(sessionStorage.getItem("name") || "User");

  // 1. HELPER FUNCTIONS

  // Add messages to state
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Scroll automatically when new messages appear
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle light and dark mode
  const toggle_dark_and_light_mode = (theme) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
    return `The mode has been successfully updated to ${theme} mode`;
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

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  // Set a bot as the current bot
  const toggleBot = useCallback(((botId) => {
    setCurrentBotId(botId);
    localStorage.setItem("currentBotId", JSON.stringify(botId));
    setShowBotList(false); // Close the bot list
  }), []);

  // Clear the screen out of the way of a new chat
  const clearScreen = () => {
    setChatId();
    setSearchParams();
    setMessages([]);
  }

  const switchBots = (botId) => {
    clearScreen();
    toggleBot(botId);
  }

  // Fetch an old chat based on the chat ID in the URL
  const getChat = useCallback((async (chatId) => {
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
  }), [bots, toggleBot]);

  const getChatList = async () => {
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
  }

  // Collapse a chat category
  const toggleCategory = (category) => {
      setCollapsedCategory((prev) => ({
          ...prev,
          [category]: !prev[category],
      }));
  };
  
  // Get the list of bot personas / system prompts
  const getBots = async () => {
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
  };

  // Start a new chat when the user sends the first message
  const saveNewChat = async (userMessage) => {

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

    // If you're in a new chat thread, append the system prompt of the correct bot
    let systemMessage;
    if(messages.length < 1) {
      systemMessage = bots.find((bot) => bot.botId === currentBotId).systemMessage || bots[0].systemMessage;
      addMessage(systemMessage);
    }

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
      systemMessage && systemMessage, // In a new chat thread, the system message was found above. Add it to the chat context
      ...messages, 
      newMessage
    ];

    // Start a new chat thread if you're not currently in a thread. Starting a new chat also generates a title for it based on the user message
    const chatIdForSaving = chatId ? chatId : await saveNewChat(newMessage);

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
            toggle_dark_and_light_mode(data.toolParameters.functionArguments);
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
      scrollToBottom();
    }
  }, [messages]);

  // Fetching the chat by chat id and fetch the chats list
  useEffect(() => {
    if (chatId) {
      getChat(chatId);
    }
    getChatList();
  }, [chatId, getChat]);

  // Navigation to chats
  useEffect(() => {
    setChatId(searchParams.get("chatId"));
  }, [searchParams]);

  // Get the available bots
  useEffect (() => {
    getBots();
  }, [isSubmit])

  // 4. UI ELEMENTS

  const foundBot = bots.find((bot) => bot.botId === currentBotId);
  const currentBotName = (foundBot ? foundBot.botName : bots[0]?.botName);

  const mappedMessages = (messages && messages.length > 1) && messages
    .filter((message) => message.role !== "system" || !message.content) // Filter system and empty content
    .map((message, index) => {
      let name;
      if(message.role === "user") {
        name = username;
      } else if(message.role === "assistant") {
        const botName = bots.find((bot) => bot.botId === currentBotId).botName || bots[0].botName;
        name = botName;
      }
      return <Message message={message} index={index} name={name} />
  });

  return (
    <>
      <Background theme={theme} />

      <div className="navbarControl">
        <div className="smallButtonContainer">
          <button className="roundButton" onClick={toggleNavbar}>
            {isNavbarCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
          </button>

          <button className="roundButton" onClick={() => setShowBotList(!showBotList)}>
            <GoPlus />
          </button>
        </div>
      </div>

      <div className="container">
        <Sidebar 
          chatList={chatList} 
          collapsedCategory={collapsedCategory} 
          toggleCategory={toggleCategory} 
          isNavbarCollapsed={isNavbarCollapsed} 
        />

        <div className="mainContent">
          <div className="chatContainer">
            {showBotList ? 
              <Bots bots={bots} toggleBot={switchBots} setIsSubmit={setIsSubmit} /> :
              <MainContent mappedMessages={mappedMessages} loading={loading} messagesEndRef={messagesEndRef} handleSubmit={handleSubmit} query={query} handleQuery={handleQuery} handleFileChange={handleFileChange} file={file} handleRemoveImage={handleRemoveImage} bot={currentBotName} />
            }
          </div>
        </div>
      </div>
    </>
  );
}

function MainContent({mappedMessages, loading, messagesEndRef, handleSubmit, query, handleQuery, handleFileChange, file, handleRemoveImage, bot}) {
  return (
    <>
      {mappedMessages.length > 0 ? (
        <>
          {mappedMessages}
          {loading && <Typing />}
          <div ref={messagesEndRef} />
        </>
      ) : (
        <Hello bot={bot} />
      )}

      <InputContainer
        handleSubmit={handleSubmit}
        query={query}
        handleQuery={handleQuery}
        handleFileChange={handleFileChange}
        preview={file}
        handleRemoveImage={handleRemoveImage}
      />
    </>
  );
}