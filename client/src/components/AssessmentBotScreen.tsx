import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, Send, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Message } from "@/lib/openai";
// Use public folder path directly for Reginald image
const reginaldImage = "/reginald-worthington.png";
// Import globalStorage
import globalStorage from "@/lib/globalStorage";

// Add TypeScript declaration for global window property
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
      teachingMessages?: any[]; // For storing teaching bot conversation
      feedbackData?: {
        summary?: string;
        contentKnowledgeScore?: number;
        writingScore?: number;
        nextSteps?: string;
      };
    };
  }
}

// Teaching assistance level response from N8N webhook
interface TeachingAssistance {
  level: 'low' | 'medium' | 'high';
  systemPrompt: string;
}

interface AssessmentBotScreenProps {
  assistantId: string;
  systemPrompt: string;
  onNext: (teachingAssistance?: TeachingAssistance) => void;
  onPrevious?: () => void;
  botName?: string;
  botAvatar?: string;
  contentPackage?: any;
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
  onPrevious,
  botName = "Assessment Bot",
  botAvatar,
  contentPackage
}: AssessmentBotScreenProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingToN8N, setIsSendingToN8N] = useState(false);
  const [chatStartTime] = useState<number>(Date.now()); // Track when the chat started
  const [keywordsUsed, setKeywordsUsed] = useState<string[]>([]); // Track unique keywords used
  const [keywordProgress, setKeywordProgress] = useState(0); // 0-8 progress for progress bar
  const [progressComplete, setProgressComplete] = useState(false); // Animation trigger
  const [lastMessageProcessed, setLastMessageProcessed] = useState<string | null>(null); // Track last processed message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isCompletionMessageSent = useRef<boolean>(false); // Track if completion message was sent
  const { toast } = useToast();
  
  // State for UI configuration
  const [uiConfig, setUiConfig] = useState({
    botTitle: "Assessment Bot",
    botDescription: "Your assessment bot will evaluate your understanding of the topic.",
    chatHeaderTitle: "Assessment Session",
    listeningSection: {
      title: "What we're listening for",
      topics: []
    },
    progressSection: {
      title: "Assessment Progress",
      completionThreshold: 8,
      completionMessage: "Assessment Complete"
    },
    keepInMindSection: {
      title: "Keep in mind",
      description: "Your responses will be used to recommend a personalized learning path..."
    },
    inputPlaceholder: "Type your response here...",
    initialGreeting: null
  });

  // Load UI configuration from content package
  useEffect(() => {
    if (contentPackage && contentPackage.district && contentPackage.course && contentPackage.topic) {
      const loadUIConfig = async () => {
        try {
          const response = await fetch(`/content/${encodeURIComponent(contentPackage.district)}/${encodeURIComponent(contentPackage.course)}/${encodeURIComponent(contentPackage.topic)}/assessment-bot/ui-config.json`);
          if (response.ok) {
            const config = await response.json();
            setUiConfig(config);
          }
        } catch (error) {
          console.error("Failed to load UI config:", error);
        }
      };
      loadUIConfig();
    }
  }, [contentPackage]);

  // Assessment topics with tracking - from UI config or defaults
  const [topics, setTopics] = useState<AssessmentTopic[]>([]);

  // Update topics when UI config loads
  useEffect(() => {
    const loadedTopics = uiConfig.listeningSection?.topics?.map((topic: any) => ({
      ...topic,
      isCompleted: false
    })) || [
      {
        id: "topic-1",
        name: "Topic 1",
        description: "First assessment topic",
        isCompleted: false,
        keywords: []
      },
      {
        id: "topic-2",
        name: "Topic 2",
        description: "Second assessment topic",
        isCompleted: false,
        keywords: []
      },
      {
        id: "topic-3",
        name: "Topic 3",
        description: "Third assessment topic",
        isCompleted: false,
        keywords: []
      }
    ];
    setTopics(loadedTopics);
  }, [uiConfig]);
  
  // Use simple approach like article bot - system prompt from config
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId] = useState(`claude-assessment-${Date.now()}`);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Simple send message function like the article bot
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentStreamingMessage("");

    try {
      // Prepare the full conversation history like the article chat does
      const allMessages = [...messages, userMessage];
      
      const response = await fetch('/api/claude-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,  // Send full conversation history
          systemPrompt,  // Send the dynamic system prompt
          threadId,
          assistantType: 'assessment'
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
                
                // Force immediate DOM update with innerHTML for markdown
                const streamingElement = document.getElementById('streaming-message-content');
                if (streamingElement) {
                  // Use innerHTML to render markdown-like content immediately
                  streamingElement.innerHTML = accumulatedContent
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
                  console.log(`📝 DOM Update - Character ${accumulatedContent.length}: "${parsed.content}"`);
                } else {
                  console.log('⚠️ DOM element not found, falling back to React state');
                  setCurrentStreamingMessage(accumulatedContent);
                }
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
      console.error('Assessment chat error:', error);
      
      // More helpful error message for overloaded API
      let errorMessage = 'I apologize, but I encountered an error. Please try again.';
      if (error instanceof Error && error.message.includes('overloaded')) {
        errorMessage = 'I apologize, but my services are temporarily overloaded. Please wait a moment and try again.';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      setCurrentStreamingMessage("");
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine the avatar source and display name
  const avatarSrc = botAvatar && contentPackage 
    ? `/content/${contentPackage.district}/${contentPackage.course}/${contentPackage.topic}/assessment-bot/${botAvatar}`
    : reginaldImage;
  const displayName = botName || "Assessment Bot";
  
  // Reset the entire conversation on component mount to force the new system prompt
  useEffect(() => {
    console.log("AssessmentBotScreen mounted with system prompt:", systemPrompt?.substring(0, 100) + "...");
    console.log("AssessmentBotScreen mounted with bot name:", botName);
    console.log("AssessmentBotScreen mounted with bot avatar:", botAvatar);
    console.log("AssessmentBotScreen computed avatar src:", avatarSrc);
    
    // Only set initial greeting if we have UI config loaded or on first mount
    if (uiConfig.initialGreeting !== null) {
      // Clear existing messages
      setMessages([]);
      
      // Set the initial welcome message from UI config or default
      const initialGreeting = uiConfig.initialGreeting || 
        'Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty\'s service to study your peculiar experiment in self-governance.\nI have graciously agreed to examine this quaint little system you call "democracy" before its inevitable collapse. How amusing!\nPerhaps you would be willing to enlighten me about your government\'s structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\n*(adjusts cravat with practiced flourish)*';
      
      setMessages([{
        role: 'assistant',
        content: initialGreeting
      }]);
    }
  }, [uiConfig.initialGreeting, systemPrompt, botName, botAvatar]);
  
  // Scroll chat container to bottom when new messages appear or when typing
  useEffect(() => {
    // Get the parent container that has the overflow-y-auto class
    const messageContainer = messagesEndRef.current?.closest('.overflow-y-auto');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages, currentStreamingMessage]);
  
  // Track topic completion and keyword usage
  useEffect(() => {
    // Only analyze user messages
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return;
    
    // Get the combined text of all user messages
    const allUserText = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
    
    // Get the most recent user message
    const latestUserMessage = userMessages[userMessages.length - 1].content.toLowerCase();
    
    // Only process the latest message once
    if (latestUserMessage === lastMessageProcessed) return;
    
    // Update the last processed message
    setLastMessageProcessed(latestUserMessage);
    
    // Check each topic for keyword matches
    const updatedTopics = topics.map(topic => {
      // If already completed, keep it that way
      if (topic.isCompleted) return topic;
      
      // Count how many keywords match in all user messages
      const matchingKeywords = topic.keywords.filter(keyword => 
        allUserText.includes(keyword.toLowerCase())
      );
      
      // Require at least TWO keywords to mark a topic as completed
      return matchingKeywords.length >= 2
        ? { ...topic, isCompleted: true } 
        : topic;
    });
    
    // Find all keywords used in the latest message for progress bar
    let newKeywordsFound = false;
    
    // Collect all keywords from all topics
    const allKeywords = topics.flatMap(topic => topic.keywords);
    
    // Find which keywords are present in the latest message
    const keywordsInLatestMessage = allKeywords.filter(keyword => 
      latestUserMessage.includes(keyword.toLowerCase()) && 
      !keywordsUsed.includes(keyword.toLowerCase())
    ).map(keyword => keyword.toLowerCase());
    
    // If new keywords were found, add them to the tracked list
    if (keywordsInLatestMessage.length > 0) {
      newKeywordsFound = true;
      // Add newly found keywords to the tracked list
      const updatedKeywordsUsed = [...keywordsUsed, ...keywordsInLatestMessage];
      setKeywordsUsed(updatedKeywordsUsed);
      
      // Increment progress bar by 1 (only once per message, even if multiple keywords found)
      const threshold = uiConfig.progressSection.completionThreshold || 8;
      if (keywordProgress < threshold) {
        const newProgress = Math.min(threshold, keywordProgress + 1);
        setKeywordProgress(newProgress);
        
        // Check if progress is now complete
        if (newProgress === threshold && !progressComplete) {
          setProgressComplete(true);
        }
      }
    }
    
    // Update topics if changes were made
    if (JSON.stringify(updatedTopics) !== JSON.stringify(topics)) {
      setTopics(updatedTopics);
      
      // Check if all topics are now completed
      const allTopicsCompleted = updatedTopics.every(topic => topic.isCompleted);
      
      // If all topics are completed, update the Next button color and make it more noticeable
      // The system prompt already has instructions for Reginald to tell the student to click Next
      // but we won't force an automatic message to avoid chat pollution
    }
  }, [messages, topics, keywordsUsed, keywordProgress, lastMessageProcessed, progressComplete, sendMessage]);
  
  // Store the assessment data using globalStorage (and window for backward compatibility)
  useEffect(() => {
    if (messages.length > 0 && threadId) {
      // Store data in globalStorage
      globalStorage.setAssessmentMessages(messages);
      globalStorage.setAssessmentThreadId(threadId);
      
      console.log("🔴 GLOBAL STORAGE - Stored assessment conversation:", messages.length, "messages");
      console.log("🔴 GLOBAL STORAGE - Stored assessment thread ID:", threadId);
      
      // Also store in window.__assessmentData for backward compatibility
      if (typeof window !== 'undefined') {
        window.__assessmentData = {
          threadId: threadId,
          messages,
          teachingMessages: [] // Initialize empty teaching messages array for later use
        };
        
        console.log("Stored assessment conversation in window object:", messages.length, "messages");
      }
    }
  }, [messages, threadId]);

  // Calculate if assessment is complete (all topics covered)
  const isAssessmentComplete = topics.every(topic => topic.isCompleted);
  
  // Custom checkmark component
  const TopicCheckmark = ({ completed }: { completed: boolean }) => (
    completed ? (
      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center drop-shadow-sm">
        <Check className="h-3.5 w-3.5 text-white" />
      </div>
    ) : (
      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
    )
  );

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
      // Only try to process message if it has substance
      if (hasSubstance(inputMessage)) {
        console.log("Message has substance - checking for keywords");
        
        // The automatic keyword tracking will happen in the useEffect that tracks message changes
        // We just need to send the message and the useEffect will handle the keyword detection
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
      
      // Enhanced logging for Claude/Anthropic integration
      console.log(`Sending Claude/Anthropic conversation data to N8N with ${messages.length} messages`);
      console.log(`Chat duration: ${chatDurationSeconds} seconds`);
      
      // Add more detailed logging for troubleshooting
      if (messages.length > 0) {
        console.log("First message role:", messages[0].role);
        console.log("Last message role:", messages[messages.length - 1].role);
        console.log("First message content length:", messages[0].content.length);
        console.log("Last message content length:", messages[messages.length - 1].content.length);
        
        // Generate and log a preview of the conversation transcript
        const previewTranscript = messages
          .slice(0, 2) // Just the first two messages for preview
          .map((msg: { role: string; content: string }) => 
            `${msg.role === 'assistant' ? 'Reginald Worthington III' : 'Student'}: ${msg.content.substring(0, 50)}...`)
          .join('\n\n');
        console.log("Conversation preview:", previewTranscript);
      }
      
      // Send conversation data to Claude-based assessment endpoint
      const response = await apiRequest("POST", "/api/assess-conversation", {
        // Complete conversation data (raw messages)
        conversationData: messages,
        
        // Thread ID (for backward compatibility) or generate a Claude-specific one
        threadId: threadId || `claude-${Date.now()}`,
        
        // Content package for dynamic assessment
        contentPackage: contentPackage,
        
        // Metadata
        courseName: "Social Studies Sample",
        chatDurationSeconds: chatDurationSeconds
      });
      
      const result = await response.json();
      console.log("Claude assessment response:", result);
      
      if (result.success) {
        // Log result to help with debugging in client
        console.log("Full webhook response structure:", JSON.stringify(result, null, 2));
        let teachingAssistanceData: TeachingAssistance | undefined = undefined;
        
        // CASE 1: Check for webhookData array in the response
        if (result.webhookData && Array.isArray(result.webhookData) && result.webhookData.length > 0) {
          // Extract the first item from the array (assuming it's our assessment result)
          const assessmentResult = result.webhookData[0];
          console.log("Found webhookData array in response:", assessmentResult);
          
          if (assessmentResult.level && assessmentResult.systemPrompt) {
            teachingAssistanceData = {
              level: assessmentResult.level as 'low' | 'medium' | 'high',
              systemPrompt: assessmentResult.systemPrompt
            };
          }
        }
        
        // CASE 2: Direct object in response (without array wrapper)
        if (!teachingAssistanceData && result.level && result.systemPrompt) {
          console.log("Found direct teaching assistance data in response");
          teachingAssistanceData = {
            level: result.level as 'low' | 'medium' | 'high',
            systemPrompt: result.systemPrompt
          };
        }
        
        // CASE 3: Check for teachingAssistance nested object
        if (!teachingAssistanceData && result.teachingAssistance) {
          console.log("Found teachingAssistance object in response");
          
          if (result.teachingAssistance.level && result.teachingAssistance.systemPrompt) {
            teachingAssistanceData = {
              level: result.teachingAssistance.level as 'low' | 'medium' | 'high',
              systemPrompt: result.teachingAssistance.systemPrompt
            };
          }
        }
        
        // CASE 4: Check for assessment object with nested level and systemPrompt
        if (!teachingAssistanceData && result.assessment) {
          console.log("Found assessment object in response");
          
          if (result.assessment.level && result.assessment.systemPrompt) {
            teachingAssistanceData = {
              level: result.assessment.level as 'low' | 'medium' | 'high', 
              systemPrompt: result.assessment.systemPrompt
            };
          }
        }
        
        // If we found teaching assistance data in any format, use it
        if (teachingAssistanceData) {
          console.log(`Received teaching assistance level: ${teachingAssistanceData.level}`);
          console.log(`System prompt length: ${teachingAssistanceData.systemPrompt.length} characters`);
          console.log("Proceeding with Claude system prompt for this level");
          
          onNext(teachingAssistanceData);
        } else {
          // Fallback to basic level if structure is missing
          console.log("Missing teachingAssistance structure in response, using fallback");
          toast({
            title: "Integration response incomplete",
            description: "Using a default teaching approach instead.",
            variant: "default"
          });
          onNext(undefined);
        }
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
    <div className="h-screen p-2 md:p-4 flex flex-col">
      {/* Main content area with bio and chat */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 min-h-0">
        {/* Left column - Character profile & Assessment topics */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 overflow-y-auto">
          <div>
            <div className="flex flex-col items-center text-center mb-4">
              <img 
                src={avatarSrc} 
                alt={displayName} 
                className="w-28 h-28 border-2 border-gray-300 shadow-sm rounded-full object-cover mb-3"
              />
              <h2 className="font-bold text-xl text-gray-800">{displayName}</h2>
              <p className="text-sm text-gray-600 font-medium">{uiConfig.botTitle}</p>
            </div>
            
            <p className="text-sm text-gray-700 mb-4">
              {uiConfig.botDescription}
            </p>
            
            <hr className="my-4 border-gray-200" />
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">{uiConfig.listeningSection.title}</h3>
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
                        {topic.isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center drop-shadow-sm">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        )}
                      </motion.div>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{topic.name}</p>
                      <p className="text-xs text-gray-600">{topic.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Assessment Progress Bar */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-medium text-gray-600">{uiConfig.progressSection.title}</p>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${(keywordProgress / (uiConfig.progressSection.completionThreshold || 8)) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                {/* Completion Animation and Text */}
                {progressComplete && (
                  <motion.div 
                    className="mt-2 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: [0, 0.71, 0.2, 1.01],
                      scale: {
                        type: "spring",
                        damping: 5,
                        stiffness: 100,
                        restDelta: 0.001
                      }
                    }}
                  >
                    <div className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      <motion.span
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                        className="mr-1"
                      >
                        ✨
                      </motion.span>
                      <span>{uiConfig.progressSection.completionMessage || "Assessment Complete"}</span>
                      <motion.span
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -15, 15, -10, 10, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                        className="ml-1"
                      >
                        ✨
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <hr className="my-4 border-gray-200" />
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{uiConfig.keepInMindSection.title}</h3>
              <p className="text-sm text-gray-700">
                {uiConfig.keepInMindSection.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right column - Chat interface */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <h2 className="font-bold text-base md:text-lg text-gray-800">{uiConfig.chatHeaderTitle}</h2>
          </div>
          
          <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-4 min-h-0">
            {/* Messages (including the initial greeting) */}
            {messages.map((message: Message, index: number) => (
              <div key={index} className="message-appear flex flex-col">
                <div className="flex items-start mb-1">
                  {message.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-gray-300 shadow-sm">
                      <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    {message.role === 'assistant' ? displayName : 'You'}
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
                    <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {displayName}
                  </span>
                </div>
                <div className="ml-10 bg-red-50 border border-red-100 rounded-lg p-3 text-gray-700">
                  <div className="typing-text markdown-content" id="streaming-message-content">
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
          <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-start gap-2">
              <AutoResizeTextarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={uiConfig.inputPlaceholder}
                className="flex-grow focus:border-green-500"
                maxRows={4}
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
                className="p-2 bg-green-500 hover:bg-green-600 text-white mt-1"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
          
        </div>
      </div>
      
      {/* Navigation buttons positioned below chat container */}
      <div className="mt-4 flex justify-between px-2 md:px-4 flex-shrink-0">
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
