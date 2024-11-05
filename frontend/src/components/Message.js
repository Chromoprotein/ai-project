import Markdown from 'react-markdown'

export default function Message({message, index}) {
    return (
      <div key={index} className="message">
        <span>
          <span className="name">{message.role === "user" ? "You: " : "Mysterious traveller: "}</span>
          <Markdown>{message.content}</Markdown>
        </span>
      </div> 
    );
}