import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import './style.css';
import { FaArrowAltCircleUp } from "react-icons/fa";

export default function App() {

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([{ role: "system", content: "Respond like you are an alien from the Andromeda galaxy. You have travelled far and seen many planets. You think humans are interesting. Tools: you can call a function to toggle the dark mode and light mode of the user interface." }]);

  const [loading, setLoading] = useState(false);

  const handleQuery = (e) => {
    setQuery(e.target.value);
  }

  // Helper function to handle API calls to the AI endpoint
  const fetchAIResponse = async (messagesPayload) => {
      return await axios.get(process.env.REACT_APP_AI, {
          withCredentials: true,
          params: { messages: messagesPayload }
      });
  };

  // Helper function to add messages to state
  const addMessage = (role, content) => {
      setMessages((prevMessages) => [...prevMessages, { role, content }]);
  };

  // Function to handle tool calls
  const handleToolCalls = (toolCall) => {
      const { name, arguments: argsString } = toolCall.function;
      const args = JSON.parse(argsString);

      if (name === "toggle_dark_and_light_mode" && args.theme) {
          toggle_dark_and_light_mode(args.theme);
          return `The mode has been successfully updated to ${args.theme} mode`;
      }

      return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add the user's message to the messages array
    const userMessage = { role: "user", content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery(""); // Clear the query

    try {
      setLoading(true);
      const initialResponse = await fetchAIResponse(newMessages);

      // Add the AI's message to the messages array to be displayed
      if(initialResponse.data.content) {
        addMessage("assistant", initialResponse.data.content);
      }

      // Possible tool calls
      if (initialResponse.data.tool_calls?.[0]) {
          // Get the function call parameters and run the correct function; this currently returns a "confirmation message"
          const toolResponseContent = handleToolCalls(initialResponse.data.tool_calls[0]);
          
          // Tell the AI the function was called
          const afterToolResponse = await fetchAIResponse([
            ...newMessages, // Previous messages in the chat
            initialResponse.data, // The AI's initial message seems to be necessary
            { role: "tool", content: toolResponseContent, tool_call_id: initialResponse.data.tool_calls[0].id }, // Message containing the result of the function call
          ]);

          // Add the AI's response to the displayed messages
          if (afterToolResponse.data.content) {
              addMessage("assistant", afterToolResponse.data.content);
          }
      }

    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }

  }

  const mappedMessages = messages.length > 0 && messages
  .filter(message => message.role !== "system")
  .map((message, index) => (
    <div key={index} className="message">
      <span className="name">{message.role === "user" ? "You: " : "Mysterious traveller: "}</span>
      <span>{message.content}</span>
    </div>
  ));

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]); // trigger scroll on every message update

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Toggle theme and save preference
  const toggle_dark_and_light_mode = (theme) => {
    setTheme(theme);
    localStorage.setItem('theme', theme);
  };

  // Apply theme to document body for global styles
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <>
      {theme === "dark" ? <StarBackground /> : <CloudBackground />}

      <div className="container">

        {mappedMessages.length > 0 ? 
          <div className="chatContainer">
            {mappedMessages}
            <Loading loading={loading}/>
            <div ref={messagesEndRef} />
          </div> 
          : 
          <Hello/>
        }

        <InputContainer handleSubmit={handleSubmit} query={query} handleQuery={handleQuery}/>

      </div>

    </>
  );
}

export function Hello() {
  return (
    <div className="centeredContainer">
      <p className="title">Welcome to the space jam. How can I help you?</p>
    </div>
  )
}

export function StarBackground() {
  return (
    <div className="star-layers">
      <div className="star-layer" id="stars"></div>
      <div className="star-layer" id="stars2"></div>
      <div className="star-layer" id="stars3"></div>
    </div>
  );
}

export function CloudBackground() {
  return (
    <div className="cloud-layers">
      <div className="cloud-layer" id="clouds-small"></div>
      <div className="cloud-layer" id="clouds-medium"></div>
      <div className="cloud-layer" id="clouds-large"></div>
    </div>
  );
}

export function InputContainer({handleSubmit, query, handleQuery}) {
  return (
    <form className="inputContainer" onSubmit={handleSubmit}>
      <textarea id="queryArea" name="queryArea" value={query} onChange={handleQuery} placeholder="Type a message"></textarea>
      <button type="submit"><FaArrowAltCircleUp /></button>
  </form>
  );
}

export function Loading({loading}) {
  return (
    <span>
      {loading && <p className="loading">Mysterious traveller is typing...</p>}
    </span>
  );
}

export function Navbar({toggleTheme, theme}) {
  return (
    <div className="navbar">
      <button onClick={toggleTheme}>
        Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </div>
  );
}