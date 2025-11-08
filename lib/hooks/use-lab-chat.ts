import { useState } from "react";

export function useLabChat() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  return {
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
  };
}
