"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Send, Loader2, Trash2, MessageSquarePlus } from "lucide-react";
import { useSideChat } from "@/lib/hooks/use-side-chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function SideChat({
  isOpen,
  onClose,
  labUID,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  labUID: string;
}>) {
  const {
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
  } = useSideChat(labUID, isOpen);

  // Keep mounted for smooth transitions; control visibility with transforms and opacity
  return (
    <>
      {/* Floating toggle button (visible when open) */}
      <button
        onClick={onClose}
        className={`fixed right-0 top-[calc(50vh+1.75rem)] -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-l-lg shadow-lg transition-all duration-300 z-50 hover:pr-5 ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        }`}
        aria-label="Close chat"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Side chat panel */}
      <div
        className={`fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-96 border-l bg-background shadow-2xl flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Mela Your Lab Assistant</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="New chat"
              title="Start new chat"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
            <button
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear chat"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!hasHydrated ? (
          // Loading state during hydration
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Loading chat...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Start a conversation
              </p>
              <p className="text-xs text-muted-foreground">
                Ask questions about your experiment
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // Extract answer from JSON if it's an assistant message
              let displayContent = message.content;
              if (message.role === "assistant") {
                try {
                  const answerMatch = message.content.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                  if (answerMatch) {
                    displayContent = answerMatch[1]
                      .replace(/\\n/g, "\n\n") // Convert \n to double newline for markdown
                      .replace(/\\r/g, "")
                      .replace(/\\t/g, "\t")
                      .replace(/\\"/g, '"')
                      .replace(/\\\\/g, "\\");
                  }
                } catch (e) {
                  // If parsing fails, show original content
                  console.error("Failed to parse assistant message:", e);
                }
              }

              return (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="ml-4 list-disc mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="ml-4 list-decimal mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            code: ({ className, children, ...props }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={`${className} text-xs`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre className="bg-muted-foreground/10 p-2 rounded overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {displayContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{displayContent}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Show streaming message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-muted">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="ml-4 list-disc mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="ml-4 list-decimal mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className={`${className} text-xs`} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-muted-foreground/10 p-2 rounded overflow-x-auto mb-2">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={cancelClearChat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Chat History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all messages? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelClearChat}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClearChat}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
