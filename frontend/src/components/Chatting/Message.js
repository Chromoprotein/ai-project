import Markdown from "react-markdown";
import { useState, useRef } from "react";
import { FaRegCopy } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import axios from "axios";
import { AiFillSound } from "react-icons/ai";
import { IoClose } from "react-icons/io5";

export default function Message({ message, messageIndex, name, imageSrc }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const parentDivRef = useRef(null);

  // Downloading an image
  const downloadImage = () => {
    const image = parentDivRef.current.querySelector("img");
    const link = document.createElement("a");
    link.href = image.src;
    link.target = "_blank";
    link.download = "generated_image.png";
    link.click();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Copying a message
  const copyToClipboard = (message) => {
    navigator.clipboard
      .writeText(message)
      .then(() => setCopySuccess(true))
      .catch((err) => setCopySuccess(false));
  };

  // Extract the text and (user-uploaded) image variables from the message content
  const messageContent = message.content;

  const text = messageContent[0]?.text;
  const image =
    messageContent.length > 1 ? messageContent[1].image_url.url : null;

  const generateAudio = async (text) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_SPEECH,
        { text: text },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="avatarWrapper">
      <img src={imageSrc} alt="Avatar" className="tinyBotImage" />
      <div
        key={messageIndex}
        className="message"
        id={messageIndex}
        ref={parentDivRef}
      >
        {/*sender name*/}
        <span className="name">
          {name}:&nbsp;
        </span>

        {/*render text and AI images with markdown. Images have a download button*/}
        {text && (
          <Markdown
            components={{
              img: ({ node, ...props }) => (
                <div className="imageContainer">
                  <img {...props} className="image" alt="AI generated" onLoad={handleImageLoad} />
                  {imageLoaded && (
                    <button className="downloadButton" onClick={downloadImage}>
                      <IoMdDownload size={30} />
                    </button>
                  )}
                </div>
              ),
            }}
          >
            {text}
          </Markdown>
        )}

        {/*if the user uploaded an image, display it too*/}
        {image && 
          <div className="imageContainer">
            <img src={image} className="image" alt="User uploaded content" />
          </div>
        }

        {/*if there is text, display a button for copying the text at the bottom of the message*/}
        {text && (
          <div className="smallButtonContainer">
            <CopyButton
              copyToClipboard={copyToClipboard}
              copySuccess={copySuccess}
              text={text}
            />

            <button className="smallButton" onClick={() => generateAudio(text)}>
              <AiFillSound />
            </button>
          </div>
        )}

        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} setAudioUrl={setAudioUrl} />
        )}
      </div>
    </div>
  );
}

export function AudioPlayer({ audioUrl, setAudioUrl }) {
  return (
    <div className="audioPlayer">
      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          autoPlay
          onEnded={() => {
            URL.revokeObjectURL(audioUrl); // Release memory
            setAudioUrl(null); // Close the player
          }}
        >
          Your browser does not support the audio element.
        </audio>
      )}
      <button
        className="smallButton"
        onClick={() => {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }}
      >
        <IoClose size={30} />
      </button>
    </div>
  );
}

export function CopyButton({ copyToClipboard, copySuccess, text }) {
  return (
    <button className="smallButton" onClick={() => copyToClipboard(text)}>
      {copySuccess ? <FaRegCheckCircle /> : <FaRegCopy />}
    </button>
  );
}
