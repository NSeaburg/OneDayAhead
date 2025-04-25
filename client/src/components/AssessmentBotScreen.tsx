import { useState } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/hooks/useChatMessages";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AssessmentBotScreenProps {
  assistantId: string;
  systemPrompt: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function AssessmentBotScreen({ 
  assistantId,
  systemPrompt,
  onNext,
  onPrevious
}: AssessmentBotScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingToN8N, setIsSendingToN8N] = useState(false);
  const { toast } = useToast();
  
  const { messages, sendMessage, isLoading } = useChatMessages({
    assistantId,
    systemPrompt,
    initialMessage: "I'm your assessment assistant. I'll be asking you a series of questions about the material you just learned. Please answer to the best of your ability, and I'll provide guidance as needed. Let's start with your understanding of the key concepts. What are the main learning methods mentioned in the article?"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };
  
  const handleNext = async () => {
    try {
      setIsSendingToN8N(true);
      
      // Send conversation data to N8N before proceeding to the next screen
      const response = await apiRequest("POST", "/api/send-to-n8n", {
        conversationData: messages
      });
      
      const result = await response.json();
      console.log("N8N integration result:", result);
      
      // Show success toast
      toast({
        title: "Assessment data sent",
        description: "Your assessment data has been successfully sent to the learning system.",
      });
      
      // Then call the onNext function to move to the next screen
      onNext();
    } catch (error) {
      console.error("Failed to send data to N8N:", error);
      
      // Show error toast
      toast({
        title: "Error sending assessment data",
        description: "There was a problem sending your assessment data. You can still continue.",
        variant: "destructive"
      });
      
      // Still allow the user to proceed to the next screen even if N8N integration fails
      onNext();
    } finally {
      setIsSendingToN8N(false);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Knowledge Assessment</h1>
      <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">Assessment Assistant</h2>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-260px)] md:h-[calc(100vh-230px)] space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                <div className={`w-8 h-8 rounded-full ${
                  message.role === 'assistant' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                } flex items-center justify-center mr-2 flex-shrink-0`}>
                  <i className={message.role === 'assistant' ? 'ri-question-line' : 'ri-user-line'}></i>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {message.role === 'assistant' ? 'Assessment Bot' : 'You'}
                </span>
              </div>
              <div className={`ml-10 ${
                message.role === 'assistant' 
                  ? 'bg-green-50' 
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
              placeholder="Type your response here..."
              className="flex-grow focus:border-green-500"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={isLoading}
              className="p-2 bg-green-500 hover:bg-green-600 text-white"
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
          onClick={handleNext}
          disabled={isLoading || isSendingToN8N}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {isSendingToN8N ? "Sending..." : "Next"}
          {!isSendingToN8N && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
