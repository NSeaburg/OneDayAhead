import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
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

// Topics to be covered in the assessment
interface AssessmentTopic {
  id: string;
  name: string;
  description: string;
  isCompleted: boolean;
  keywords: string[];
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
  
  // Assessment topics with tracking
  const [topics, setTopics] = useState<AssessmentTopic[]>([
    {
      id: "governmental-structure",
      name: "Governmental Structure",
      description: "Can you clearly explain how power is divided into three branches?",
      isCompleted: false,
      keywords: ["executive", "legislative", "judicial", "branch", "congress", "president", "court", "separation", "powers", "division"]
    },
    {
      id: "checks-balances",
      name: "The System of Checks and Balances",
      description: "Do you understand how the branches hold each other in check?",
      isCompleted: false,
      keywords: ["checks", "balances", "veto", "override", "impeach", "review", "constitutional", "control", "limit", "power"]
    },
    {
      id: "branch-roles",
      name: "Roles of the Branches",
      description: "Can you describe what Congress, the President, and the Courts actually do?",
      isCompleted: false,
      keywords: ["make laws", "execute", "enforce", "interpret", "appoint", "nominate", "approve", "legislation", "decisions", "judges", "supreme court", "laws", "bills", "executive branch", "legislative branch", "judicial branch", "pass laws", "enforces laws", "implementing", "lawmaking"]
    }
  ]);
  
  // Store greeting message locally for display
  const [showGreeting, setShowGreeting] = useState(true);
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    threadId, 
    currentStreamingMessage, 
    isTyping 
  } = useStreamingChat({
    assistantId,
    systemPrompt
  });
  
  // Combine greeting and regular messages for display
  // This will show the greeting as an assistant message without actually modifying the messages array
  const displayMessages = showGreeting && messages.length === 0 
    ? [{ role: 'assistant', content: 'Greetings, subject— ah, I mean, citizen.' }] 
    : messages;
  
  // Scroll to bottom of messages when new messages appear or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);
  
  // Track topic completion based on user messages
  useEffect(() => {
    // Only analyze user messages
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return;
    
    // Get the combined text of all user messages
    const allUserText = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
    
    // Check each topic for completion
    const updatedTopics = topics.map(topic => {
      // If already completed, keep it that way
      if (topic.isCompleted) return topic;
      
      // Check if this message covers the topic
      const matchesKeywords = topic.keywords.some(keyword => 
        allUserText.includes(keyword.toLowerCase())
      );
      
      // Return updated topic if matches found
      return matchesKeywords 
        ? { ...topic, isCompleted: true } 
        : topic;
    });
    
    // Update topics if changes were made
    if (JSON.stringify(updatedTopics) !== JSON.stringify(topics)) {
      setTopics(updatedTopics);
    }
  }, [messages, topics]);
  
  // Expose the assessment data through the window for the next screen
  if (typeof window !== 'undefined') {
    window.__assessmentData = {
      threadId: threadId || undefined,
      messages
    };
  }

  // Calculate if assessment is complete (all topics covered)
  const isAssessmentComplete = topics.every(topic => topic.isCompleted);

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
      // Hide greeting after first message
      if (showGreeting) {
        setShowGreeting(false);
      }
      
      // Only try to process message if it has substance
      if (hasSubstance(inputMessage)) {
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
        courseName: "Three Branches of Government", // Add the course name
        chatDurationSeconds: chatDurationSeconds // Add the chat duration in seconds
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Pass the nextAssistantId when navigating to the next screen
        const nextAssistantId = result.nextAssistantId;
        onNext(nextAssistantId);
      } else {
        // Handle the case where N8N returned a non-error response but with success: false
        toast({
          title: "Integration issue",
          description: "There was an issue with the workflow, but you can continue with a fallback assistant.",
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
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 h-full">
      {/* Left column - Character profile & Assessment topics */}
      <div className="md:w-1/3 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex flex-col items-center text-center mb-4">
            <img 
              src={reginaldImage} 
              alt="Reginald Worthington III" 
              className="w-28 h-28 border-2 border-gray-300 shadow-sm rounded-full object-cover mb-3"
            />
            <h2 className="font-bold text-xl text-gray-800">Reginald Worthington III</h2>
            <p className="text-sm text-gray-600 font-medium">Aristocratic Observer</p>
          </div>
          
          <p className="text-sm text-gray-700 mb-4">
            Dispatched by His Majesty's service in the early 1800s to evaluate this curious colonial experiment known as "democracy." He arrives skeptical, impeccably dressed, and absolutely certain you'll come to your senses and return to the Crown—once you've explained how this whole "no king" business is supposed to work. He is fully expecting you to explain (and perhaps reconsider) your little Revolution.
          </p>
          
          <hr className="my-4 border-gray-200" />
          
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">What he's listening for</h3>
            <ul className="space-y-3">
              {topics.map((topic) => (
                <li key={topic.id} className="flex items-start">
                  <div className="mr-2 mt-0.5 flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0.7 }}
                      animate={{ 
                        opacity: 1,
                        scale: topic.isCompleted ? [1, 1.2, 1] : 1,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <CheckCircle 
                        className={`h-5 w-5 ${
                          topic.isCompleted 
                            ? 'text-green-500 fill-green-500 stroke-[1.5] drop-shadow-sm' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </motion.div>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{topic.name}</p>
                    <p className="text-xs text-gray-600">{topic.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <hr className="my-4 border-gray-200" />
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Keep in mind</h3>
            <p className="text-sm text-gray-700">
              Reginald will use your responses to recommend a learning path that makes sense for you. Do your best—he may be smug, but he's paying attention.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right column - Chat interface */}
      <div className="md:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">Royal Assessment: Three Branches of Government</h2>
        </div>
        
        <div className="p-4 overflow-y-auto h-[calc(100vh-350px)] md:h-[calc(100vh-320px)] space-y-4">
          {/* Messages (including simulated greeting if no messages yet) */}
          {displayMessages.map((message, index) => (
            <div key={index} className="message-appear flex flex-col">
              <div className="flex items-start mb-1">
                {message.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                    <img src={reginaldImage} alt="RW" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <User className="h-4 w-4" />
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
          
          {/* Streaming message */}
          {isTyping && currentStreamingMessage && (
            <div className="flex flex-col">
              <div className="flex items-start mb-1">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                  <img src={reginaldImage} alt="RW" className="w-full h-full object-cover" />
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
        
        {/* Input area */}
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
      
      {/* Navigation buttons */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-between">
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
