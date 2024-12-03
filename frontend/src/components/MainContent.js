import { Typing } from "./Loaders";
import { Hello } from "./SmallUIElements";
import { InputContainer } from "./InputContainer";

export function MainContent({mappedMessages, loading, messagesEndRef, handleSubmit, query, handleQuery, handleFileChange, file, handleRemoveImage, bot}) {
  return (
    <>
      {mappedMessages.length > 0 ? (
        <div className="tall">
          {mappedMessages}
          {loading && <Typing />}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <Hello bot={bot} />
      )}

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