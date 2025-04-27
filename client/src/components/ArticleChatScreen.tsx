import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface ArticleChatScreenProps {
  articleContent: string;
  assistantId: string;
  systemPrompt: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function ArticleChatScreen({ 
  articleContent, 
  assistantId,
  systemPrompt,
  onNext,
  onPrevious
}: ArticleChatScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    threadId, 
    currentStreamingMessage, 
    isTyping 
  } = useStreamingChat({
    assistantId,
    systemPrompt,
    initialMessage: "Hello! I'm your learning assistant for this module. Feel free to ask any questions about the article content or related topics, and I'll help clarify concepts or provide additional information."
  });

  // Scroll to bottom of messages when new messages appear or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Article & Discussion</h1>
      <div className="flex-grow flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Article Section */}
        <div className="md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-lg text-gray-800">Learning Material</h2>
          </div>
          <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-230px)] md:h-[calc(100vh-200px)] font-serif">
            <article dangerouslySetInnerHTML={{ __html: articleContent }} />
          </div>
        </div>
        
        {/* Chat Section */}
        <div className="md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-lg text-gray-800">Discussion Assistant</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-290px)] md:h-[calc(100vh-260px)] space-y-4">
            {/* Regular messages */}
            {messages.map((message, index) => (
              <div key={index} className="message-appear flex flex-col">
                <div className="flex items-start mb-1">
                  <div className={`w-8 h-8 rounded-full ${
                    message.role === 'assistant' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-200 text-gray-600'
                  } flex items-center justify-center mr-2 flex-shrink-0`}>
                    <i className={message.role === 'assistant' ? 'ri-robot-line' : 'ri-user-line'}></i>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {message.role === 'assistant' ? 'Assistant' : 'You'}
                  </span>
                </div>
                <div className={`ml-10 ${
                  message.role === 'assistant' 
                    ? 'bg-gray-100' 
                    : 'bg-white border border-gray-200'
                } rounded-lg p-3 text-gray-700`}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Currently streaming message */}
            {isTyping && currentStreamingMessage && (
              <div className="message-appear flex flex-col">
                <div className="flex items-start mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <i className="ri-robot-line"></i>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Assistant
                  </span>
                </div>
                <div className="ml-10 bg-gray-100 rounded-lg p-3 text-gray-700">
                  {currentStreamingMessage}
                  <span className="inline-block animate-pulse">▌</span>
                </div>
              </div>
            )}
            
            {/* Loading indicator when not streaming yet */}
            {isLoading && !currentStreamingMessage && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                </div>
              </div>
            )}
            
            {/* Reference for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-grow focus:border-primary-500"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading}
                className="p-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        {onPrevious ? (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : <div></div>}
        
        <Button
          onClick={onNext}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
