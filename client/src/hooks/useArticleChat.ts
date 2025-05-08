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

  // Function to send a message to the article chat endpoint
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
      
      // Make the request to our dedicated article chat endpoint
      const response = await fetch('/api/article-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };
      
      // Add assistant message to the chat
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
      setStatus('idle');
      
    } catch (error: any) {
      // Only handle as an error if it's not an abort
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        setStatus('error');
        setIsThinking(false);
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