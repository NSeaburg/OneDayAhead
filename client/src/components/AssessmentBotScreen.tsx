import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CircularProgressIndicator } from "@/components/ui/progress-indicator";
// Import Reginald image directly
import reginaldImage from "../../../public/reginald-worthington.png";

// Add TypeScript declaration for global window property
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
  const [completedExchanges, setCompletedExchanges] = useState(0);
  const [showProgressIndicator, setShowProgressIndicator] = useState(false);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Define total exchanges needed for completion
  const totalRequiredExchanges = 6;
  
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
    initialMessage: "Greetings, subject— ah, I mean, citizen."
  });
  
  // Scroll to bottom of messages when new messages appear or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);
  
  // Show progress indicator after first message (but don't count exchanges here)
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.role === 'user').length;
    
    // Show the progress indicator after the first user message
    if (userMessages > 0 && !showProgressIndicator) {
      setShowProgressIndicator(true);
    }
  }, [messages, showProgressIndicator]);
  
  // Expose the assessment data through the window for the next screen
  // This is necessary to pass data between screens
  if (typeof window !== 'undefined') {
    window.__assessmentData = {
      threadId: threadId || undefined,
      messages
    };
  }

  // Function to determine if a message has substance
  const hasSubstance = (message: string): boolean => {
    // Check for minimum word count (requires at least 4 words)
    const wordCount = message.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 4) return false;
    
    // Check for punctuation (complete sentences)
    const hasPunctuation = /[.?!]/.test(message);
    if (!hasPunctuation) return false;
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Show the progress indicator if not already shown
      if (!showProgressIndicator) {
        setShowProgressIndicator(true);
      }
      
      // Only increment the progress if the message has substance
      if (hasSubstance(inputMessage)) {
        // Increment the completed exchanges count
        const newExchangeCount = Math.min(completedExchanges + 1, totalRequiredExchanges);
        setCompletedExchanges(newExchangeCount);
        
        // Mark as complete if reached required exchanges
        if (newExchangeCount >= totalRequiredExchanges) {
          setIsAssessmentComplete(true);
        }
        
        console.log("Message has substance - progress updated!");
      } else {
        console.log("Message lacks substance - progress not updated");
      }
      
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
        
        // Silently continue without showing a toast
        
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Royal Assessment of Democratic Knowledge</h1>
      <div className="flex-grow bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src={reginaldImage} 
              alt="Reginald Worthington III" 
              className="w-24 h-24 mr-4 border-2 border-gray-300 shadow-sm"
            />
            <div>
              <h2 className="font-bold text-xl text-gray-800">Reginald Worthington III</h2>
              <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                Sent by Her Majesty's service to observe this curious American experiment, Reginald brings all the grace, pride, and polite disbelief of an English aristocrat. He doesn't quite understand how a government can function without a king—and he's counting on you to explain it to him. Prepare to defend democracy… with dignity, of course.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-260px)] md:h-[calc(100vh-230px)] space-y-4">
          {/* Regular messages */}
          {messages.map((message, index) => (
            <div key={index} className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                {message.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center mr-2 flex-shrink-0 border border-gray-300 shadow-sm text-xs font-bold">
                    RW
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <i className="ri-user-line"></i>
                  </div>
                )}
                <span className="text-xs text-gray-500 mt-1">
                  {message.role === 'assistant' ? 'Reginald Worthington III' : 'You'}
                </span>
              </div>
              <div className={`ml-10 ${
                message.role === 'assistant' 
                  ? 'bg-red-50 border border-red-100' 
                  : 'bg-white border border-gray-200'
              } rounded-lg p-3 text-gray-700`}>
                <div className="typing-text markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {/* Streaming message - plain text display with no animations */}
          {isTyping && currentStreamingMessage && (
            <div className="flex flex-col">
              <div className="flex items-start mb-1">
                <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center mr-2 flex-shrink-0 border border-gray-300 shadow-sm text-xs font-bold">
                  RW
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Reginald Worthington III
                </span>
              </div>
              <div className="ml-10 bg-red-50 border border-red-100 rounded-lg p-3 text-gray-700">
                <div className="typing-text markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentStreamingMessage}</ReactMarkdown>
                </div>
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
      {/* Progress Indicator */}
      {showProgressIndicator && (
        <div className="flex justify-start mt-4 mb-2 ml-2">
          <CircularProgressIndicator 
            currentSteps={completedExchanges}
            totalSteps={totalRequiredExchanges}
            showCheckmark={isAssessmentComplete}
          />
        </div>
      )}
      
      <div className="mt-2 flex justify-between">
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
          className={`${isAssessmentComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'} text-white`}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
