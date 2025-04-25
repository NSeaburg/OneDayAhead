import { useState } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/hooks/useChatMessages";

interface DynamicAssistantScreenProps {
  assistantId: string;
  systemPrompt: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function DynamicAssistantScreen({ 
  assistantId,
  systemPrompt,
  onNext,
  onPrevious
}: DynamicAssistantScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  
  // Check if this is likely using a fallback assistant ID
  const isUsingFallback = assistantId.includes("{{$json") || !assistantId.startsWith("asst_");
  
  // Choose the appropriate initial message based on whether we're using a fallback
  const initialMessage = isUsingFallback
    ? "Hello! I'm your specialized assistant for this part of the learning journey. (Note: The system is currently using a fallback assistant because of a configuration issue with the N8N integration. I'll still be able to help you with the learning material!) How can I help you with what you've just learned?"
    : "Hello! I'm your specialized assistant for this part of the learning journey. I've been selected based on your assessment responses to provide you with targeted guidance. How can I help you with the material you've just learned?";
  
  const { messages, sendMessage, isLoading, threadId } = useChatMessages({
    assistantId,
    systemPrompt,
    initialMessage
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };
  
  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Specialized Guidance</h1>
      <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">Dynamic Assistant</h2>
          {isUsingFallback ? (
            <div className="mt-1">
              <p className="text-sm text-amber-600 font-medium">
                Using fallback assistant (N8N returned invalid ID format)
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                ID: {assistantId.length > 20 ? `${assistantId.substring(0, 20)}...` : assistantId}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Assistant ID: {assistantId.substring(0, 15)}...
            </p>
          )}
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-260px)] md:h-[calc(100vh-230px)] space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                <div className={`w-8 h-8 rounded-full ${
                  message.role === 'assistant' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                } flex items-center justify-center mr-2 flex-shrink-0`}>
                  <i className={message.role === 'assistant' ? 'ri-robot-line' : 'ri-user-line'}></i>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {message.role === 'assistant' ? 'Dynamic Assistant' : 'You'}
                </span>
              </div>
              <div className={`ml-10 ${
                message.role === 'assistant' 
                  ? 'bg-blue-50' 
                  : 'bg-white border border-gray-200'
              } rounded-lg p-3 text-gray-700`}>
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-pulse flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow focus:border-blue-500"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={isLoading}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
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