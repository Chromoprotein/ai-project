import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/index.css';
import '../styles/style.css';
import { InputContainer } from './InputContainer';
import { StarBackground, CloudBackground } from './Backgrounds';
import { Typing } from './Loaders';
import { Hello } from './SmallUIElements';
import Message from './Message';
import { GoSidebarExpand } from "react-icons/go";
import { GoSidebarCollapse } from "react-icons/go";
import { useSearchParams } from "react-router-dom";

export default function App() {

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { 
      role: "system", 
      content: [
        { type: "text", text: "Respond like you are an alien from the Andromeda galaxy. You have travelled far and seen many planets. You think humans are interesting." }
      ] 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [file, setFile] = useState(null);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatId, setChatId] = useState(searchParams.get("chatId"));

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
    console.log("and here")
    console.log(theme)
    localStorage.setItem('theme', theme);
    return `The mode has been successfully updated to ${theme} mode`;
  }

  // Multimodal AI request
  const fetchAIResponse = async (payload, chatId) => {
    return await axios.post(process.env.REACT_APP_AI, { messages: payload, chatId: chatId }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  }

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  // Fetch an old chat based on the chat ID in the URL
  const getChat = async (chatId) => {
    try {
      const response = await axios.get(process.env.REACT_APP_GETCHAT, {
          withCredentials: true,
          params: { chatId: chatId }
      });
      if(response.data) {
        const mappedMessages = response.data.chat.messages.map((message) => (JSON.parse(message.content)));
        if(mappedMessages.length > 0) {
          setMessages(mappedMessages);
          console.log(mappedMessages)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Start a new chat when the user sends the first message
  const saveNewChat = async () => {

    const title = "New chat";
    const category = "Miscellaneous";

    const newChatData = { title, category }

    try {
      const response = await axios.post(process.env.REACT_APP_NEWCHAT, { newChatData: newChatData }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      if(response.data) {
        console.log(response.data);
        const chatId = response.data.id;
        setSearchParams({ "chatId": chatId });
        setChatId(chatId);
        return chatId;
      }
    } catch (error) {
      console.log(error);
    }

    return "";
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

    // Start a new chat thread if you're not currently in a thread (if the chat id state is empty)
    const chatIdForSaving = chatId ? chatId : await saveNewChat();

    // Construct the user's new message
    let newContent = [];
    if(file) {
      // Message contains a file
      newContent = [
          {
            type: "text", 
            text: query
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
          text: query 
        }
      ]
    }
    const newMessage = { role: "user", content: newContent };

    addMessage(newMessage) // Add the user's new message to the state for displaying

    // Full chat context
    const allMessages = [...messages, newMessage];
    
    // Clear the inputs
    setQuery("");
    setFile(null);

    try {
      setLoading(true);
      const { data } = await fetchAIResponse(allMessages, chatIdForSaving);

      // Add the AI's message to the messages array to be displayed
      console.log(data)
      if(data.AIMessage) {
        addMessage(data.AIMessage);
      }

      // Handle function calls that work in the front-end
      if(data.toolParameters) {
        if(data.toolParameters.functionName === "toggle_dark_and_light_mode") {
          toggle_dark_and_light_mode(data.toolParameters.functionArguments);
        }
      }

    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }

  }

  // 3. EFFECTS

  // Automatic scrolling for new messages
  useEffect(() => {
    if(messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Toggling light and dark mode
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Fetching the chat by chat id
  useEffect(() => {
    if(chatId) {
      getChat(chatId);
    }
  }, [chatId])
  
  // 4. UI ELEMENTS

  const mappedMessages = messages
    .filter(message => message.role !== "system" || !message.content) // Filter system and empty content
    .map((message, index) => <Message message={message} index={index} />);

  return (
    <>
      {theme === "dark" ? <StarBackground /> : <CloudBackground />}

      <button className="navbarControl roundButton" onClick={toggleNavbar}>
        {isNavbarCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
      </button>

      <div className="container">
        <div className={`navbar ${isNavbarCollapsed ? "collapsed" : "active"}`}>
          <ul>
            <li>Placeholder</li>
            <li>Placeholder</li>
            <li>Placeholder</li>
            <li>Some very long chat name</li>
          </ul>
        </div>
        <div className="mainContent">
          <div className="chatContainer">
            {mappedMessages.length > 0 ? 
              <>
                {mappedMessages}
                {loading && <Typing />}
                <div ref={messagesEndRef} />
              </>
            : 
              <Hello/>
            }
          </div>
          <InputContainer handleSubmit={handleSubmit} query={query} handleQuery={handleQuery} handleFileChange={handleFileChange} preview={file} handleRemoveImage={handleRemoveImage} />
        </div>

      </div>

    </>
  );
}


