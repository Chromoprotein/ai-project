import { Typing } from "./Loaders";
import { Hello } from "./SmallUIElements";
import { InputContainer } from "./InputContainer";

export function MainContent({mappedMessages, loading, messagesEndRef, handleSubmit, query, handleQuery, handleFileChange, file, handleRemoveImage, bot}) {
  return (
    <>
      <div className="chatContainer">
        {mappedMessages.length > 0 ? (
          <>
            {mappedMessages}
            {loading && <Typing />}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <Hello bot={bot} />
        )}
      </div>

      <InputContainer
        handleSubmit={handleSubmit}
        query={query}
        handleQuery={handleQuery}
        handleFileChange={handleFileChange}
        preview={file}
        handleRemoveImage={handleRemoveImage}
      />
    </>
  );
}