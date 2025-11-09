import { useState, useRef, useEffect } from "react";
import { useChatStore, type ChatMessage } from "@/lib/chat-store";

export function useSideChat(labUID: string, isOpen: boolean, experimentDetails: {
  name: string;
  description: string;
  currentState: any;
  variables: Record<string, any>;
}) {
  const {
    getMessagesForLab,
    addMessageToLab,
    clearMessagesForLab,
    initializeLabChat,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = getMessagesForLab(labUID);

  // Initialize lab chat when component mounts
  useEffect(() => {
    initializeLabChat(labUID);
  }, [labUID, initializeLabChat]);

  // Mark as hydrated after first render
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClearChat = () => {
    setShowClearDialog(true);
  };

  const confirmClearChat = () => {
    clearMessagesForLab(labUID);
    setStreamingMessage("");
    setShowClearDialog(false);
  };

  const cancelClearChat = () => {
    setShowClearDialog(false);
  };

  const handleNewChat = () => {
    handleClearChat();
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message to store
    const userMessage: ChatMessage = { role: "user", content: newMessage};
    addMessageToLab(labUID, userMessage);

    // Start streaming
    setStreamingMessage("");

    try {
      const experimentInfo = {
        role: "system",
        content: `Name: ${experimentDetails.name}\nDescription: ${experimentDetails.description}\nCurrent State: ${JSON.stringify(experimentDetails.currentState)}\nVariables: ${JSON.stringify(experimentDetails.variables)}`,
      };
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [experimentInfo, ...messages],
          newMessage: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let extractedAnswer = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          // Extract and display only the "answer" field content from JSON
          const answerMatch = fullResponse.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (answerMatch) {
            // Unescape JSON string (handle \n, \", etc.) and convert to markdown-friendly format
            const rawAnswer = answerMatch[1];
            extractedAnswer = rawAnswer
              .replace(/\\n/g, "\n\n") // Convert \n to double newline for markdown paragraphs
              .replace(/\\r/g, "")
              .replace(/\\t/g, "\t")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\");
            
            setStreamingMessage(extractedAnswer);
          }
        }
      }

      // Save the raw JSON response to store (for future processing/analytics)
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: fullResponse, // store the complete JSON response
      };
      addMessageToLab(labUID, assistantMsg);
      setStreamingMessage("");
    } catch (error) {
      console.error("Error:", error);
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      addMessageToLab(labUID, errorMsg);
      setStreamingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    input,
    setInput,
    isLoading,
    streamingMessage,
    messages,
    messagesEndRef,
    inputRef,
    showClearDialog,
    handleClearChat,
    confirmClearChat,
    cancelClearChat,
    handleNewChat,
    sendMessage,
    handleKeyDown,
    hasHydrated,
  };
}
