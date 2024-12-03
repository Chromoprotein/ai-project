// Scroll automatically when new messages appear
export const scrollToBottom = (messagesEndRef) => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};