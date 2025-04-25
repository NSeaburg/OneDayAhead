import { useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/hooks/useChatMessages";

interface FinalBotScreenProps {
  assistantId: string;
  systemPrompt: string;
  onPrevious?: () => void;
}

export default function FinalBotScreen({ 
  assistantId,
  systemPrompt,
  onPrevious
}: FinalBotScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  
  const { messages, sendMessage, isLoading } = useChatMessages({
    assistantId,
    systemPrompt,
    initialMessage: "Based on your assessment responses, I've been assigned to provide personalized feedback and additional resources. Let's discuss your learning journey so far and identify areas where you might want to explore further."
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Personalized Feedback</h1>
      <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">Feedback Assistant</h2>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-230px)] md:h-[calc(100vh-200px)] space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                <div className={`w-8 h-8 rounded-full ${
                  message.role === 'assistant' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                } flex items-center justify-center mr-2 flex-shrink-0`}>
                  <i className={message.role === 'assistant' ? 'ri-chat-smile-line' : 'ri-user-line'}></i>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {message.role === 'assistant' ? 'Feedback Bot' : 'You'}
                </span>
              </div>
              <div className={`ml-10 ${
                message.role === 'assistant' 
                  ? 'bg-purple-50' 
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
              className="flex-grow focus:border-purple-500"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={isLoading}
              className="p-2 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <div className="mt-4 flex justify-start">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>
        )}
      </div>
    </div>
  );
}
