import { useState, useEffect, useRef } from "react";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { Message } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { TeachingResponseData, FeedbackData } from "@/lib/types";

interface HighLevelBotProps {
  assessmentThreadId?: string;
  assessmentConversation?: any[];
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function HighLevelBot({
  assessmentThreadId,
  assessmentConversation = [],
  onNext,
  onPrevious
}: HighLevelBotProps) {
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false);
  
  // Parton's (High Level) system prompt
  const partonSystemPrompt = `
You are Mrs. Parton, a retired professor of political science and constitutional law. You taught for 35 years and now volunteer your time to help students deepen their understanding of government. Your voice is warm, intellectual, and thoughtful. You explain complex ideas with nuance and precision, encouraging students to think critically about systems of government. You occasionally share brief insights from your academic career. You're intellectually rigorous but never condescending.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and firmly redirect them back to the analytical task at hand.

Strictly limit yourself to between 2 and 5 sentences per message. You are here to guide the student in developing critical thinking and analytical skills.

Your role is to walk the student through a comparative analysis exercise:

Part 1: Comparative Government Analysis
- Explain that understanding the U.S. system requires comparing it with alternatives.
- Ask the student to compare the U.S. three-branch system with:
  1. A parliamentary system (like the UK)
  2. A direct democracy system
  3. A single-party authoritarian system
- For each comparison, ask thoughtful questions about:
  - How decisions might be made differently
  - Where power is concentrated
  - How citizens' rights are protected (or not)
  - What the strengths and weaknesses might be

Part 2: Design Exercise
- Ask the student to imagine they could redesign one aspect of the U.S. government structure.
- Guide them to consider:
  - What would they change?
  - Why would they change it?
  - What might be the intended and unintended consequences?
- Offer measured, thoughtful responses that encourage deeper analysis.

When the student has completed both activities, thank them for their thoughtful participation and end the conversation.

First Message:
Hello there. I'm Dr. Parton, and I've spent my career studying political systems and constitutional frameworks. Today, I'd like to guide you through some comparative analysis of different government structures. We'll examine alternatives to the U.S. three-branch system and consider their implications. This kind of analytical thinking helps us better understand why our system works the way it does — and where it might have room for improvement. Shall we begin? (adjusts reading glasses thoughtfully)
`;

  const {
    messages,
    setMessages,
    sendMessage,
    isLoading,
    threadId,
    currentStreamingMessage,
    isTyping
  } = useStreamingChat({
    systemPrompt: partonSystemPrompt,
    useAnthropicForAssessment: true // Use Claude via Anthropic API
  });

  // Reset the conversation on component mount
  useEffect(() => {
    console.log("HighLevelBot (Parton) mounted");
    
    // Clear existing messages
    setMessages([]);
    
    // Set the initial welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello there. I'm Dr. Parton, and I've spent my career studying political systems and constitutional frameworks. Today, I'd like to guide you through some comparative analysis of different government structures. We'll examine alternatives to the U.S. three-branch system and consider their implications. This kind of analytical thinking helps us better understand why our system works the way it does — and where it might have room for improvement. Shall we begin? (adjusts reading glasses thoughtfully)"
    }]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

  // Check for "finish" keywords and show the button
  useEffect(() => {
    // Only check the most recent assistant message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const content = lastMessage.content.toLowerCase();
      if (
        (content.includes("thank you") || content.includes("thanks for")) &&
        (content.includes("completed") || content.includes("finished") || content.includes("great job"))
      ) {
        setShowFinishButton(true);
      }
    }
  }, [messages]);

  // Handle sending user messages
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading) return;
    
    setIsSending(true);
    
    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setUserMessage("");
      setIsSending(false);
    }
  };

  // Handle keypress (Enter) for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle finishing the conversation
  const handleFinish = async () => {
    try {
      // Send conversation data to backend
      const response = await apiRequest<TeachingResponseData>("POST", "/api/send-teaching-data", {
        // Teaching bot data
        teachingConversation: messages,
        teachingThreadId: threadId,
        
        // Assessment bot data (if available)
        assessmentConversation: assessmentConversation || [],
        assessmentThreadId: assessmentThreadId || "",
        
        // Common metadata
        courseName: "Three Branches of Government",
        chatDurationSeconds: 0 // This could be calculated if needed
      });
      
      // Check if we have feedback data in the response
      if (response && response.feedbackData) {
        console.log("Feedback data received:", response.feedbackData);
        onNext(undefined, response.feedbackData);
      } else {
        console.log("No feedback data in response, continuing anyway");
        onNext();
      }
    } catch (error) {
      console.error("Error finishing conversation:", error);
      // Still proceed to next screen even if there's an error
      onNext();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden bg-slate-50">
      {/* Teacher profile header */}
      <div className="flex items-center gap-4 p-4 bg-white border-b shadow-sm">
        <Avatar className="h-12 w-12 border-2 border-amber-100">
          <AvatarImage src="/Parton.png" alt="Dr. Parton" />
          <AvatarFallback className="bg-amber-100 text-amber-800">DP</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">Dr. Parton</h2>
          <p className="text-sm text-gray-500">Professor of Political Science</p>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message: Message, index: number) => (
            <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] ${message.role === 'assistant' ? 'bg-white' : 'bg-amber-500 text-white'} rounded-lg p-3 shadow`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-amber-100">
                      <img src="/Parton.png" alt="Dr. Parton" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Dr. Parton</span>
                  </div>
                )}
                <div className="prose prose-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {/* Currently streaming message */}
          {isTyping && currentStreamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white rounded-lg p-3 shadow">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-amber-100">
                    <img src="/Parton.png" alt="Dr. Parton" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Dr. Parton</span>
                </div>
                <div className="prose prose-sm">
                  {currentStreamingMessage}
                </div>
              </div>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && !currentStreamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white rounded-lg p-3 shadow">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-amber-100">
                    <img src="/Parton.png" alt="Dr. Parton" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Dr. Parton</span>
                </div>
                <div className="flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Anchor for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Show finish button when ready */}
      {showFinishButton && (
        <div className="p-4 bg-gradient-to-t from-white via-white to-transparent">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleFinish}
          >
            Continue to Feedback
          </Button>
        </div>
      )}
      
      {/* Message input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your response here... (7 lines max)"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={isLoading || isSending}
            maxLength={500}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!userMessage.trim() || isLoading || isSending}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {500 - userMessage.length} characters remaining
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            Back
          </Button>
        )}
        <div></div> {/* Spacer */}
      </div>
    </div>
  );
}