import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message } from '../lib/openai';

/**
 * Custom hook for the Article Chat screen that uses the dedicated Claude 3.7 endpoint
 */
export function useArticleChat(initialMessage?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize with an optional initial assistant message
  useEffect(() => {
    if (initialMessage) {
      setMessages([
        {
          role: 'assistant',
          content: initialMessage
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [initialMessage]);

  // Function to send a message to the article chat endpoint with streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      // Clear any previous abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Add user message to the chat
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      
      // Set status to loading
      setIsThinking(true);
      setStatus('loading');
      
      // Reset streaming state
      setStreamContent('');
      setIsStreaming(true);
      
      // Make the request to our dedicated article chat streaming endpoint
      const response = await fetch('/api/article-chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream reader not available');
      }
      
      let accumulatedContent = '';
      let threadId = '';
      
      // Read from the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Convert the Uint8Array to a string
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue; // End of stream marker
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setStreamContent(accumulatedContent);
              }
              
              if (parsed.threadId) {
                threadId = parsed.threadId;
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
      
      // Streaming is done, update the messages with the complete response
      const assistantMessage: Message = {
        role: 'assistant',
        content: accumulatedContent,
      };
      
      // Add the complete message to the messages array
      setMessages(prev => [...prev, assistantMessage]);
      
      // Reset streaming states
      setIsStreaming(false);
      setStreamContent('');
      setIsThinking(false);
      setStatus('idle');
      
    } catch (error: any) {
      // Only handle as an error if it's not an abort
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        setStatus('error');
        setIsThinking(false);
        setIsStreaming(false);
      }
    }
  }, [messages]);

  // Reset the conversation
  const resetConversation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setMessages(initialMessage 
      ? [{ role: 'assistant', content: initialMessage }] 
      : []);
    setStreamContent('');
    setIsStreaming(false);
    setIsThinking(false);
    setStatus('idle');
  }, [initialMessage]);

  // Abort the current request
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isThinking,
    status,
    sendMessage,
    resetConversation,
    abortRequest,
    isStreaming,
    streamContent
  };
}