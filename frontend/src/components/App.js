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

  // If there are images in the chat context, keep only their alt text, so that "content" is a simple string
  const prepareMessagesForServer = (messages) => {
    return messages.map((message) => ({
      role: message.role,
      content: message.content.image ? `[Image: ${message.content.alt}]` : message.content
    }));
  }

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

  // Function calling (tools)
  const handleToolCalls = async (toolCall) => {
      const { name, arguments: argsString } = toolCall.function;
      const args = JSON.parse(argsString);

      if (name === "toggle_dark_and_light_mode" && args.theme) {
        setTheme(args.theme);
        localStorage.setItem('theme', args.theme);
        return `The mode has been successfully updated to ${args.theme} mode`;

      } else if (name === "generate_image" && args.image_description) {
        try {
          const endpoint = process.env.REACT_APP_DALLE;
          setLoading(true);

          const image = await fetchAIResponse(args.image_description, endpoint);
          if(image.data) {
            addMessage("assistant", 
              { 
                image: true,
                url: image.data[0].url, 
                alt: image.data[0].revised_prompt
              }
            );
            return image.data[0].revised_prompt; // GPT gets the revised prompt back so it can go "Here is the image of..."
          }
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
          setLoading(false);
        }
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

    // If there are images in the chat context, keep only their alt text, so that "content" is just a string
    const formattedMessages = prepareMessagesForServer([...messages, { role: "user", content: query }]);

    try {
      setLoading(true);
      const endpoint = process.env.REACT_APP_AI;
      const { data } = await fetchAIResponse(formattedMessages, endpoint);

      // Add the AI's message to the messages array to be displayed
      if(data.content) {
        addMessage("assistant", data.content);
      }

      // If the AI wants to call a function
      if (data.tool_calls?.[0]) {
        // Run the tool function and return e.g. image data
        const toolResponse = await handleToolCalls(data.tool_calls[0]);
        if(toolResponse) {
          // Tell the AI the function was called and show the results to it
          const afterToolResponse = await fetchAIResponse([
            ...formattedMessages,
            data, // The AI's initial response that wanted to call a function
            { role: "tool", content: JSON.stringify(toolResponse), tool_call_id: data.tool_calls[0].id }, // Message containing the result of the function call
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


