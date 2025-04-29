import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/lib/openai';
import { streamChatCompletionWithClaude } from '@/lib/anthropic';

interface UseStreamingChatProps {
  assistantId?: string;
  systemPrompt?: string;
  initialMessage?: string;
  useAnthropicForAssessment?: boolean;
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
      
      // For the assessment bot, use Anthropic Claude directly from browser
      if (useAnthropicForAssessment) {
        try {
          let collectedResponse = '';
          
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
      } else {
        // Use the server-side API for OpenAI streaming (for other assistants)
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
        
        // Get the thread ID from the headers
        const responseThreadId = response.headers.get('X-Thread-Id');
        if (responseThreadId) {
          setThreadId(responseThreadId);
        }
        
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
                  // For token-by-token streaming, handle formatting
                  collectedResponse += parsed.content;
                  
                  // Update the UI immediately with each token
                  // We preserve the formatting on the client side as well
                  setCurrentStreamingMessage(collectedResponse);
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
        
        return { message: assistantMessage, threadId: responseThreadId || null };
      }
    } catch (err: any) {
      console.error('Error in chat completion:', err);
      setError(err.message || 'Something went wrong');
      setIsTyping(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, assistantId, useAnthropicForAssessment]);

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