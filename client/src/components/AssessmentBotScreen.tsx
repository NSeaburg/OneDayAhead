import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Add TypeScript declaration for global window property
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
    };
  }
}

interface AssessmentBotScreenProps {
  assistantId: string;
  systemPrompt: string;
  onNext: (nextAssistantId?: string) => void;
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
  const [chatStartTime] = useState<number>(Date.now()); // Track when the chat started
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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
    initialMessage: "I'm your assessment assistant. I'll be asking you a series of questions about the material you just learned. Please answer to the best of your ability, and I'll provide guidance as needed. Let's start with your understanding of the key concepts. What are the main learning methods mentioned in the article?"
  });
  
  // Scroll to bottom of messages when new messages appear or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);
  
  // Expose the assessment data through the window for the next screen
  // This is necessary to pass data between screens
  if (typeof window !== 'undefined') {
    window.__assessmentData = {
      threadId: threadId || undefined,
      messages
    };
  }

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
      
      // Calculate the chat duration in seconds
      const chatDurationSeconds = Math.floor((Date.now() - chatStartTime) / 1000);
      
      // Send conversation data to N8N before proceeding to the next screen
      const response = await apiRequest("POST", "/api/send-to-n8n", {
        conversationData: messages,
        threadId: threadId, // Include the thread ID for N8N to process
        courseName: "Gravity Course", // Add the course name
        chatDurationSeconds: chatDurationSeconds // Add the chat duration in seconds
      });
      
      const result = await response.json();
      console.log("N8N integration result:", result);
      console.log("Thread ID sent to N8N:", threadId);
      
      if (result.success) {
        console.log("Next Assistant ID received:", result.nextAssistantId || "None provided");
        
        // Pass the nextAssistantId when navigating to the next screen
        const nextAssistantId = result.nextAssistantId;
        
        // Show success toast
        toast({
          title: "Assessment data sent",
          description: "Your assessment data has been successfully sent to the learning system.",
        });
        
        // Then call the onNext function to move to the next screen with the dynamic assistant ID
        onNext(nextAssistantId);
      } else {
        // Handle the case where N8N returned a non-error response but with success: false
        console.log("N8N integration failed:", result.message);
        
        // Show warning toast
        toast({
          title: "N8N integration issue",
          description: "There was an issue with the N8N workflow, but you can continue with a fallback assistant.",
          variant: "default"
        });
        
        // Still proceed to the next screen but with no nextAssistantId (will use fallback)
        onNext(undefined);
      }
    } catch (error) {
      console.error("Failed to send data to N8N:", error);
      
      // Show error toast
      toast({
        title: "Error sending assessment data",
        description: "There was a problem sending your assessment data. You can still continue with a fallback assistant.",
        variant: "destructive"
      });
      
      // Still allow the user to proceed to the next screen even if N8N integration fails
      onNext(undefined); // Use undefined for fallback
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
          {/* Regular messages */}
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
          
          {/* Currently streaming message */}
          {isTyping && currentStreamingMessage && (
            <div className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                  <i className="ri-question-line"></i>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Assessment Bot
                </span>
              </div>
              <div className="ml-10 bg-green-50 rounded-lg p-3 text-gray-700">
                <span className="typing-text">{currentStreamingMessage}</span>
                <span className="inline-block w-[1px] h-4 bg-gray-600 opacity-70 animate-blink ml-[1px]"></span>
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
