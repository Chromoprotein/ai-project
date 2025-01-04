import React, { useState, useRef, useEffect } from "react";
import "../styles/index.css";
import "../styles/style.css";
import Background from "./Backgrounds";
import Message from "./Message";
import { Sidebar } from "./Sidebar";
import { useMode } from "../utils/useMode";
import { toggle_dark_and_light_mode } from "../utils/toolCalling";
import { useChats } from "../utils/useChats";
import { scrollToBottom } from "../utils/uiHelpers";
import axiosInstance from "../utils/axiosInstance";
import { Typing } from "./Loaders";
import { Hello } from "./SmallUIElements";
import { InputContainer } from "./InputContainer";
import { useLocation } from "react-router-dom";
import { processTraits } from "../utils/systemPromptMakers";
import { makeFullSystemPrompt } from "../utils/systemPromptMakers";
import sliderData from "../shared/botTraitData";

export default function App() {

  const { chatList, getChat, getChatList, saveNewChat, searchParams, bots, getBot, currentBot, setCurrentBot } = useChats();

  // Messaging-related state
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  // If navigating here from the bots list
  const location = useLocation();
  const customBotId = location.state?.botId; // From navigation state

  // UI-related state
  const messagesEndRef = useRef(null);
  const { theme, setTheme } = useMode();
  const [loading, setLoading] = useState(false);

  // User data -related state
  const [username, setUsername] = useState(sessionStorage.getItem("name") || "User");

  // 1. HELPER FUNCTIONS

  // Add messages to state
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Multimodal AI request
  const fetchAIResponse = async (payload, chatId) => {
    return await axiosInstance.post(
      process.env.REACT_APP_AI,
      { messages: payload, chatId: chatId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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

    // PREPARE THE PAYLOAD

    // Full chat context
    let allMessages;

    // The chat is new (no messages yet) and a bot is selected
    if (messages.length === 0 && currentBot) {
      // Add system prompt to new chat
      const processedTraits = processTraits(currentBot.traits, sliderData);
      const fullSystemPrompt = makeFullSystemPrompt(currentBot.botName, currentBot.instructions, processedTraits, currentBot.userInfo);
      allMessages = [fullSystemPrompt];
      addMessage(fullSystemPrompt);
    } else {
      allMessages = [...messages];
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
    allMessages = [...allMessages, newMessage];

    // CHAT ID AND CHAT TITLE

    let chatId;
    if(searchParams.get("chatId")) { // For an old chat, get the chat id from the search params
      chatId = searchParams.get("chatId");
    } else {
      // If there isn't a chat id, generate a new one. This query also generates a title for the new chat based on the user's first message
      const newChatId = await saveNewChat(newMessage, currentBot?.botId);

      if(newChatId) {
        chatId = newChatId;
        await getChatList(); // Update the chats list so it includes the new chat's title
      }
    }

    // Clear the inputs
    setQuery("");
    setFile(null);

    // AI RESPONSE

    if(chatId) {
      try {
        setLoading(true);
        const { data } = await fetchAIResponse(allMessages, chatId);

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

  // Fetching the chat by chat id (search parameter) when you navigate to a chat or a new chat's chatId is generated. By mongo populating, this query also gets the bot's info
  useEffect(() => {
    if (searchParams.get("chatId")) {
      getChat(searchParams.get("chatId"), setMessages);
    }
  }, [searchParams, getChat]);

  // Get the chat list on the first page load
  useEffect(() => {
    getChatList();
  }, [getChatList]);

  // Find bot's info when navigating from the bots list. This is needed to start a new chat
  useEffect(() => {
    if(messages.length === 0 && customBotId) {
      getBot(customBotId);
    }
  }, [customBotId, bots, getBot, setCurrentBot, messages.length])

  // 4. UI ELEMENTS

  const mappedMessages = (messages && messages.length > 1) && messages
    .filter((message) => message.role !== "system" || !message.content) // Filter system and empty content
    .map((message, index) => {
      let name;
      if(message.role === "user") {
        name = username;
      } else if(message.role === "assistant") {
        if(currentBot?.botName) {
          name = currentBot.botName;
        } else {
          name = "AI";
        }
      }
      return <Message key={index} message={message} index={index} name={name} />
  });

  return (
    <>
      <Background theme={theme} />

      <div className="container">
        <Sidebar 
          chatList={chatList}
          chatId={searchParams.get("chatId")}
        />

        <div className="mainContent">
          <div className="chatContainer">
            {mappedMessages.length > 0 ? (
              <>
                {mappedMessages}
                {loading && <Typing />}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <Hello bot={currentBot?.botName} />
            )}
          </div>

          <InputContainer
            handleSubmit={handleSubmit}
            query={query}
            handleQuery={handleQuery}
            handleFileChange={handleFileChange}
            preview={file}
            handleRemoveImage={handleRemoveImage}
          />
        </div>
      </div>
    </>
  );
};