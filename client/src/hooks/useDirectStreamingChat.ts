import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  role?: 'user' | 'assistant';
}

interface UseDirectStreamingChatProps {
  assistantType?: string;
  systemPrompt?: string;
  stageContext?: any;
  uploadedFiles?: any[];
}

// Direct DOM manipulation streaming chat to bypass React 18 batching
export function useDirectStreamingChat({
  assistantType = 'intake-basics',
  systemPrompt,
  stageContext,
  uploadedFiles
}: UseDirectStreamingChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingContentRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const currentStreamingIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (
    userMessage: Message | string,
    additionalContext?: any
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert string to Message object if needed
      const messageObj: Message = typeof userMessage === 'string' 
        ? {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: userMessage,
            isBot: false,
            timestamp: new Date(),
            role: 'user'
          }
        : userMessage;

      // Add user message
      setMessages(prev => [...prev, messageObj]);

      // Prepare messages for API
      const apiMessages = [
        ...messages.map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: messageObj.content }
      ];

      // Create request body
      const requestBody: any = {
        messages: apiMessages,
        assistantType,
        stageContext: { ...stageContext, ...additionalContext }
      };

      if (systemPrompt) requestBody.systemPrompt = systemPrompt;
      if (uploadedFiles) requestBody.uploadedFiles = uploadedFiles;

      console.log('🎯 Direct Streaming - Sending request:', { assistantType, messagesCount: apiMessages.length });

      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      // Create streaming message ID
      const streamingMessageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      currentStreamingIdRef.current = streamingMessageId;

      // Add placeholder message for streaming
      const streamingMessage: Message = {
        id: streamingMessageId,
        content: '',
        isBot: true,
        timestamp: new Date(),
        role: 'assistant'
      };
      setMessages(prev => [...prev, streamingMessage]);

      let fullContent = '';
      let hasStartedStreaming = false;

      console.log('🎯 Direct Streaming - Starting to read stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                if (!hasStartedStreaming) {
                  setIsLoading(false);
                  hasStartedStreaming = true;
                  console.log('🎯 Direct Streaming - First chunk received');
                }

                fullContent += parsed.content;
                
                // Direct DOM manipulation - bypass React batching
                const streamingDiv = streamingContentRef.current[streamingMessageId];
                if (streamingDiv) {
                  streamingDiv.textContent = fullContent;
                  console.log('🎯 Direct DOM update - chars:', fullContent.length);
                } else {
                  // Fallback to React state if DOM ref not available
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === streamingMessageId 
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      console.log('🎯 Direct Streaming - Stream complete, total chars:', fullContent.length);

      // Final update to ensure React state matches DOM
      if (fullContent) {
        const finalMessageId = `final-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...msg, id: finalMessageId, content: fullContent }
              : msg
          )
        );
        
        // Clean up ref
        delete streamingContentRef.current[streamingMessageId];
        currentStreamingIdRef.current = null;

        return fullContent;
      }

      return '';
    } catch (err: any) {
      console.error('Error in direct streaming chat:', err);
      setError(err.message || 'Something went wrong');
      
      // Remove failed streaming message
      if (currentStreamingIdRef.current) {
        setMessages(prev => prev.filter(msg => msg.id !== currentStreamingIdRef.current));
        delete streamingContentRef.current[currentStreamingIdRef.current!];
        currentStreamingIdRef.current = null;
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [messages, assistantType, systemPrompt, stageContext, uploadedFiles]);

  // Register DOM ref for a message
  const registerStreamingRef = useCallback((messageId: string, element: HTMLDivElement | null) => {
    if (element) {
      streamingContentRef.current[messageId] = element;
      console.log('🎯 Registered DOM ref for message:', messageId);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    streamingContentRef.current = {};
    currentStreamingIdRef.current = null;
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    registerStreamingRef,
    clearMessages,
    currentStreamingId: currentStreamingIdRef.current
  };
}