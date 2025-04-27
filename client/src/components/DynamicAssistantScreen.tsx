import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define global window interface for storing feedback data
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
      feedbackData?: {
        summary?: string;
        contentKnowledgeScore?: number;
        writingScore?: number;
        nextSteps?: string;
      };
    };
  }
}

interface DynamicAssistantScreenProps {
  assistantId: string;
  systemPrompt: string;
  assessmentThreadId?: string; // Assessment bot thread ID
  assessmentConversation?: any[]; // Assessment bot conversation
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function DynamicAssistantScreen({ 
  assistantId,
  systemPrompt,
  assessmentThreadId,
  assessmentConversation,
  onNext,
  onPrevious
}: DynamicAssistantScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingToN8N, setIsSendingToN8N] = useState(false);
  const [chatStartTime] = useState<number>(Date.now()); // Track when the chat started
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // We already receive assessmentThreadId as prop, so we don't need a separate state variable
  const { toast } = useToast();
  
  // Check if this is using a fallback assistant ID (not starting with "asst_")
  const isUsingFallback = !assistantId.startsWith("asst_");
  
  // Choose the appropriate initial message based on whether we're using a fallback
  const initialMessage = isUsingFallback
    ? "Hello! I'm your specialized assistant for this part of the learning journey. (Note: The system is currently using a fallback assistant due to a technical issue. I'll still be able to help you with the learning material!) How can I help you with what you've just learned?"
    : "Hello! I'm your specialized assistant for this part of the learning journey. I've been selected based on your assessment responses to provide you with targeted guidance. How can I help you with the material you've just learned?";
  
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
    initialMessage
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
  
  const handleNext = async () => {
    try {
      setIsSendingToN8N(true);
      
      // Calculate the chat duration in seconds
      const chatDurationSeconds = Math.floor((Date.now() - chatStartTime) / 1000);
      
      // Prepare the data for sending
      console.log("Preparing to send combined conversation data");
      console.log("Teaching conversation length:", messages.length);
      console.log("Assessment conversation length:", (assessmentConversation || []).length);
      
      // Send both conversation datasets to N8N before proceeding to the next screen
      const response = await apiRequest("POST", "/api/send-teaching-data", {
        // Teaching bot data
        teachingConversation: messages,
        teachingThreadId: threadId,
        
        // Assessment bot data (if available)
        assessmentConversation: assessmentConversation || [],
        assessmentThreadId: assessmentThreadId || "",
        
        // Common metadata
        courseName: "Gravity Course",
        chatDurationSeconds: chatDurationSeconds
      });
      
      const result = await response.json();
      console.log("Teaching bot N8N integration result:", result);
      console.log("Teaching bot Thread ID:", threadId);
      console.log("Assessment bot Thread ID:", assessmentThreadId || "Not available");
      
      // Extract feedback data if available
      const feedbackData = result.feedbackData || null;
      console.log("Feedback data received:", feedbackData);
      
      if (result.success) {
        // Show success toast
        toast({
          title: "Learning data processed",
          description: "Your conversation data has been analyzed and feedback is ready.",
        });
        
        // Store feedback data in window object so it can be retrieved by the feedback screen
        if (feedbackData) {
          window.__assessmentData = {
            ...(window.__assessmentData || {}),
            feedbackData
          };
        }
      } else {
        // Handle the case where N8N returned a non-error response but with success: false
        console.log("Teaching bot N8N integration failed:", result.message);
        
        // Show warning toast
        toast({
          title: "Data integration issue",
          description: "There was an issue processing your data, but you can continue with the learning journey.",
          variant: "default"
        });
      }
      
      // Call the onNext function to move to the next screen
      onNext(undefined, feedbackData);
    } catch (error) {
      console.error("Failed to send teaching data to N8N:", error);
      
      // Show error toast
      toast({
        title: "Error sending teaching data",
        description: "There was a problem sending your conversation data. You can still continue.",
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Specialized Guidance</h1>
      <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-gray-800">Dynamic Assistant</h2>
          {isUsingFallback ? (
            <div className="mt-1">
              <p className="text-sm text-amber-600 font-medium">
                Using fallback assistant (Invalid assistant ID format)
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
          {/* Regular messages */}
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
          
          {/* Currently streaming message */}
          {isTyping && currentStreamingMessage && (
            <div className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                  <i className="ri-robot-line"></i>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Dynamic Assistant
                </span>
              </div>
              <div className="ml-10 bg-blue-50 rounded-lg p-3 text-gray-700">
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