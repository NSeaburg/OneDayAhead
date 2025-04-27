import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/lib/openai';

interface UseStreamingChatProps {
  assistantId?: string;
  systemPrompt?: string;
  initialMessage?: string;
  enableTypingAnimation?: boolean; // Flag to enable typing animation
}

export function useStreamingChat({
  assistantId,
  systemPrompt,
  initialMessage,
  enableTypingAnimation = false, // Disabled by default
}: UseStreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [fullMessage, setFullMessage] = useState<string>(''); // Store the full message for animation

  // Animation speed - characters per frame (higher = faster typing)
  const charsPerFrame = 6;

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
  
  // Handle typing animation effect
  useEffect(() => {
    if (!enableTypingAnimation || !fullMessage || !isTyping) return;
    
    let displayedLength = currentStreamingMessage.length;
    const maxLength = fullMessage.length;
    
    // If we're already showing everything, stop
    if (displayedLength >= maxLength) return;
    
    // Function to update displayed text with a few more characters
    const updateDisplayedText = () => {
      displayedLength = Math.min(displayedLength + charsPerFrame, maxLength);
      setCurrentStreamingMessage(fullMessage.substring(0, displayedLength));
      
      // Continue animation if we haven't shown all text
      if (displayedLength < maxLength) {
        animationFrameId = requestAnimationFrame(updateDisplayedText);
      }
    };
    
    // Start animation loop
    let animationFrameId = requestAnimationFrame(updateDisplayedText);
    
    // Cleanup animation on unmount or when dependencies change
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [fullMessage, isTyping, currentStreamingMessage, enableTypingAnimation]);

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
      setFullMessage('');
      
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
                // Accumulate content
                collectedResponse += parsed.content;
                
                if (enableTypingAnimation) {
                  // In typing animation mode, update the full message but let the animation effect handle display
                  setFullMessage(collectedResponse);
                  
                  // If this is the complete message, ensure animation starts from a reasonable point
                  if (parsed.isComplete && currentStreamingMessage.length === 0) {
                    // Start showing some initial text to give animation a head start
                    const initialLength = Math.min(30, collectedResponse.length);
                    setCurrentStreamingMessage(collectedResponse.substring(0, initialLength));
                  }
                } else {
                  // For non-animated mode, just display the accumulated content
                  if (parsed.isComplete || parsed.content.length > 200) {
                    setCurrentStreamingMessage(collectedResponse);
                  }
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
      
      // Wait a moment before updating to ensure animation completes
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        setCurrentStreamingMessage('');
        setFullMessage('');
        setIsTyping(false);
      }, enableTypingAnimation ? 500 : 0);
      
      return { message: assistantMessage, threadId };
    } catch (err: any) {
      console.error('Error in chat completion:', err);
      setError(err.message || 'Something went wrong');
      setIsTyping(false);
      setFullMessage('');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, assistantId, enableTypingAnimation]);

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