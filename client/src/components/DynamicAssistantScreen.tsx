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
import { useIsMobile } from "@/hooks/use-mobile";
import { Message } from "@/lib/openai";
import globalStorage from "@/lib/globalStorage";

// Default placeholder image for fallback purposes
const placeholderImage = "https://placehold.co/400x400?text=Assistant";

// Using global interface from types.d.ts

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
  contentPackage?: any; // Content package data for grading
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function DynamicAssistantScreen({ 
  assistantId,
  systemPrompt,
  assessmentThreadId,
  assessmentConversation,
  teachingAssistance,
  contentPackage,
  onNext,
  onPrevious
}: DynamicAssistantScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingToN8N, setIsSendingToN8N] = useState(false);
  const [chatStartTime] = useState<number>(Date.now()); // Track when the chat started
  const [showArticle, setShowArticle] = useState(false); // Track if the article is visible
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // We already receive assessmentThreadId as prop, so we don't need a separate state variable
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Check if this is using a fallback assistant ID OR if we have no teaching assistance
  // Only show fallback message if we're using a fallback ID AND we didn't get teaching data
  const isUsingFallback = !assistantId.startsWith("asst_") && !teachingAssistance;
  
  // Get proficiency level from teachingAssistance if available
  const proficiencyLevel = teachingAssistance?.level || "unknown";

  // Helper functions for teacher profiles (moved up for use in initial message)
  const getTeacherName = () => {
    if (contentPackage?.teachingBots?.[proficiencyLevel]?.name) {
      return contentPackage.teachingBots[proficiencyLevel].name;
    }
    // Dynamic fallback names based on content package or generic names
    const fallbackNames = {
      high: `Advanced ${contentPackage?.topic || 'Learning'} Instructor`,
      medium: `Intermediate ${contentPackage?.topic || 'Learning'} Instructor`, 
      low: `Foundational ${contentPackage?.topic || 'Learning'} Instructor`
    };
    return fallbackNames[proficiencyLevel] || "Teaching Assistant";
  };

  // Choose the appropriate initial message based on content package configuration
  const getInitialMessage = () => {
    // First try to get initial message from content package configuration
    if (contentPackage?.teachingBots?.[proficiencyLevel]?.config?.initialMessage) {
      return contentPackage.teachingBots[proficiencyLevel].config.initialMessage;
    }
    
    // Fallback for technical issues
    if (isUsingFallback) {
      return "Hello! I'm your specialized assistant for this part of the learning journey. (Note: The system is currently using a fallback assistant due to a technical issue. I'll still be able to help you with the learning material!) How can I help you with what you've just learned?";
    }
    
    // Generate dynamic message based on content package and level
    const teacherName = getTeacherName();
    const subject = contentPackage?.course?.replace('-', ' ') || 'this subject';
    
    const levelMessages = {
      high: `Hello! I'm ${teacherName}, and I'm here to help you apply what you've learned about ${subject} to more advanced scenarios. We'll explore complex real-world applications and deepen your understanding. Ready to dive into some challenging material?`,
      medium: `Hello! I'm ${teacherName}, and I'm here to help you strengthen your understanding of ${subject}. We'll work through some interesting scenarios to help you think more deeply about the concepts. Ready to get started?`,
      low: `Hello! I'm ${teacherName}, and I'm here to help you build a solid foundation in ${subject}. We'll work through some activities to make sure the key concepts really stick. Ready to learn together?`
    };
    
    return levelMessages[proficiencyLevel] || "Hello! I'm your specialized assistant for this part of the learning journey. I've been selected based on your assessment responses to provide you with targeted guidance. How can I help you with the material you've just learned?";
  };
  
  const initialMessage = getInitialMessage();
  
  // Use the teachingAssistance systemPrompt if available, otherwise use the default
  const activeSystemPrompt = teachingAssistance?.systemPrompt || systemPrompt;
  
  // Log which system prompt we're using
  console.log(`DynamicAssistantScreen using ${teachingAssistance ? 'Claude-specific' : 'default'} system prompt for level: ${proficiencyLevel}`);
  console.log(`System prompt length: ${activeSystemPrompt?.length || 0} characters`);
  console.log(`Teaching assistance data:`, teachingAssistance ? JSON.stringify(teachingAssistance, null, 2) : 'Not provided');
  
  // Use simple approach like article and assessment bots
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId] = useState(`claude-teaching-${Date.now()}`);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Simple send message function with teaching assistant support
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentStreamingMessage("");

    try {
      // Prepare the full conversation history like the assessment bot does
      const allMessages = [...messages, userMessage];
      
      const response = await fetch('/api/claude-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,  // Send full conversation history
          systemPrompt: activeSystemPrompt, // Pass the teaching system prompt from N8N
          threadId,
          assistantType: 'teaching'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let accumulatedContent = "";
      setIsTyping(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setCurrentStreamingMessage(accumulatedContent);
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulatedContent }]);
      setCurrentStreamingMessage("");
      setIsTyping(false);
    } catch (error) {
      console.error('Teaching chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' }]);
      setCurrentStreamingMessage("");
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset conversation on mount or when teachingAssistance changes to ensure system prompt is applied
  useEffect(() => {
    console.log("DynamicAssistantScreen mounted/updated - checking if conversation reset needed");
    console.log("Using system prompt with level:", proficiencyLevel);
    
    // Always ensure article is hidden on first load
    setShowArticle(false);
    
    // Check if we already have a teaching conversation in storage
    const existingTeachingMessages = globalStorage.getTeachingMessages();
    const windowTeachingMessages = window.__assessmentData?.teachingMessages;
    
    // Determine if we have a real conversation (more than just initial greeting) from either source
    const hasRealConversation = (messages: any[]) => {
      return messages && messages.length > 1 && 
             messages.some(msg => msg.role === 'user'); // At least one user message means real conversation
    };
    
    const existingIsReal = hasRealConversation(existingTeachingMessages);
    const windowIsReal = hasRealConversation(windowTeachingMessages);
    
    if (windowIsReal && windowTeachingMessages.length > (existingTeachingMessages?.length || 0)) {
      console.log("Found real teaching conversation in window with", windowTeachingMessages.length, "messages - preserving it");
      setMessages(windowTeachingMessages);
    } else if (existingIsReal) {
      console.log("Found real teaching conversation in storage with", existingTeachingMessages.length, "messages - preserving it");
      setMessages(existingTeachingMessages);
    } else {
      console.log("No real conversation found - starting fresh with initial message");
      // Clear existing messages and set the initial welcome
      setMessages([{
        role: 'assistant',
        content: initialMessage
      }]);
    }
  }, [teachingAssistance, initialMessage, proficiencyLevel]);
  
  // Store conversation in global storage for the feedback screen
  useEffect(() => {
    if (messages.length > 0) {
      // Store teaching messages directly without dynamic import
      globalStorage.setTeachingMessages(messages);
      console.log("🔴 GLOBAL STORAGE - Stored teaching conversation:", messages.length, "messages");
      
      // Log the stored messages for debugging
      console.log("🔴 GLOBAL STORAGE - Teaching messages content:", JSON.stringify(messages));
      
      // Also store in window.__assessmentData for backward compatibility
      if (!window.__assessmentData) {
        window.__assessmentData = {};
      }
      
      // Store the teaching messages
      window.__assessmentData.teachingMessages = messages;
      console.log("Stored teaching conversation in window object:", messages.length, "messages");
      
      // Verify storage
      const storedMessages = globalStorage.getTeachingMessages();
      console.log("🔴 VERIFICATION - Teaching messages after storage:", 
                 storedMessages ? storedMessages.length : 0, 
                 "messages retrieved");
    }
  }, [messages]);
  
  // Scroll chat container to bottom when new messages appear or when typing
  useEffect(() => {
    // Get the parent container that has the overflow-y-auto class
    const messageContainer = messagesEndRef.current?.closest('.overflow-y-auto');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
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
      
      // Ensure we're using the complete teaching conversation from storage
      const storedTeachingMessages = globalStorage.getTeachingMessages() || window.__assessmentData?.teachingMessages || messages;
      const storedAssessmentMessages = globalStorage.getAssessmentMessages() || assessmentConversation || [];
      
      // Debug: Log data being sent to grading endpoint
      console.log("📊 FRONTEND DEBUG - Sending to grading endpoint:");
      console.log("- Current messages count:", messages.length);
      console.log("- Stored teaching messages count:", storedTeachingMessages.length);
      console.log("- Assessment messages count:", storedAssessmentMessages.length);
      console.log("- Using stored teaching messages:", storedTeachingMessages.slice(0, 2));
      console.log("- Using assessment messages:", storedAssessmentMessages.slice(0, 2));
      
      // Store teaching conversation for transcript display
      globalStorage.setTeachingMessages(storedTeachingMessages);
      
      // Send both conversation datasets to Claude-based grading endpoint
      const response = await apiRequest("POST", "/api/grade-conversations", {
        teachingConversation: storedTeachingMessages,
        assessmentConversation: storedAssessmentMessages,
        contentPackage: contentPackage
      });
      
      const result = await response.json();
      console.log("Claude grading endpoint response:", result);
      
      let feedbackData = null;
      
      if (result.success) {
        console.log("Claude grading successful!");
        console.log("Feedback data received:", result.feedbackData);
        
        feedbackData = {
          summary: result.feedbackData.summary,
          contentKnowledgeScore: result.feedbackData.contentKnowledgeScore,
          writingScore: result.feedbackData.writingScore,
          nextSteps: result.feedbackData.nextSteps
        };
        
        // Store the feedback data in globalStorage  
        console.log("🔴 GLOBAL STORAGE - Storing Claude feedback data:", feedbackData);
        globalStorage.setFeedbackData(feedbackData);
        
      } else {
        console.log("Claude grading failed:", result.message);
        feedbackData = {
          summary: "Assessment completed but detailed feedback is not available.",
          contentKnowledgeScore: 2,
          writingScore: 2,
          nextSteps: "Continue exploring government concepts."
        };
        globalStorage.setFeedbackData(feedbackData);
      }
      
      // Navigate to feedback screen with the data
      console.log("⚠️ DEBUG CRITICAL - About to call onNext with feedbackData:", feedbackData);
      onNext(feedbackData);
    } catch (error) {
      console.error("Failed to grade conversations:", error);
      
      // Provide fallback feedback
      const fallbackData = {
        summary: "You've completed the learning session. Some feedback data couldn't be processed.",
        contentKnowledgeScore: 2,
        writingScore: 2,
        nextSteps: "Continue exploring government concepts."
      };
      
      globalStorage.setFeedbackData(fallbackData);
      onNext(fallbackData);
    } finally {
      setIsSendingToN8N(false);
    }
  };
  
  // Additional helper functions for teacher profiles
  
  const getTeacherImage = () => {
    // Always try to use content package avatar first
    if (contentPackage?.teachingBots?.[proficiencyLevel]?.avatar) {
      // Use the correct folder structure with "-level" suffix
      const folderName = `${proficiencyLevel}-level`;
      return `/content/${contentPackage.district}/${contentPackage.course}/${contentPackage.topic}/teaching-bots/${folderName}/${contentPackage.teachingBots[proficiencyLevel].avatar}`;
    }
    
    // Try to use a generic avatar based on level, or use placeholder
    return placeholderImage; // Generic fallback avatar
  };
  
  const getTeacherTitle = () => {
    if (contentPackage?.teachingBots?.[proficiencyLevel]?.role) {
      return contentPackage.teachingBots[proficiencyLevel].role;
    }
    // Dynamic titles based on content package subject/course
    const subject = contentPackage?.course?.replace('-', ' ') || 'Learning';
    const titles = {
      high: `Advanced ${subject} Specialist`,
      medium: `${subject} Instructor`, 
      low: `${subject} Learning Coach`
    };
    return titles[proficiencyLevel] || "Teaching Assistant";
  };
  
  const getTeacherDescription = () => {
    if (contentPackage?.teachingBots?.[proficiencyLevel]?.description) {
      return contentPackage.teachingBots[proficiencyLevel].description;
    }
    // Dynamic descriptions based on proficiency level and content
    const teacherName = getTeacherName();
    const subject = contentPackage?.course?.replace('-', ' ') || 'this subject';
    
    const descriptions = {
      high: `${teacherName} specializes in helping students apply core concepts to complex real-world cases. Known for drawing out deeper connections and challenging students to think critically about ${subject}.`,
      medium: `${teacherName} excels at helping students build on their foundational knowledge. Uses interesting scenarios to help students think about how ${subject} concepts apply in practice.`,
      low: `${teacherName} helps students build strong foundations in ${subject} concepts. Known for clear explanations, helpful analogies, and patient approach to learning.`
    };
    
    return descriptions[proficiencyLevel] || "Your specialized learning assistant has been selected to guide you through this material based on your assessment results.";
  };

  // Helper function to get guidance approach based on proficiency level
  const getGuidanceApproach = () => {
    const teacherName = getTeacherName().split(' ')[0]; // Get first name/title
    const subject = contentPackage?.course?.replace('-', ' ') || 'the subject material';
    
    const approaches = {
      high: `${teacherName} will challenge you to think critically about advanced ${subject} concepts and connections that go beyond the basics. You'll explore nuanced ideas and real-world applications.`,
      medium: `${teacherName} will help strengthen your understanding of ${subject} concepts, clarify any misunderstandings, and introduce more advanced ideas when you're ready.`,
      low: `${teacherName} will focus on building a solid foundation of key ${subject} concepts through clear explanations, helpful metaphors, and guided activities.`
    };
    
    return approaches[proficiencyLevel] || "Your learning assistant will guide you through the key concepts from the material you've just studied.";
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{contentPackage?.name ? `${contentPackage.name} - Teaching` : "Specialized Guidance"}</h1>
      
      <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-0">
        {/* Left column - Teacher profile or Article */}
        {proficiencyLevel !== "unknown" && (
          <div className={`${showArticle && proficiencyLevel === "high" ? 'md:w-3/5' : 'md:w-1/3'} flex flex-col transition-all duration-300`}>
            {(showArticle && proficiencyLevel === "high") ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 overflow-auto h-full flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {contentPackage?.teachingBots?.high?.config?.articleTitle || "Advanced Case Study"}
                  </h2>
                  <Button 
                    onClick={() => {
                      console.log("Back to Profile button clicked, hiding article...");
                      setShowArticle(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back to Profile
                  </Button>
                </div>
                <div className="flex-grow overflow-auto">
                  <iframe 
                    src={contentPackage?.teachingBots?.high?.config?.articleUrl || "/nixon-article.html"} 
                    className="w-full h-full border-0" 
                    title={contentPackage?.teachingBots?.high?.config?.articleTitle || "Advanced Case Study"} 
                  />
                </div>
              </div>
            ) : (
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
                  <h3 className="font-semibold text-gray-800 mb-2">Learning Focus</h3>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      proficiencyLevel === "high" ? "bg-green-500" :
                      proficiencyLevel === "medium" ? "bg-blue-500" :
                      proficiencyLevel === "low" ? "bg-amber-500" : "bg-gray-400"
                    }`}></div>
                    <p className="text-sm text-gray-700">
                      {contentPackage?.teachingBots?.[proficiencyLevel]?.config?.learningApproach || 
                       (proficiencyLevel === "high" ? "Advanced Analysis" :
                        proficiencyLevel === "medium" ? "Guided Exploration" :
                        proficiencyLevel === "low" ? "Foundational Building" : "Standard Approach")}
                    </p>
                  </div>
                </div>
                
                {/* Launch Article Button - Only for high proficiency level (Mrs. Parton) */}
                {proficiencyLevel === "high" && (
                  <div className="mt-6">
                    <hr className="my-4 border-gray-200" />
                    <Button
                      onClick={() => {
                        console.log("Launch Article button clicked, showing article...");
                        setShowArticle(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-all flex items-center justify-center"
                      disabled={showArticle}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {contentPackage?.teachingBots?.high?.config?.articleButtonText || "Launch Article"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Right column - Chat interface */}
        <div className={`${proficiencyLevel === "high" && showArticle ? 'md:w-2/5' : proficiencyLevel !== "unknown" ? 'md:w-2/3' : 'w-full'} flex-grow flex flex-col transition-all duration-300`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <h2 className="font-semibold text-lg text-gray-800">
                {getTeacherName()}
              </h2>
              
              {proficiencyLevel !== "unknown" && (
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    proficiencyLevel === "high" ? "bg-green-500" :
                    proficiencyLevel === "medium" ? "bg-blue-500" :
                    proficiencyLevel === "low" ? "bg-amber-500" : "bg-gray-400"
                  }`}></div>
                  <p className="text-sm text-gray-600">
                    {contentPackage?.teachingBots?.[proficiencyLevel]?.config?.assistanceLevel || 
                     (proficiencyLevel === "high" ? `Advanced ${contentPackage?.course?.replace('-', ' ') || 'level'} assistance` :
                      proficiencyLevel === "medium" ? `Intermediate ${contentPackage?.course?.replace('-', ' ') || 'level'} assistance` :
                      proficiencyLevel === "low" ? `Foundational ${contentPackage?.course?.replace('-', ' ') || 'level'} assistance` : "Standard assistance")}
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
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
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
                      {message.role === 'assistant' ? getTeacherName() : 'You'}
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
                      {getTeacherName()}
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
            
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
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
      
      {/* Navigation buttons positioned below content container */}
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
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}