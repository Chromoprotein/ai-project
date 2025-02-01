import React, { useState, useRef, useEffect } from "react";
import "../../styles/index.css";
import "../../styles/style.css";
import Background from "../Reusables/Backgrounds";
import Message from "./Message";
import { Sidebar } from "./Sidebar";
import { useMode } from "../../utils/useMode";
import { toggle_dark_and_light_mode } from "../../utils/toolCalling";
import { useChats } from "../../utils/useChats";
import { scrollToBottom } from "../../utils/uiHelpers";
import axiosInstance from "../../utils/axiosInstance";
import { Typing } from "../Reusables/Loaders";
import { Hello } from "../Reusables/SmallUIElements";
import { InputContainer } from "./InputContainer";
import { processTraits, processSharedData } from "../../utils/systemPromptMakers";
import { makeFullSystemPrompt } from "../../utils/systemPromptMakers";
import sliderData from "../../shared/botTraitData";

export default function App() {

  const { chatList, getChat, getChatList, saveNewChat, searchParams, setSearchParams, getLastBot, currentBot, setCurrentBot, loadingBot, setLoadingBot, loadingChatList } = useChats();

  // Messaging-related state
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  // UI-related state
  const messagesEndRef = useRef(null);
  const { theme, setTheme } = useMode();
  const [botTyping, setBotTyping] = useState(false);

  // User data -related state
  const [username, setUsername] = useState(sessionStorage.getItem("name") || "User");

  // 1. HELPER FUNCTIONS

  const resetAll = () => {
    setSearchParams({});
    setQuery("");
    setMessages([]);
    setFile(null);
    setCurrentBot({});
    setLoadingBot(true);
  }

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
      const processedSharedData = processSharedData(currentBot.sharedData);
      const fullSystemPrompt = makeFullSystemPrompt(currentBot.botName, currentBot.instructions, processedTraits, currentBot.userInfo, processedSharedData);
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
        setBotTyping(true);
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
        setBotTyping(false);
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

  // Find the last used bot's info, needed to start a new chat
  useEffect(() => {
    const activeBot = async () => {
      if(!searchParams.get("chatId")) { // if the chat hasn't started yet
        await getLastBot(); // check what bot was last used
      };
    };
    activeBot();
  }, [getLastBot, searchParams]);

  // 4. UI ELEMENTS

  const mappedMessages = (messages && messages.length > 1) && messages
    .filter((message) => message.role !== "system" || !message.content) // Filter system and empty content
    .map((message, index) => {
      let name;
      let imageSrc = "/placeholderAvatar.webp";
      if(message.role === "user") {
        name = username;
        // Users will get avatars when I've added user profiles
      } else if(message.role === "assistant") {
        imageSrc = `data:image/webp;base64,${currentBot?.avatar}`;
        if(currentBot?.botName) {
          name = currentBot.botName;
        } else {
          name = "AI";
        }
      }
      return <Message key={index} message={message} index={index} name={name} imageSrc={imageSrc} />
  });

  return (
    <>
      <Background theme={theme} />

      <div className="container">
        <Sidebar 
          chatList={chatList}
          chatId={searchParams.get("chatId")}
          loadingChatList={loadingChatList}
          resetAll={resetAll}
        />

        <div className="mainContent">
          <div className="scrollContainer">
            {mappedMessages.length > 0 ? (
              <>
                {mappedMessages}
                {botTyping && <Typing />}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <Hello bot={currentBot?.botName} avatar={currentBot?.avatar ? `data:image/webp;base64,${currentBot?.avatar}` : "/placeholderAvatar.webp"} loadingBot={loadingBot} />
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