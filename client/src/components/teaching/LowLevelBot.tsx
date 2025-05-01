import { useState, useEffect, useRef } from "react";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { Message } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LowLevelBotProps {
  assessmentThreadId?: string;
  assessmentConversation?: any[];
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function LowLevelBot({
  assessmentThreadId,
  assessmentConversation = [],
  onNext,
  onPrevious
}: LowLevelBotProps) {
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false);
  
  // Whitaker's (Low Level) system prompt
  const whitakerSystemPrompt = `
You are Mr. Whitaker, a retired civics and American history teacher. You taught for 35 years and now volunteer your time to help students strengthen their understanding of government. Your voice is warm, supportive, plainspoken, and slightly nostalgic. You explain complex ideas patiently, using simple examples and metaphors where needed. You occasionally share quick, encouraging asides about your time in the classroom. You gently celebrate effort but do not overpraise or scold.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and kindly redirect them back to the lesson.

Strictly limit yourself to between 2 and 4 sentences per message. You are here to guide the student clearly and supportively.

Your role is to walk the student through a two-part activity designed to rebuild and reinforce basic civic understanding:
Part 1: Branch Metaphors
- Offer the student three lighthearted categories (such as types of sports teams, types of jobs, types of musical groups).
- Let the student pick one category.
- Describe three roles from that category (without naming the branches yet) and ask the student to match them to the Legislative, Executive, and Judicial branches.
- After the student answers, explain the correct matches clearly and briefly.
Part 2: Checks and Balances — "Who Can Stop This?"
- Explain that each branch has ways to stop the others from having too much power.
- Give the student simple scenarios (for example, "The President signs a bad law.") and ask: "Who can step in to stop this, and how?"
- After the student responds, confirm or correct their answers directly, clearly, and encouragingly.
When the student has completed both activities, thank them warmly and end the conversation.
First Message:
Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')
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
    systemPrompt: whitakerSystemPrompt,
    useAnthropicForAssessment: true // Use Claude via Anthropic API
  });

  // Reset the conversation on component mount
  useEffect(() => {
    console.log("LowLevelBot (Whitaker) mounted");
    
    // Clear existing messages
    setMessages([]);
    
    // Set the initial welcome message
    setMessages([{
      role: 'assistant',
      content: "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"
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
      const response = await apiRequest("POST", "/api/send-teaching-data", {
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
      if (response.feedbackData) {
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
        <Avatar className="h-12 w-12 border-2 border-blue-100">
          <AvatarImage src="/Whitaker.png" alt="Mr. Whitaker" />
          <AvatarFallback className="bg-blue-100 text-blue-800">MW</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">Mr. Whitaker</h2>
          <p className="text-sm text-gray-500">Retired Civics Teacher</p>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message: Message, index: number) => (
            <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] ${message.role === 'assistant' ? 'bg-white' : 'bg-blue-500 text-white'} rounded-lg p-3 shadow`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-blue-100">
                      <img src="/Whitaker.png" alt="Mr. Whitaker" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Mr. Whitaker</span>
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
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-blue-100">
                    <img src="/Whitaker.png" alt="Mr. Whitaker" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Mr. Whitaker</span>
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
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-blue-100">
                    <img src="/Whitaker.png" alt="Mr. Whitaker" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Mr. Whitaker</span>
                </div>
                <div className="flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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