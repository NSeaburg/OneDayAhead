import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface TeachingAssistance {
  level: 'low' | 'medium' | 'high';
  systemPrompt: string;
}

interface DynamicAssistantScreenProps {
  assistantId: string;
  systemPrompt: string;
  assessmentThreadId?: string; // Assessment bot thread ID
  assessmentConversation?: any[]; // Assessment bot conversation
  teachingAssistance?: TeachingAssistance; // New teaching assistance data from N8N
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function DynamicAssistantScreen({ 
  assistantId,
  systemPrompt,
  assessmentThreadId,
  assessmentConversation,
  teachingAssistance,
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
  
  // Get proficiency level from teachingAssistance if available
  const proficiencyLevel = teachingAssistance?.level || "unknown";

  // Choose the appropriate initial message based on proficiency level and fallback status
  let initialMessage = "";
  if (isUsingFallback) {
    initialMessage = "Hello! I'm your specialized assistant for this part of the learning journey. (Note: The system is currently using a fallback assistant due to a technical issue. I'll still be able to help you with the learning material!) How can I help you with what you've just learned?";
  } else if (proficiencyLevel === "high") {
    initialMessage = "Hello! I'm your advanced learning guide. Based on your assessment, you've shown a strong grasp of the core concepts. I'll help you explore more complex aspects and nuances of the material. What specific areas would you like to delve deeper into?";
  } else if (proficiencyLevel === "medium") {
    initialMessage = "Hello! I'm your learning assistant. Your assessment showed good understanding of the material with a few areas to strengthen. I can help clarify concepts or answer questions about what you've learned. What would you like me to explain or discuss?";
  } else if (proficiencyLevel === "low") {
    initialMessage = "Hello! I'm your learning coach. I'll help you build a solid foundation of the material. Let's start with the key concepts and make sure you're comfortable with the basics. What's one thing from the article that you'd like me to explain further?";
  } else {
    initialMessage = "Hello! I'm your specialized assistant for this part of the learning journey. I've been selected based on your assessment responses to provide you with targeted guidance. How can I help you with the material you've just learned?";
  }
  
  // Use the teachingAssistance systemPrompt if available, otherwise use the default
  const activeSystemPrompt = teachingAssistance?.systemPrompt || systemPrompt;
  
  // Log which system prompt we're using
  console.log(`Using ${teachingAssistance ? 'Claude-specific' : 'default'} system prompt for level: ${proficiencyLevel}`);
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    threadId, 
    currentStreamingMessage, 
    isTyping
  } = useStreamingChat({
    assistantId,
    systemPrompt: activeSystemPrompt,
    initialMessage,
    useAnthropicForAssessment: true // Use Claude/Anthropic exclusively
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
        // Silently continue without showing a toast
        
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
          <h2 className="font-semibold text-lg text-gray-800">
            {proficiencyLevel === "high" ? "Advanced Learning Guide" :
             proficiencyLevel === "medium" ? "Intermediate Learning Assistant" :
             proficiencyLevel === "low" ? "Learning Coach" : "Dynamic Assistant"}
          </h2>
          
          {proficiencyLevel !== "unknown" && (
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                proficiencyLevel === "high" ? "bg-green-500" :
                proficiencyLevel === "medium" ? "bg-blue-500" :
                proficiencyLevel === "low" ? "bg-amber-500" : "bg-gray-400"
              }`}></div>
              <p className="text-sm text-gray-600">
                {proficiencyLevel === "high" ? "Advanced level assistance" :
                 proficiencyLevel === "medium" ? "Intermediate level assistance" :
                 proficiencyLevel === "low" ? "Foundational level assistance" : "Standard assistance"}
              </p>
            </div>
          )}
          
          {isUsingFallback && (
            <div className="mt-1">
              <p className="text-sm text-amber-600 font-medium">
                Using fallback assistant (technical issue)
              </p>
            </div>
          )}
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-350px)] md:h-[calc(100vh-320px)] space-y-4">
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
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                  <i className="ri-robot-line"></i>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Dynamic Assistant
                </span>
              </div>
              <div className="ml-10 bg-blue-50 rounded-lg p-3 text-gray-700">
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
          <form onSubmit={handleSubmit} className="flex items-start gap-2">
            <AutoResizeTextarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow focus:border-blue-500"
              maxRows={5}
              onKeyDown={(e) => {
                // Submit on Enter key without Shift key
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit"
              size="icon"
              disabled={isLoading}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white mt-1"
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
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}