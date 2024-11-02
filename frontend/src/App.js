import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import './style.css';
import { FaArrowAltCircleUp } from "react-icons/fa";

export default function App() {

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([{ role: "system", content: "Respond like you are an alien from the Andromeda galaxy. You have travelled far and seen many planets. You think humans are interesting." }]);

  const [loading, setLoading] = useState(false);

  const handleQuery = (e) => {
    setQuery(e.target.value);
  }

  const handleSubmit = async (e) => {

    // Add the user's message to the messages array
    const newMessages = [
      ...messages, 
      { role: "user", content: query }
    ];
    setMessages(newMessages);
    setQuery(""); // Clear the query

    try {
      e.preventDefault();
      setLoading(true);
      const res = await axios.get(process.env.REACT_APP_AI, 
        { 
          withCredentials: true,
          params: { messages: [
            ...messages, 
            { role: "user", content: query } // This is up to date
          ] } 
        }
      );

      // Add the AI's message to the messages array
      setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: res.data },
      ]);
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

  return (
    <>
      <div class="star-layers">
        <div class="star-layer" id="stars"></div>
        <div class="star-layer" id="stars2"></div>
        <div class="star-layer" id="stars3"></div>
      </div>

      <div className="container">

        {mappedMessages.length > 0 ? 
        <div className="chatContainer">
          {mappedMessages}
          {loading && <p className="loading">Mysterious traveller is typing...</p>}
        </div> : 
        <Hello/>}

        <form className="inputContainer" onSubmit={handleSubmit}>
            <textarea id="queryArea" name="queryArea" value={query} onChange={handleQuery} placeholder="Type a message"></textarea>
            <button type="submit"><FaArrowAltCircleUp /></button>
        </form>

      </div>
    </>
  );
}

export function Hello() {
  return (
    <div className="centeredContainer">
      <p className="title">Welcome to the space jam. Type something.</p>
    </div>
  )
}