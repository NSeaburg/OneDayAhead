import { useState, useEffect, useCallback } from "react";
import { useChatCompletion, Message } from "@/lib/openai";

interface UseChatMessagesProps {
  assistantId?: string;
  systemPrompt?: string;
  initialMessage?: string;
}

export function useChatMessages({ 
  assistantId, 
  systemPrompt,
  initialMessage
}: UseChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const { sendMessage: sendChatCompletion } = useChatCompletion();

  // Initialize with welcome message from the assistant if provided
  useEffect(() => {
    if (initialMessage) {
      setMessages([
        {
          role: "assistant",
          content: initialMessage
        }
      ]);
    }
  }, [initialMessage]);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message to the chat
    const userMessage: Message = { role: "user", content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state while waiting for response
    setIsLoading(true);
    
    try {
      // Get only conversation messages (no system message)
      const conversationMessages = [...messages, userMessage];
      
      // Get assistant response and threadId
      const [assistantResponseText, responseThreadId] = await sendChatCompletion(
        conversationMessages,
        systemPrompt,
        assistantId
      );
      
      // Store the thread ID if available
      if (responseThreadId) {
        setThreadId(responseThreadId);
      }
      
      // Add assistant response to the chat
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponseText
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message if request fails
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, there was an error processing your request. Please try again."
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sendChatCompletion, systemPrompt, assistantId]);

  return {
    messages,
    sendMessage,
    isLoading,
    threadId
  };
}
