import Markdown from 'react-markdown'
import { useState } from 'react';
import { FaRegCopy } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";

export default function Message({message, index}) {

    const [copySuccess, setCopySuccess] = useState('');

    // Copying a message
    const copyToClipboard = (message) => {
      navigator.clipboard.writeText(message)
        .then(() => setCopySuccess('Copied!'))
        .catch((err) => setCopySuccess('Failed to copy'));
    };

    const mapItems = message.content.map((item) => {
      let text = null;
      let image = null;
      if(item.type === "text") {
        text = item.text;
      } else if(item.type === "image_url") {
        image = item.image_url.url;
      }
      return { text, image }
    });

    return (
      <div key={index} className="message">
          <span className="name">
            {message.role === "user" ? "You: " : "Mysterious traveller: "}
          </span>

          {mapItems[0].text && <Markdown>{mapItems[0].text}</Markdown>}

          {mapItems[0].image && 
            <img
              src={mapItems[0].image}
              alt="User uploaded content"
            />
          }

          {mapItems[0].text && 
            <CopyButton copyToClipboard={copyToClipboard} copySuccess={copySuccess} text={mapItems[0].text}
          />}

      </div> 
    );
}

export function CopyButton({copyToClipboard, copySuccess, text}) {
  return (
    <button 
      className="smallButton" 
      onClick={() => copyToClipboard(text)}
    >
      {copySuccess ? <FaRegCheckCircle /> : <FaRegCopy />}
    </button>
  );
}