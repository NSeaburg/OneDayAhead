import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface PersonalityTestingBotProps {
  avatar?: string | null;
  personalitySummary?: string | null;
  botPersonality: string;
  onClose: () => void;
}

export function PersonalityTestingBot({ 
  avatar, 
  personalitySummary, 
  botPersonality,
  onClose 
}: PersonalityTestingBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: `Hello! I'm your newly designed assessment bot. I'm here to help you test out my personality and teaching style. 

Feel free to ask me questions or have a conversation to see how I interact with students. What would you like to talk about?`,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/claude/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.isBot ? "assistant" : "user",
              content: msg.content,
            })),
            { role: "user", content: userMessage.content },
          ],
          assistantType: "personality-testing",
          botPersonality: botPersonality,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let botResponse = "";
      let streamingMessageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add initial streaming message 
      setMessages(prev => [...prev, {
        id: streamingMessageId,
        content: "",
        isBot: true,
        timestamp: new Date(),
      }]);

      let hasStartedStreaming = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                if (!hasStartedStreaming) {
                  setIsLoading(false);
                  hasStartedStreaming = true;
                }
                
                botResponse += parsed.content;

                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === streamingMessageId 
                      ? { ...msg, content: botResponse }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore JSON parsing errors for streaming
            }
          }
        }
      }

      // Replace streaming message with final message
      if (botResponse) {
        const finalMessageId = `final-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === streamingMessageId 
              ? { ...msg, id: finalMessageId }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => 
        prev.filter(msg => !msg.id.startsWith("streaming"))
      );
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Bot Avatar" 
                className="w-10 h-10 rounded-full object-cover border border-blue-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">Personality Test Chat</h3>
              <p className="text-sm text-gray-600">{personalitySummary || "Testing your assessment bot"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.isBot ? "" : "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isBot ? "bg-blue-100" : "bg-gray-100"
              }`}>
                {message.isBot ? (
                  avatar ? (
                    <img src={avatar} alt="Bot" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-600" />
                  )
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                )}
              </div>
              
              <div className={`flex-1 max-w-md ${message.isBot ? "" : "text-right"}`}>
                <div className={`rounded-lg p-3 ${
                  message.isBot 
                    ? "bg-blue-50 text-gray-900" 
                    : "bg-gray-100 text-gray-900"
                }`}>
                  {message.isBot ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <div className="mb-2 last:mb-0">{children}</div>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div>{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Test your bot's personality..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          className="w-full mt-2"
        >
          Close Testing Chat
        </Button>
      </div>
    </div>
  );
}