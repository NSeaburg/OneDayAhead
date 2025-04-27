import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/lib/openai';

interface UseStreamingChatProps {
  assistantId?: string;
  systemPrompt?: string;
  initialMessage?: string;
}

export function useStreamingChat({
  assistantId,
  systemPrompt,
  initialMessage,
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
      
      // Create event source for SSE (Server-Sent Events)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory,
          systemPrompt,
          assistantId,
          stream: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      
      // Handle the streaming response
      const reader = response.body?.getReader();
      let partialLine = '';
      let collectedResponse = '';
      
      if (!reader) {
        throw new Error('Stream reader not available');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Convert the uint8array to text
        const text = new TextDecoder().decode(value);
        const lines = (partialLine + text).split('\n\n');
        partialLine = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Stream is done
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                setError(parsed.error);
                continue;
              }
              
              if (parsed.threadId) {
                setThreadId(parsed.threadId);
                continue;
              }
              
              if (parsed.content) {
                // Check if this is a large content chunk (likely a full response)
                const isLargeChunk = parsed.content.length > 500;
                
                // For large chunks, set the full message immediately without animation
                if (isLargeChunk) {
                  console.log("Received large content chunk - skipping streaming animation");
                  collectedResponse = parsed.content; // Replace instead of append
                  setCurrentStreamingMessage(collectedResponse);
                  
                  // If it's a complete response, finish streaming right away
                  if (parsed.isComplete) {
                    break;
                  }
                } else {
                  // For smaller chunks, append and stream normally
                  collectedResponse += parsed.content;
                  setCurrentStreamingMessage(collectedResponse);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
      // Stream is complete, add the full response to messages
      const assistantMessage: Message = {
        role: 'assistant',
        content: collectedResponse
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setCurrentStreamingMessage('');
      setIsTyping(false);
      
      return { message: assistantMessage, threadId };
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
  };
}