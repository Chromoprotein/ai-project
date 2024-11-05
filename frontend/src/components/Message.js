export default function Message({message, index}) {
    return (
      <div key={index} className="message">
        {message.content.image ? 
          <img src={message.content.url} alt={message.content.alt} className="genImage" /> :
          <span>
            <span className="name">{message.role === "user" ? "You: " : "Mysterious traveller: "}</span>
            <span>{message.content}</span>
          </span>
        }
      </div> 
    );
}