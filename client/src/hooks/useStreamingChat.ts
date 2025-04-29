import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/lib/openai';
import { streamChatCompletionWithClaude } from '@/lib/anthropic';

interface UseStreamingChatProps {
  assistantId?: string;
  systemPrompt?: string;
  initialMessage?: string;
  useAnthropicForAssessment?: boolean; // Keeping for backward compatibility, but now using Claude by default
}

export function useStreamingChat({
  assistantId,
  systemPrompt,
  initialMessage,
  useAnthropicForAssessment = false,
}: UseStreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with initial message if provided
  useEffect(() => {
    if (initialMessage) {
      const initialUserMessage: Message = { 
        role: 'user', 
        content: initialMessage 
      };
      setMessages([initialUserMessage]);
    }
  }, [initialMessage]);

  // Function to send a message and get a streaming response
  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to the messages array
      const userMessage: Message = { role: 'user', content };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Prepare message history for the API
      const messageHistory = [...messages, userMessage];
      
      // Start typing animation
      setIsTyping(true);
      setCurrentStreamingMessage('');
      
      // We're now using Anthropic/Claude for all assistants
      // The useAnthropicForAssessment parameter is kept for backward compatibility
      try {
        let collectedResponse = '';
        
        console.log("Sending system prompt to Claude:", systemPrompt);
        
        const result = await streamChatCompletionWithClaude(
          { 
            messages: messageHistory,
            systemPrompt
          },
          // Handle each chunk of the stream
          (chunk) => {
            collectedResponse += chunk;
            setCurrentStreamingMessage(collectedResponse);
          },
          // Handle completion
          (fullMessage) => {
            // Add the complete assistant message
            const assistantMessage: Message = {
              role: 'assistant',
              content: fullMessage,
            };
            
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
            setIsTyping(false);
            setCurrentStreamingMessage('');
          }
        );
        
        if (result.threadId) {
          setThreadId(result.threadId);
        }
        
        // Return a basic result structure for consistency
        return { 
          message: { role: 'assistant', content: collectedResponse },
          threadId: result.threadId
        };
      } catch (error) {
        console.error('Error with Anthropic API:', error);
        throw error;
      }
    } catch (err: any) {
      console.error('Error in chat completion:', err);
      setError(err.message || 'Something went wrong');
      setIsTyping(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, assistantId]);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    threadId,
    currentStreamingMessage,
    isTyping,
    setMessages, // Export this for components that need it
  };
}