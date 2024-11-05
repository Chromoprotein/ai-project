import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/index.css';
import '../styles/style.css';
import { InputContainer } from './InputContainer';
import { StarBackground, CloudBackground } from './Backgrounds';
import { Loading } from './Loaders';
import { Hello } from './SmallUIElements';
import Message from './Message';

export default function App() {

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([{ role: "system", content: "Respond like you are an alien from the Andromeda galaxy. You have travelled far and seen many planets. You think humans are interesting. Tools: 1. You can use Dall-e to generate images. 2. You can call a function to toggle the dark mode and light mode of the user interface." }]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 1. HELPER FUNCTIONS

  // Add messages to state
  const addMessage = (role, content) => {
      setMessages((prevMessages) => [...prevMessages, { role, content }]);
  };

  // Scroll automatically when new messages appear
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle API calls to the AI endpoint
  const fetchAIResponse = async (payload, endpoint) => {
    return await axios.get(endpoint, {
        withCredentials: true,
        params: { prompt: payload }
    });
  };

  // Toggle light and dark mode
  const toggle_dark_and_light_mode = (theme) => {
    setTheme(theme);
    localStorage.setItem('theme', theme);
    return `The mode has been successfully updated to ${theme} mode`;
  }

  // Image generation logic
  const generateImage = async (imageDescription, endpoint) => {
    const image = await fetchAIResponse(imageDescription, endpoint);
    if (image.data) {
      return image.data[0];
    }
    return "";
  };

  // Function calling (tools)
  const handleToolCalls = async (toolCall) => {
      const { name, arguments: argsString } = toolCall.function;
      const args = JSON.parse(argsString);

      if (name === "toggle_dark_and_light_mode" && args.theme) {
        return toggle_dark_and_light_mode(args.theme);

      } else if (name === "generate_image" && args.image_description) {
        const endpoint = process.env.REACT_APP_DALLE;
        return await generateImage(args.image_description, endpoint);
      }

      return "";
  };

  // 2. MAIN FUNCTIONALITY

  // User prompt
  const handleQuery = (e) => setQuery(e.target.value);

  // Submit a prompt
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add the user's new message to the messages array
    addMessage("user", query);
    setQuery("");
    const allMessages = [...messages, { role: "user", content: query }];

    try {
      setLoading(true);
      const endpoint = process.env.REACT_APP_AI;
      const { data } = await fetchAIResponse(allMessages, endpoint);

      // Add the AI's message to the messages array to be displayed
      if(data.content) {
        addMessage("assistant", data.content);
      }

      // If the AI wants to call a function
      if (data.tool_calls?.[0]) { // Function call parameters etc.
        const toolResponse = await handleToolCalls(data.tool_calls[0]); // Run the tool function and return e.g. image data or a confirmation of an action
        if(toolResponse) {
          // Pass the function call's response back to the AI so it can show and explain the results to the user
          const afterToolResponse = await fetchAIResponse([
            ...allMessages, // Previous context
            data, // The AI's initial response with function call parameters
            { role: "tool", content: JSON.stringify(toolResponse), tool_call_id: data.tool_calls[0].id }, // Message containing the tool's response
          ], endpoint);

          // Add the AI's response to the displayed messages
          if (afterToolResponse.data.content) {
              addMessage("assistant", afterToolResponse.data.content);
          }
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

  // 4. UI ELEMENTS

  const mappedMessages = messages
    .filter(message => message.role !== "system")
    .map((message, index) => <Message message={message} index={index} />);

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


