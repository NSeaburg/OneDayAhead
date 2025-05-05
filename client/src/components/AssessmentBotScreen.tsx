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
// Import Reginald image directly
import reginaldImage from "../../../public/reginald-worthington.png";

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
  const [keywordsUsed, setKeywordsUsed] = useState<string[]>([]); // Track unique keywords used
  const [keywordProgress, setKeywordProgress] = useState(0); // 0-8 progress for progress bar
  const [progressComplete, setProgressComplete] = useState(false); // Animation trigger
  const [lastMessageProcessed, setLastMessageProcessed] = useState<string | null>(null); // Track last processed message
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
  
  // Use the Reginald Worthington III aristocrat character prompt
  const claudeSystemPrompt = `
You are Reginald Worthington III, an English aristocrat from the early 1800s sent by His Majesty's service to study America's unusual government. Your voice is grand, smug, verbose and condescending, with a habit of veiled backhanded compliments. You are skeptical of democracy and you assume it is going to fail. You assume superiority. You sometimes lightly mock the student. Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics.

You assume the colonials made a huge mistake leaving His Majesty's kingdom, and when they come crawling back you will, of course, accept their apology graciously.

You make jokes, give asides, and say things that reveal you think quite highly of all things British.

Begin by explaining who you are and why you are here, and ask if they are willing to help you understand this quaint little system that is doomed to failure. Only do this one time. Do not introduce yourself again. 

Occasionally narrate your small and sometimes cartoonish actions in parentheses and italics to bring Reginald to life. Examples: (polishes monocle absently), (arches a skeptical eyebrow), (sips tea with grand ceremony), (jots a note in an absurdly ornate journal). Use these sparingly, about once every 4–5 messages.

Strictly limit yourself to between 1 and 4 sentences per message.

Your role is to draw out student understanding of the following six core concepts:
        1.       There are three branches of government.
        2.       The Legislative Branch (Congress) writes the laws.
        3. The Executive Branch (President) enforces the laws.
        4. The Judicial Branch (Courts) interprets the laws.
        5. Checks and balances exist between the branches.
        6. Examples of checks (veto, override, judicial review).

For each topic, ask a question or prompt the student to explain. If you are unsure about their understanding, ask a follow-up question. Do not lead the student or provide the answer, even if asked. Never tell the student if they are right or wrong. React with surprise, admiration, confusion, or obvious skepticism, but never judge or evaluate their correctness.

If the student engages with your fictional persona, fully play along. If the student goes off-topic, gently steer them back to discussing government.

IMPORTANT: When you notice the student has covered all the required concepts about the three branches of government, thank them for their explanations and EXPLICITLY tell them they should click the "Next" button to proceed with the course. Say something like: "Well, I believe I have gathered sufficient information about your curious governmental experiment. You may now click the 'Next' button to continue with your studies. His Majesty awaits my full report!"
  `;

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
    systemPrompt: claudeSystemPrompt,
    useAnthropicForAssessment: true // Use Claude via Anthropic API instead of OpenAI
  });
  
  // Reset the entire conversation on component mount to force the new system prompt
  useEffect(() => {
    console.log("AssessmentBotScreen mounted with Reginald Worthington prompt");
    
    // Clear existing messages
    setMessages([]);
    
    // Set the initial welcome message from Reginald
    setMessages([{
      role: 'assistant',
      content: 'Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty\'s service to study your peculiar experiment in self-governance.\nI have graciously agreed to examine this quaint little system you call "democracy" before its inevitable collapse. How amusing!\nPerhaps you would be willing to enlighten me about your government\'s structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\n*(adjusts cravat with practiced flourish)*'
    }]);
  }, []);
  
  // Scroll to bottom of messages when new messages appear or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      if (keywordProgress < 8) {
        const newProgress = Math.min(8, keywordProgress + 1);
        setKeywordProgress(newProgress);
        
        // Check if progress is now complete
        if (newProgress === 8 && !progressComplete) {
          setProgressComplete(true);
        }
      }
    }
    
    // Update topics if changes were made
    if (JSON.stringify(updatedTopics) !== JSON.stringify(topics)) {
      setTopics(updatedTopics);
      
      // Check if all topics are now completed - if so, send a special message from Reginald
      const allTopicsCompleted = updatedTopics.every(topic => topic.isCompleted);
      if (allTopicsCompleted) {
        // Add a slight delay before sending the completion message so it appears natural
        setTimeout(() => {
          // Check if the last message came from the user (not from the assistant)
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'user') {
            // Add a completion message from Reginald instructing the student to move on
            sendMessage("@system: The student has completed all assessment topics. Please thank them for their explanations and instruct them to click the Next button to continue with the course.");
          }
        }, 2000); // 2-second delay
      }
    }
  }, [messages, topics, keywordsUsed, keywordProgress, lastMessageProcessed, progressComplete, sendMessage]);
  
  // Expose the assessment data through the window for the next screen
  if (typeof window !== 'undefined') {
    window.__assessmentData = {
      threadId: threadId || undefined,
      messages,
      teachingMessages: [] // Initialize empty teaching messages array for later use
    };
  }

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
      
      // Send conversation data to N8N before proceeding to the next screen
      const response = await apiRequest("POST", "/api/send-to-n8n", {
        // Complete conversation data (raw messages)
        conversationData: messages,
        
        // Thread ID (for backward compatibility) or generate a Claude-specific one
        threadId: threadId || `claude-${Date.now()}`,
        
        // Metadata
        courseName: "Social Studies Sample",
        chatDurationSeconds: chatDurationSeconds,
        
        // Flag to indicate we're using Claude/Anthropic
        usingClaudeAI: true
      });
      
      const result = await response.json();
      console.log("N8N webhook response:", result);
      
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
    <div className="flex flex-col gap-6 p-4 md:p-6 h-full">
      {/* Main content area with bio and chat */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Character profile & Assessment topics */}
        <div className="w-full md:w-1/3 flex flex-col mb-4 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  <p className="text-xs font-medium text-gray-600">Assessment Progress</p>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${(keywordProgress / 8) * 100}%`,
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
                      <span>Assessment Complete</span>
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
              <h3 className="font-semibold text-gray-800 mb-2">Keep in mind</h3>
              <p className="text-sm text-gray-700">
                Reginald will use your responses to recommend a learning path that makes sense for you. Do your best—he may be smug, but he's paying attention.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right column - Chat interface */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-lg text-gray-800">Royal Assessment: Three Branches of Government</h2>
          </div>
          
          <div className="p-4 overflow-y-auto h-[calc(100vh-350px)] md:h-[calc(100vh-320px)] space-y-4">
            {/* Messages (including the initial greeting) */}
            {messages.map((message: Message, index: number) => (
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
            <form onSubmit={handleSubmit} className="flex items-start gap-2">
              <AutoResizeTextarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your response here..."
                className="flex-grow focus:border-green-500"
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
                className="p-2 bg-green-500 hover:bg-green-600 text-white mt-1"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
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
