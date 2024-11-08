import Markdown from 'react-markdown'

export default function Message({message, index}) {
    return (
      <div key={index} className="message">
          <span className="name">{message.role === "user" ? "You: " : "Mysterious traveller: "}</span>

          {Array.isArray(message.content) ? (
            // Handle array content
            message.content.map((item, idx) => (
              <span key={idx}>
                {item.type === "text" ? (
                  <Markdown>{item.text}</Markdown>
                ) : item.type === "image_url" && item.image_url ? (
                  <img
                    src={item.image_url.url}
                    alt="User uploaded content"
                  />
                ) : null}
              </span>
            ))
          ) : (
            // Handle single content (string)
            <Markdown>{message.content}</Markdown>
          )}

      </div> 
    );
}