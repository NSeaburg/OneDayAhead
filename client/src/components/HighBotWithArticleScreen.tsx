import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send, User } from "lucide-react";

// Import Mrs. Parton image directly (same as AssessmentBotScreen)
import mrsPartonImage from "../../../public/Parton.png";
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

interface HighBotWithArticleScreenProps {
  assistantId: string;
  systemPrompt: string;
  articleUrl: string;
  assessmentThreadId?: string;
  assessmentConversation?: any[];
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function HighBotWithArticleScreen({ 
  assistantId,
  systemPrompt,
  articleUrl,
  assessmentThreadId,
  assessmentConversation,
  onNext,
  onPrevious
}: HighBotWithArticleScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingToN8N, setIsSendingToN8N] = useState(false);
  const [chatStartTime] = useState<number>(Date.now()); // Track when the chat started
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Check if this is using a fallback assistant ID (not starting with "asst_")
  const isUsingFallback = !assistantId.startsWith("asst_");
  
  // Choose the appropriate initial message based on whether we're using a fallback
  const initialMessage = isUsingFallback
    ? "Hello! I'm your specialized High Bot assistant for this part of the learning journey. I'll be discussing the article about the United States v. Nixon case that appears on the left. Feel free to ask any questions about the case or the checks and balances in the U.S. government."
    : "Welcome, young scholars! I'm Mrs. Parton, your retired civics teacher who's still passionate about helping students understand how our government actually works in practice. Today we'll analyze the fascinating United States v. Nixon case to see our three branches of government in action during a real constitutional crisis.\nI believe you're perfectly capable of thoughtful analysis with just a little guidance. We'll keep our discussion focused and meaningful, without lengthy lectures - I promise! I'm here to help you connect what you've learned to how democracy functions when tested in the real world.";
  
  // Log which system prompt we're using
  console.log(`HighBotWithArticleScreen using system prompt with length: ${systemPrompt?.length || 0} characters`);
  
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
    systemPrompt,
    initialMessage,
    useAnthropicForAssessment: true // Ensure we're using Claude exclusively
  });
  
  // Reset conversation on mount to ensure system prompt is applied
  useEffect(() => {
    console.log("HighBotWithArticleScreen mounted - resetting conversation to ensure proper system prompt");
    
    // Clear existing messages and set the initial welcome
    setMessages([{
      role: 'assistant',
      content: initialMessage
    }]);
  }, []);
  
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
      console.log("High Bot N8N integration result:", result);
      console.log("High Bot Thread ID:", threadId);
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
        console.log("High Bot N8N integration failed:", result.message);
        
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
      console.error("Failed to send High Bot data to N8N:", error);
      
      // Show error toast
      toast({
        title: "Error sending conversation data",
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">United States v. Nixon: A Case Study</h1>
      
      {/* Side by side layout for article and chat */}
      <div className="flex flex-col md:flex-row gap-4 flex-grow">
        {/* Article on the left */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-lg text-gray-800">Article</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-320px)] md:h-[calc(100vh-290px)]">
            <div className="article-content prose max-w-none">
              <h1>United States v. Nixon: A Case Study in Checks and Balances</h1>

              <h2>Background</h2>
              <p>In the early 1970s, a major political scandal known as the Watergate scandal rocked the United States. During the 1972 presidential election, operatives connected to President Richard Nixon's re-election campaign were caught breaking into the Democratic Party's headquarters at the Watergate building. Investigators uncovered efforts to cover up the break-in, leading to questions about how far the wrongdoing reached. As the investigation moved forward, it became clear that secret recordings of conversations inside the White House might contain crucial evidence.</p>

              <h2>The Case</h2>
              <p>A special prosecutor investigating the scandal demanded access to the White House tapes. President Nixon refused, claiming "executive privilege"—the idea that the President could withhold certain information to protect the confidentiality of internal discussions. Nixon argued that turning over the tapes would weaken the Presidency and violate the separation of powers. The case quickly escalated to the United States Supreme Court, raising critical questions about whether any branch of government could limit the President's power to keep secrets.</p>

              <h2>The Ruling</h2>
              <p>In 1974, the Supreme Court issued a unanimous decision against President Nixon. The Court ruled that executive privilege is not absolute and cannot be used to block evidence needed for a criminal trial. Nixon was ordered to turn over the tapes. Within days, the tapes revealed serious misconduct, and Nixon resigned from office. The case demonstrated how all three branches—Congress investigating, the Courts ruling, and the President resisting—interacted under the Constitution. It remains a landmark example of how checks and balances work, even at the highest levels of government.</p>
            </div>
          </div>
        </div>
        
        {/* High Bot chat on the right */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                <img 
                  src={mrsPartonImage} 
                  alt="Mrs. Parton" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-800">Mrs. Parton</h2>
                {isUsingFallback ? (
                  <p className="text-sm text-amber-600 font-medium">
                    Using fallback assistant
                  </p>
                ) : (
                  <p className="text-xs text-gray-600">
                    Advanced Civics Educator
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-320px)] md:h-[calc(100vh-290px)] space-y-4">
            {/* Regular messages */}
            {messages.map((message, index) => (
              <div key={index} className="message-appear flex flex-col">
                <div className="flex items-start mb-1">
                  {message.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                      <img 
                        src={mrsPartonImage} 
                        alt="Mrs. Parton" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    {message.role === 'assistant' ? 'Mrs. Parton' : 'You'}
                  </span>
                </div>
                <div className={`ml-10 ${
                  message.role === 'assistant' 
                    ? 'bg-purple-50 border border-purple-100' 
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
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                    <img 
                      src={mrsPartonImage} 
                      alt="Mrs. Parton" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Mrs. Parton
                  </span>
                </div>
                <div className="ml-10 bg-purple-50 border border-purple-100 rounded-lg p-3 text-gray-700">
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
                placeholder="Ask about the article..."
                className="flex-grow focus:border-purple-500"
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
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white mt-1"
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