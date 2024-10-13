import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

export default function App() {

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([{ role: "system", content: "Please respond to all questions in rhymes." }]);

  const handleQuery = (e) => {
    setQuery(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add the user's message to the messages array
    const newMessages = [
      ...messages, 
      { role: "user", content: query }
    ];
    setMessages(newMessages);
    setQuery(""); // Clear the query

    try {
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
    }

  }

  return (
    <div className="container">

      <div className="messages">
        {messages.length > 0 && messages
        .filter(message => message.role !== "system")
        .map((message, index) => (
          <div key={index} className="message">
            <span className="name">{message.role === "user" ? "You: " : "AI: "}</span>
            <span>{message.content}</span>
          </div>
        ))}
      </div>

      <form className="form">
        <div className="inputContainer">
          <input id="queryArea" name="queryArea" value={query} onChange={handleQuery} placeholder="Type a message" />
          <button type="submit" onClick={handleSubmit}>Send</button>
        </div>
      </form>

    </div>
  );
}