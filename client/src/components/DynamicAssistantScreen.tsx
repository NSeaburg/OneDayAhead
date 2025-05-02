import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send, BookOpen, Lightbulb, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Import teacher images directly
import mrWhitakerImage from "../../../public/Whitaker.png";
import mrsPartonImage from "../../../public/Parton.png";
import mrsBannermanImage from "../../../public/Bannerman.png";

// Default placeholder image for fallback purposes
const placeholderImage = "https://placehold.co/400x400?text=Assistant";

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
  
  // Check if this is using a fallback assistant ID OR if we have no teaching assistance
  // Only show fallback message if we're using a fallback ID AND we didn't get teaching data
  const isUsingFallback = !assistantId.startsWith("asst_") && !teachingAssistance;
  
  // Get proficiency level from teachingAssistance if available
  const proficiencyLevel = teachingAssistance?.level || "unknown";

  // Choose the appropriate initial message based on proficiency level and fallback status
  let initialMessage = "";
  if (isUsingFallback) {
    initialMessage = "Hello! I'm your specialized assistant for this part of the learning journey. (Note: The system is currently using a fallback assistant due to a technical issue. I'll still be able to help you with the learning material!) How can I help you with what you've just learned?";
  } else if (proficiencyLevel === "high") {
    initialMessage = "Hello there. I'm Mrs. Parton — retired civics teacher, and I'm here to help you apply what you've learned about how our government works when it's put to the test. We'll be using the United States v. Nixon case as our guide today. I'll ask you a few questions to help you think through how each branch played its part. Let's dive in when you're ready. (gathers a folder of well-worn case studies with a fond smile)";
  } else if (proficiencyLevel === "medium") {
    initialMessage = "Hey there. I'm Mrs. Bannerman — retired civics teacher, and I'm here to help you think through some of the \"what ifs\" that shaped our government. We'll be exploring what might happen if just one branch ran the whole show. It's going to be some good old-fashioned critical thinking — no pressure, just ideas and conversation. Ready to get started? (adjusts an old, well-worn lesson plan binder with a fond smile)";
  } else if (proficiencyLevel === "low") {
    initialMessage = "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')";
  } else {
    initialMessage = "Hello! I'm your specialized assistant for this part of the learning journey. I've been selected based on your assessment responses to provide you with targeted guidance. How can I help you with the material you've just learned?";
  }
  
  // Use the teachingAssistance systemPrompt if available, otherwise use the default
  const activeSystemPrompt = teachingAssistance?.systemPrompt || systemPrompt;
  
  // Log which system prompt we're using
  console.log(`DynamicAssistantScreen using ${teachingAssistance ? 'Claude-specific' : 'default'} system prompt for level: ${proficiencyLevel}`);
  console.log(`System prompt length: ${activeSystemPrompt?.length || 0} characters`);
  console.log(`Teaching assistance data:`, teachingAssistance ? JSON.stringify(teachingAssistance, null, 2) : 'Not provided');
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    threadId, 
    currentStreamingMessage, 
    isTyping,
    setMessages
  } = useStreamingChat({
    assistantId,
    systemPrompt: activeSystemPrompt,
    initialMessage,
    useAnthropicForAssessment: true // Use Claude/Anthropic exclusively
  });
  
  // Reset conversation on mount or when teachingAssistance changes to ensure system prompt is applied
  useEffect(() => {
    console.log("DynamicAssistantScreen mounted/updated - resetting conversation to ensure proper system prompt");
    console.log("Using system prompt with level:", proficiencyLevel);
    
    // Clear existing messages and set the initial welcome
    setMessages([{
      role: 'assistant',
      content: initialMessage
    }]);
  }, [teachingAssistance, initialMessage]);
  
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
      
      // Prepare the data for sending to N8N (Claude/Anthropic integration)
      console.log("Preparing to send Claude/Anthropic conversation data to N8N");
      console.log("Teaching conversation length:", messages.length);
      console.log("Assessment conversation length:", (assessmentConversation || []).length);
      
      // Add more detailed logging to help with troubleshooting
      if (messages.length > 0) {
        console.log("Teaching conversation first message:", messages[0].role);
        console.log("Teaching conversation last message:", messages[messages.length - 1].role);
      }
      
      if (assessmentConversation && assessmentConversation.length > 0) {
        console.log("Assessment conversation first message:", assessmentConversation[0].role);
        console.log("Assessment conversation last message:", assessmentConversation[assessmentConversation.length - 1].role);
      }
      
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
      // Handle both formats: direct object or array of objects with feedbackData
      let feedbackData = null;
      
      if (result.feedbackData) {
        // Direct object format from server
        feedbackData = result.feedbackData;
        console.log("Feedback data received from server object:", feedbackData);
      } else if (Array.isArray(result) && result.length > 0 && result[0].feedbackData) {
        // Array format directly from N8N
        feedbackData = result[0].feedbackData;
        console.log("Feedback data received from N8N array format:", feedbackData);
      }
      
      console.log("Final feedback data to be used:", feedbackData);
      
      if (result.success) {
        // Silently continue without showing a toast
        
        // Store feedback data in window object so it can be retrieved by the feedback screen
        if (feedbackData) {
          // Store in window object with full details for debugging
          window.__assessmentData = {
            ...(window.__assessmentData || {}),
            feedbackData
          };
          
          // Log explicit contents to help debug
          console.log("Setting window.__assessmentData.feedbackData with:", {
            summary: feedbackData.summary,
            contentKnowledgeScore: feedbackData.contentKnowledgeScore,
            writingScore: feedbackData.writingScore,
            nextSteps: feedbackData.nextSteps
          });
        } else {
          console.log("No feedback data received from N8N webhook");
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
      
      // Call the onNext function to move to the next screen with feedback data
      // Always call onNext just once at the end of the try block
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
  
  // Helper function to get the correct teacher image based on proficiency level
  const getTeacherImage = () => {
    if (proficiencyLevel === "high") return mrsPartonImage;
    if (proficiencyLevel === "medium") return mrsBannermanImage;
    if (proficiencyLevel === "low") return mrWhitakerImage;
    return mrsBannermanImage; // Default fallback
  };

  // Helper function to get the teacher name based on proficiency level
  const getTeacherName = () => {
    if (proficiencyLevel === "high") return "Mrs. Parton";
    if (proficiencyLevel === "medium") return "Mrs. Bannerman";
    if (proficiencyLevel === "low") return "Mr. Whitaker";
    return "Learning Assistant"; // Default fallback
  };

  // Helper function to get teacher title/role based on proficiency level
  const getTeacherTitle = () => {
    if (proficiencyLevel === "high") return "Advanced Civics Educator";
    if (proficiencyLevel === "medium") return "Retired Civics Teacher";
    if (proficiencyLevel === "low") return "Civics Educator";
    return "Learning Guide"; // Default fallback
  };

  // Helper function to get teacher description based on proficiency level
  const getTeacherDescription = () => {
    if (proficiencyLevel === "high") {
      return "With over 40 years of teaching experience, Mrs. Parton specializes in helping advanced students explore the nuances of government systems. She's known for challenging her students to think critically about complex civic concepts and historical connections.";
    }
    if (proficiencyLevel === "medium") {
      return "A retired civics and American history teacher with 35 years of classroom experience. Mrs. Bannerman explains complex ideas patiently, using real-world examples and occasionally sharing anecdotes from her teaching career. She's warm, supportive, and knows how to make government concepts accessible.";
    }
    if (proficiencyLevel === "low") {
      return "After teaching civics for over 30 years, Mr. Whitaker now helps students build strong foundations in government concepts. He's known for his clear explanations, helpful analogies, and patient approach to learning. He breaks down complex ideas into manageable parts.";
    }
    return "Your specialized learning assistant has been selected to guide you through this material based on your assessment results."; // Default fallback
  };

  // Helper function to get guidance approach based on proficiency level
  const getGuidanceApproach = () => {
    if (proficiencyLevel === "high") {
      return "Mrs. Parton will challenge you to think critically about advanced civics concepts and historical connections that go beyond the basics. She'll help you explore nuanced ideas about government systems.";
    }
    if (proficiencyLevel === "medium") {
      return "Mrs. Bannerman will help strengthen your understanding of government concepts, clarify any misunderstandings, and introduce some more advanced ideas when you're ready.";
    }
    if (proficiencyLevel === "low") {
      return "Mr. Whitaker will focus on building a solid foundation of key government concepts through clear explanations, helpful metaphors, and guided activities.";
    }
    return "Your learning assistant will guide you through the key concepts from the material you've just studied."; // Default fallback
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Specialized Guidance</h1>
      
      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {/* Left column - Teacher profile */}
        {proficiencyLevel !== "unknown" && (
          <div className="md:w-1/3 flex flex-col">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 h-fit">
              <div className="flex flex-col items-center text-center mb-4">
                <img 
                  src={getTeacherImage()} 
                  alt={getTeacherName()} 
                  className="w-28 h-28 border-2 border-gray-300 shadow-sm rounded-full object-cover mb-3"
                />
                <h2 className="font-bold text-xl text-gray-800">{getTeacherName()}</h2>
                <p className="text-sm text-gray-600 font-medium">{getTeacherTitle()}</p>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                {getTeacherDescription()}
              </p>
              
              <hr className="my-4 border-gray-200" />
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Guidance Approach</h3>
                <p className="text-sm text-gray-700">
                  {getGuidanceApproach()}
                </p>
              </div>
              
              <hr className="my-4 border-gray-200" />
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Learning Level</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    proficiencyLevel === "high" ? "bg-green-500" :
                    proficiencyLevel === "medium" ? "bg-blue-500" :
                    proficiencyLevel === "low" ? "bg-amber-500" : "bg-gray-400"
                  }`}></div>
                  <p className="text-sm text-gray-700">
                    {proficiencyLevel === "high" ? "Advanced" :
                    proficiencyLevel === "medium" ? "Intermediate" :
                    proficiencyLevel === "low" ? "Foundational" : "Standard"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Right column - Chat interface */}
        <div className={`${proficiencyLevel !== "unknown" ? 'md:w-2/3' : 'w-full'} flex-grow flex flex-col`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-800">
                {proficiencyLevel === "high" ? "Mrs. Parton" :
                 proficiencyLevel === "medium" ? "Mrs. Bannerman" :
                 proficiencyLevel === "low" ? "Mr. Whitaker" : "Dynamic Assistant"}
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
            
            <div className="p-4 overflow-y-auto flex-grow space-y-4">
              {/* Regular messages */}
              {messages.map((message, index) => (
                <div key={index} className="message-appear flex flex-col">
                  <div className="flex items-start mb-1">
                    {message.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                        <img 
                          src={getTeacherImage()} 
                          alt={getTeacherName()} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-xs text-gray-500 mt-1">
                      {message.role === 'assistant' 
                        ? (proficiencyLevel === "high" ? 'Mrs. Parton' : 
                           proficiencyLevel === "medium" ? 'Mrs. Bannerman' : 
                           proficiencyLevel === "low" ? 'Mr. Whitaker' : 'Assistant') 
                        : 'You'}
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
              
              {/* Streaming message */}
              {isTyping && currentStreamingMessage && (
                <div className="flex flex-col">
                  <div className="flex items-start mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                      <img 
                        src={getTeacherImage()} 
                        alt={getTeacherName()} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {proficiencyLevel === "high" ? 'Mrs. Parton' : 
                       proficiencyLevel === "medium" ? 'Mrs. Bannerman' : 
                       proficiencyLevel === "low" ? 'Mr. Whitaker' : 'Assistant'}
                    </span>
                  </div>
                  <div className="ml-10 bg-blue-50 rounded-lg p-3 text-gray-700">
                    <div className="typing-text markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentStreamingMessage}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
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
                  maxRows={7}
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