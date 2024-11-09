import Markdown from 'react-markdown'
import { useState, useRef } from 'react';
import { FaRegCopy } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

export default function Message({message, messageIndex}) {

    const [copySuccess, setCopySuccess] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const parentDivRef = useRef(null);

    // Downloading an image
    const downloadImage = () => {
      const image = parentDivRef.current.querySelector('img');
      const link = document.createElement("a");
      link.href = image.src;
      link.target = "_blank";
      link.download = "generated_image.png";
      link.click();
    }

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    // Copying a message
    const copyToClipboard = (message) => {
      navigator.clipboard.writeText(message)
        .then(() => setCopySuccess(true))
        .catch((err) => setCopySuccess(false));
    };

    // Extract the text and (user-uploaded) image variables from the message content
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
      <div key={messageIndex} className="message" id={messageIndex} ref={parentDivRef}>
          {/*sender name*/}
          <span className="name">
            {message.role === "user" ? "You: " : "Mysterious traveller: "}
          </span>

          {/*render text and AI images with markdown. Images have a download button*/}
          {mapItems[0].text && 
            <Markdown
              components={{
                img: ({ node, ...props }) => (
                  <div className="imageContainer">
                    <img {...props} alt="AI generated" onLoad={handleImageLoad} />
                    {imageLoaded && <button className="downloadButton" onClick={downloadImage} >
                      <IoMdDownload size={30} />
                    </button>}
                  </div>
                ),
              }}
            >
              {mapItems[0].text}
            </Markdown>
          }

          {/*if the user uploaded an image, display it too*/}
          {mapItems[0].image && 
            <img
              src={mapItems[0].image}
              alt="User uploaded content"
            />
          }

          {/*if there is text, display a button for copying the text at the bottom of the message*/}
          {mapItems[0].text && 
            <CopyButton copyToClipboard={copyToClipboard} copySuccess={copySuccess} text={mapItems[0].text}/>}

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