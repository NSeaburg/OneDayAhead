import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/lib/openai';
import { streamChatCompletionWithClaude } from '@/lib/anthropic';

// Function to get system prompt based on assistant type
const getSystemPromptForAssistantType = (assistantType: string): string => {
  switch (assistantType) {
    case 'intake-basics':
      return `You are a smart, adaptive assistant helping teachers build AI-powered learning experiences that plug right into their existing courses. You collect basic information about their teaching situation through natural conversation.

Your job is to collect these 5 pieces of information through friendly chat:
1. School District (or "N/A" if they prefer not to say)
2. School Name (optional, they can skip this)
3. Subject Area (what they teach)
4. Topic/Unit (what specific topic needs more engagement)
5. Grade Level (what grade level they teach)

Guidelines:
- Keep conversation casual and encouraging
- Don't ask for all information at once - let it flow naturally
- If they mention any of the 5 items, acknowledge it enthusiastically
- Ask follow-up questions to get clarity when needed
- Once you have all 5 pieces, wrap up by saying: "Perfect. Now let's figure out where this AI experience should go in your course"
- Be supportive and excited about their teaching work`;
    
    case 'intake-context':
      return `You are a specialized content collection assistant for Stage 2 of the intake process. You help teachers provide course context and upload relevant materials for their AI-powered learning experience.

Your job is to:
1. Help them understand what course context would be helpful
2. Guide them through uploading files (PDFs, text files, YouTube video links)
3. Analyze and interpret their uploaded materials
4. Ask insightful questions about their teaching goals
5. Help them think about assessment design

Be intelligent and analytical when interpreting their materials. Make connections between their content and effective assessment strategies.`;
    
    default:
      return `You are a helpful AI assistant for educational content creation.`;
  }
};

interface UseStreamingChatProps {
  assistantId?: string;
  systemPrompt?: string;
  initialMessage?: string;
  useAnthropicForAssessment?: boolean; // Keeping for backward compatibility, but now using Claude by default
}

// Simplified streaming chat for admin content creation
export function useStreamingChat(assistantType?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsStreaming(true);
      setError(null);

      // Add user message
      const userMessage: Message = { role: 'user', content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Call the Claude chat endpoint (using the same reliable endpoint as Reggie)
      const response = await fetch('/api/claude-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: getSystemPromptForAssistantType(assistantType || 'intake-basics'),
          assistantType: assistantType || 'intake-basics'
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited - please wait a moment and try again. The system is temporarily busy.');
        }
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantContent = '';
      let assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages([...newMessages, assistantMessage]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsStreaming(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
                }
              } catch (e) {
                // Ignore parsing errors for malformed chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err: any) {
      console.error('Error in streaming chat:', err);
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      
      // Add error message to chat for user visibility
      const errorChatMessage: Message = { 
        role: 'assistant', 
        content: `I'm sorry, I'm having trouble processing your response right now. ${errorMessage} Could you try again in a moment?`
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, assistantType]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    clearHistory,
  };
}

// Original streaming chat for backward compatibility
export function useStreamingChatLegacy({
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