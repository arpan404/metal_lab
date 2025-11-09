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
import {
  X,
  Send,
  Loader2,
  Trash2,
  MessageSquarePlus,
  BookOpen,
  Book,
  HelpCircle,
  PenTool,
  Lightbulb,
  Target,
  Check,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useSideChat } from "@/lib/hooks/use-side-chat";
import { useNavbar } from "@/lib/contexts/navbar-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function SideChat({
  isOpen,
  onClose,
  labUID,
  experimentDetails,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  labUID: string;
  experimentDetails: {
    name: string;
    description: string;
    currentState: any;
    variables: Record<string, any>;
  };
}>) {
  const { isNavbarVisible } = useNavbar();
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
  } = useSideChat(labUID, isOpen, experimentDetails);

  // Study materials state
  const [showStudyMaterials, setShowStudyMaterials] = useState(false);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
  const [studyMaterials, setStudyMaterials] = useState<any>(null);

  // Load existing study materials from localStorage on mount
  useEffect(() => {
    try {
      const savedMaterials = JSON.parse(
        localStorage.getItem("studyMaterials") || "{}"
      );
      if (savedMaterials[labUID]) {
        setStudyMaterials(savedMaterials[labUID]);
      }
    } catch (error) {
      console.error("Failed to load saved study materials:", error);
    }
  }, [labUID]);

  const generateStudyMaterials = async () => {
    if (messages.length === 0) {
      alert("No conversation history to generate study materials from!");
      return;
    }

    setIsGeneratingStudy(true);
    setShowStudyMaterials(true);

    try {
      // Prepare conversation context
      const conversationContext = messages
        .map(
          (msg) =>
            `${msg.role === "user" ? "Student" : "Assistant"}: ${msg.content}`
        )
        .join("\n\n");

      const prompt = `Based on the following conversation history about ${experimentDetails.name}, generate comprehensive study materials in JSON format:

${conversationContext}

Generate study materials with these sections:
1. flashcards: Array of {front: string, back: string} - 10 cards
2. readingMaterial: {title: string, content: string, keyTakeaways: string[]}
3. quiz: Array of {question: string, options: string[], correctAnswer: number, explanation: string} - 5 questions
4. fillInBlanks: Array of {question: string, correctAnswer: string, hint: string} - 5 questions

Return ONLY valid JSON with this structure. Make it educational and based on the conversation topics.`;

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          newMessage: prompt,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
        }
      }

      // Extract JSON from response - the API returns raw text that should be JSON
      try {
        let jsonText = fullResponse.trim();

        // Remove markdown code blocks if present
        const codeBlockMatch = jsonText.match(
          /```(?:json)?\s*(\{[\s\S]*\})\s*```/
        );
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1];
        }

        // Try to find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }

        console.log("Attempting to parse JSON:", jsonText);
        const materials = JSON.parse(jsonText);
        console.log("Successfully parsed materials:", materials);

        setStudyMaterials(materials);

        // Save to localStorage
        const savedMaterials = JSON.parse(
          localStorage.getItem("studyMaterials") || "{}"
        );
        savedMaterials[labUID] = {
          ...materials,
          timestamp: Date.now(),
          experimentName: experimentDetails.name,
        };
        localStorage.setItem("studyMaterials", JSON.stringify(savedMaterials));
      } catch (parseError) {
        console.error("Failed to parse study materials JSON:", parseError);
        console.log("Raw response:", fullResponse);
        alert(
          "Failed to parse study materials. The AI response may not be in the expected format. Please try again."
        );
      }
    } catch (error) {
      console.error("Error generating study materials:", error);
      alert("Failed to generate study materials. Please try again.");
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  // Keep mounted for smooth transitions; control visibility with transforms and opacity
  return (
    <>
      {/* Floating toggle button (visible when open) */}
      <button
        onClick={onClose}
        className={`fixed right-0 ${
          isNavbarVisible ? "top-[calc(50vh+1.75rem)]" : "top-1/2"
        } -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-l-lg shadow-lg transition-all duration-300 z-50 hover:pr-5 cursor-pointer ${
          isOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
        aria-label="Close chat"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Side chat panel */}
      <div
        className={`fixed right-0 ${
          isNavbarVisible ? "top-14 h-[calc(100vh-3.5rem)]" : "top-0 h-screen"
        } w-96 border-l bg-background shadow-2xl flex flex-col z-40 transform transition-all duration-300 ease-in-out cursor-pointer ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => {
                if (studyMaterials) {
                  setShowStudyMaterials(true);
                } else {
                  generateStudyMaterials();
                }
              }}
              variant={"ghost"}
              size={"icon"}
              aria-label="Generate study materials"
              title="Generate study materials from conversation"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleNewChat}
                variant={"ghost"}
                size={"icon"}
                aria-label="New chat"
                title="Start new chat"

              >
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
              <Button 
                onClick={handleClearChat}
                variant={"ghost"}
                size={"icon"}
                aria-label="Clear chat"
                title="Clear chat history"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!hasHydrated ? (
            // Loading state during hydration
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Loading chat...</p>
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
                    const answerMatch = message.content.match(
                      /"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/
                    );
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
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="ml-4 list-disc mb-2">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="ml-4 list-decimal mb-2">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-2">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-bold mb-2">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold mb-1">
                                  {children}
                                </h3>
                              ),
                              code: ({ className, children, ...props }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code
                                    className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <code
                                    className={`${className} text-xs`}
                                    {...props}
                                  >
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
                        <span className="whitespace-pre-wrap">
                          {displayContent}
                        </span>
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
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="ml-4 list-disc mb-2">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="ml-4 list-decimal mb-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold mb-1">
                              {children}
                            </h3>
                          ),
                          code: ({ className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code
                                className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <code
                                className={`${className} text-xs`}
                                {...props}
                              >
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
                Are you sure you want to clear all messages? This action cannot
                be undone.
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

        {/* Study Materials Modal */}
        <StudyMaterialsModal
          isOpen={showStudyMaterials}
          onClose={() => setShowStudyMaterials(false)}
          materials={studyMaterials}
          isGenerating={isGeneratingStudy}
          labName={experimentDetails.name}
          onRegenerate={generateStudyMaterials}
        />
      </div>
    </>
  );
}

// Study Materials Modal Component
function StudyMaterialsModal({
  isOpen,
  onClose,
  materials,
  isGenerating,
  labName,
  onRegenerate,
}: {
  isOpen: boolean;
  onClose: () => void;
  materials: any;
  isGenerating: boolean;
  labName: string;
  onRegenerate: () => void;
}) {
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [fillInAnswers, setFillInAnswers] = useState<Record<number, string>>(
    {}
  );
  const [showResults, setShowResults] = useState(false);

  const handleQuizSubmit = () => {
    setShowResults(true);
  };

  const handleFillInSubmit = async (index: number) => {
    const question = materials.fillInBlanks[index];
    const userAnswer = fillInAnswers[index] || "";
    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();
    alert(
      isCorrect
        ? "Correct!"
        : `Not quite. The answer is: ${question.correctAnswer}`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[70vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Study Materials</DialogTitle>
                <p className="text-sm text-muted-foreground">{labName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}{" "}
              Regenerate
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {isGenerating || !materials ? (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="relative w-fit">
                  <img
                    src="/mela.webp"
                    width={80}
                    height={80}
                    alt="Mela AI"
                    className="rounded-full animate-pulse shadow"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full animate-ping" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Crafting your study materials
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  Mela is analyzing your conversation and generating flashcards,
                  reading notes, quizzes, and fill-in exercises.
                </p>
              </div>
              <div className="flex justify-center items-center gap-2">
                <div
                  className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          ) : (
            <Tabs defaultValue="flashcards" className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="flashcards" className="gap-1.5">
                  <BookOpen className="h-4 w-4" /> Flashcards{" "}
                  <span className="text-xs opacity-70">
                    ({materials.flashcards?.length || 0})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="reading" className="gap-1.5">
                  <Book className="h-4 w-4" /> Reading
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-1.5">
                  <HelpCircle className="h-4 w-4" /> Quiz{" "}
                  <span className="text-xs opacity-70">
                    ({materials.quiz?.length || 0})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="fillInBlanks" className="gap-1.5">
                  <PenTool className="h-4 w-4" /> Fill-in{" "}
                  <span className="text-xs opacity-70">
                    ({materials.fillInBlanks?.length || 0})
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flashcards" className="space-y-4 mt-4">
                {materials.flashcards && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-zinc-900 to-gray-900 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          {currentFlashcard + 1}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          of {materials.flashcards.length} cards
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentFlashcard(
                              Math.max(0, currentFlashcard - 1)
                            )
                          }
                          disabled={currentFlashcard === 0}
                          className="gap-1"
                        >
                          ← Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentFlashcard(
                              Math.min(
                                materials.flashcards.length - 1,
                                currentFlashcard + 1
                              )
                            )
                          }
                          disabled={
                            currentFlashcard === materials.flashcards.length - 1
                          }
                          className="gap-1"
                        >
                          Next →
                        </Button>
                      </div>
                    </div>

                    <div
                      className={`relative rounded-2xl p-12 min-h-[340px] flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl group ${
                        showAnswer
                          ? "bg-linear-to-br from-emerald-400 via-teal-400 to-cyan-500"
                          : "bg-linear-to-br from-orange-400 via-amber-500 to-yellow-500"
                      }`}
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />

                      {/* Card type badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-white flex items-center gap-1">
                          {showAnswer ? (
                            <Lightbulb className="h-3 w-3" />
                          ) : (
                            <HelpCircle className="h-3 w-3" />
                          )}{" "}
                          {showAnswer ? "Answer" : "Question"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="relative text-center space-y-6 max-w-3xl">
                        <p className="text-2xl font-bold text-white leading-relaxed drop-shadow-md">
                          {showAnswer
                            ? materials.flashcards[currentFlashcard].back
                            : materials.flashcards[currentFlashcard].front}
                        </p>

                        {/* Flip indicator */}
                        <div className="flex items-center justify-center gap-2 pt-4">
                          <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all">
                            <p className="text-sm font-medium text-white flex items-center gap-2">
                              <svg
                                className="w-5 h-5 animate-pulse"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              {showAnswer
                                ? "Click to see question"
                                : "Click to reveal answer"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex gap-1 justify-center">
                      {materials.flashcards.map((_: any, idx: number) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === currentFlashcard
                              ? "w-8 bg-linear-to-r from-orange-500 to-amber-500"
                              : "w-1.5 bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reading" className="space-y-4 mt-4">
                {materials.readingMaterial && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{materials.readingMaterial.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {materials.readingMaterial.content}
                      </div>
                      {materials.readingMaterial.keyTakeaways && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" /> Key Takeaways
                          </h4>
                          <ul className="space-y-2">
                            {materials.readingMaterial.keyTakeaways.map(
                              (takeaway: string, i: number) => (
                                <li key={i} className="text-sm">
                                  {takeaway}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="quiz" className="space-y-4 mt-4">
                {materials.quiz && (
                  <div className="space-y-4">
                    {materials.quiz.map((q: any, i: number) => (
                      <Card key={i}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {i + 1}. {q.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            {q.options.map((option: string, optIdx: number) => (
                              <label
                                key={optIdx}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  quizAnswers[i] === optIdx
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-${i}`}
                                  checked={quizAnswers[i] === optIdx}
                                  onChange={() =>
                                    setQuizAnswers({
                                      ...quizAnswers,
                                      [i]: optIdx,
                                    })
                                  }
                                  disabled={showResults}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          {showResults && (
                            <div
                              className={`p-4 rounded-lg border ${
                                quizAnswers[i] === q.correctAnswer
                                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                                  : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                              }`}
                            >
                              <p
                                className={`font-semibold text-sm mb-2 flex items-center gap-2 ${
                                  quizAnswers[i] === q.correctAnswer
                                    ? "text-green-700 dark:text-green-300"
                                    : "text-red-700 dark:text-red-300"
                                }`}
                              >
                                {quizAnswers[i] === q.correctAnswer ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}{" "}
                                {quizAnswers[i] === q.correctAnswer
                                  ? "Correct!"
                                  : "Incorrect"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {!showResults ? (
                      <Button
                        onClick={handleQuizSubmit}
                        className="w-full"
                        size="lg"
                      >
                        Submit Quiz <Target className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Card className="bg-muted/30">
                        <CardContent className="text-center py-6">
                          <p className="text-2xl font-bold mb-2">
                            {
                              Object.entries(quizAnswers).filter(
                                ([idx, ans]) =>
                                  ans ===
                                  materials.quiz[Number(idx)].correctAnswer
                              ).length
                            }{" "}
                            / {materials.quiz.length}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Final Score
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fillInBlanks" className="space-y-4 mt-4">
                {materials.fillInBlanks && (
                  <div className="space-y-4">
                    {materials.fillInBlanks.map((q: any, i: number) => (
                      <Card key={i}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {i + 1}. {q.question}
                          </CardTitle>
                          <CardDescription className="text-xs flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" /> Hint: {q.hint}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Input
                              value={fillInAnswers[i] || ""}
                              onChange={(e) =>
                                setFillInAnswers({
                                  ...fillInAnswers,
                                  [i]: e.target.value,
                                })
                              }
                              placeholder="Type your answer..."
                              className="flex-1"
                            />
                            <Button
                              onClick={() => handleFillInSubmit(i)}
                              size="default"
                            >
                              Check <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
