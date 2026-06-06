import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substring(7));

  return (
    <ChatContext.Provider value={{ messages, setMessages, sessionId }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
