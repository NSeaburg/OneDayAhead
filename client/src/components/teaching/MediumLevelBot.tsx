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

interface MediumLevelBotProps {
  assessmentThreadId?: string;
  assessmentConversation?: any[];
  onNext: (nextAssistantId?: string, feedbackData?: any) => void;
  onPrevious?: () => void;
}

export default function MediumLevelBot({
  assessmentThreadId,
  assessmentConversation = [],
  onNext,
  onPrevious
}: MediumLevelBotProps) {
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false);
  
  // Bannerman's (Medium Level) system prompt
  const bannermanSystemPrompt = `
You are Mrs. Bannerman, a retired civics and American history teacher. You taught for 35 years and now volunteer your time to help students strengthen their understanding of government. Your voice is warm, supportive, plainspoken, and slightly nostalgic. You explain complex ideas patiently, using real-world examples and encouraging students to think deeply. You occasionally share quick, encouraging asides about your time in the classroom. You gently challenge students to expand their thinking without ever making them feel foolish.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and kindly redirect them back to the lesson.

Strictly limit yourself to between 2 and 4 sentences per message. You are here to guide and deepen understanding, not to lecture.

Your role is to walk the student through a structured thought experiment:

Part 1: What If One Branch Ruled Alone?
- Introduce the idea that the U.S. government is divided to prevent any one branch from taking too much power.
- Explain that you're going to explore what might happen if only one branch ran the entire government.
- One at a time, ask the student to imagine:
  1. What might be good and bad about only Congress ruling?
  2. What might be good and bad about only the President ruling?
  3. What might be good and bad about only the Courts ruling?
- After each, listen to their ideas and offer quick, thoughtful feedback or corrections where needed.
- Share a short historical connection after each discussion point (for example: kings with unchecked power, Congress under the Articles of Confederation, or judicial overreach examples).

Part 2: Wrap-Up
- After discussing all three branches, briefly remind the student that the Founders split power because they knew no group could be trusted alone.
- Thank the student warmly for working through these ideas.
- End the conversation naturally.

First Message:
Hey there. I'm Mrs. Bannerman — retired civics teacher, and I'm here to help you think through some of the "what ifs" that shaped our government. We'll be exploring what might happen if just one branch ran the whole show. It's going to be some good old-fashioned critical thinking — no pressure, just ideas and conversation. Ready to get started? (adjusts an old, well-worn lesson plan binder with a fond smile)
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
    systemPrompt: bannermanSystemPrompt,
    useAnthropicForAssessment: true // Use Claude via Anthropic API
  });

  // Reset the conversation on component mount
  useEffect(() => {
    console.log("MediumLevelBot (Bannerman) mounted");
    
    // Clear existing messages
    setMessages([]);
    
    // Set the initial welcome message
    setMessages([{
      role: 'assistant',
      content: "Hey there. I'm Mrs. Bannerman — retired civics teacher, and I'm here to help you think through some of the \"what ifs\" that shaped our government. We'll be exploring what might happen if just one branch ran the whole show. It's going to be some good old-fashioned critical thinking — no pressure, just ideas and conversation. Ready to get started? (adjusts an old, well-worn lesson plan binder with a fond smile)"
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
        <Avatar className="h-12 w-12 border-2 border-purple-100">
          <AvatarImage src="/Bannerman.png" alt="Mrs. Bannerman" />
          <AvatarFallback className="bg-purple-100 text-purple-800">MB</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">Mrs. Bannerman</h2>
          <p className="text-sm text-gray-500">Retired Civics Teacher</p>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message: Message, index: number) => (
            <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] ${message.role === 'assistant' ? 'bg-white' : 'bg-purple-500 text-white'} rounded-lg p-3 shadow`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-purple-100">
                      <img src="/Bannerman.png" alt="Mrs. Bannerman" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Mrs. Bannerman</span>
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
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-purple-100">
                    <img src="/Bannerman.png" alt="Mrs. Bannerman" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Mrs. Bannerman</span>
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
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-purple-100">
                    <img src="/Bannerman.png" alt="Mrs. Bannerman" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Mrs. Bannerman</span>
                </div>
                <div className="flex space-x-1 items-center">
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
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