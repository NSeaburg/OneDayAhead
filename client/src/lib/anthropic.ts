import Anthropic from '@anthropic-ai/sdk';
import { Message } from './openai';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const defaultModel = 'claude-3-7-sonnet-20250219';

// Default max tokens for Claude responses
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Convert OpenAI-style messages to Anthropic format
 */
const convertToAnthropicMessages = (messages: Message[], systemPrompt?: string) => {
  // Extract system message if it exists
  const systemMessage = messages.find(msg => msg.role === 'system');
  const finalSystemPrompt = systemMessage?.content || systemPrompt || '';
  
  // Filter out system messages as Anthropic handles them separately
  const anthropicMessages = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
  
  return {
    messages: anthropicMessages,
    system: finalSystemPrompt,
    model: defaultModel,
    max_tokens: DEFAULT_MAX_TOKENS,
    temperature: 1.0,
  };
};

/**
 * Create a chat completion using Anthropic's Claude API
 */
export const createChatCompletionWithClaude = async (
  request: { messages: Message[], systemPrompt?: string }
): Promise<{ choices: { message: { content: string, role: string } }[], threadId?: string }> => {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const anthropicRequest = convertToAnthropicMessages(request.messages, request.systemPrompt);
    
    // Make the API call to Anthropic
    const response = await anthropic.messages.create({
      messages: anthropicRequest.messages,
      system: anthropicRequest.system,
      model: anthropicRequest.model,
      max_tokens: anthropicRequest.max_tokens,
      temperature: anthropicRequest.temperature,
    });
    
    // Convert the response to match OpenAI format
    return {
      choices: [
        {
          message: {
            content: response.content[0].type === 'text' ? response.content[0].text : '',
            role: 'assistant'
          }
        }
      ],
      threadId: response.id // Use Anthropic's message ID as thread ID
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
};

/**
 * Stream chat completion using Anthropic's Claude API (via server endpoint)
 */
export const streamChatCompletionWithClaude = async (
  request: { messages: Message[], systemPrompt?: string },
  onMessageChunk: (chunk: string) => void,
  onComplete: (fullMessage: string) => void
): Promise<{ threadId: string }> => {
  try {
    // Connect to the server-side Claude API endpoint
    const response = await fetch('/api/claude-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: request.messages,
        systemPrompt: request.systemPrompt,
        stream: true,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }
    
    // Get the thread ID from the headers
    const responseThreadId = response.headers.get('X-Thread-Id');
    let threadId = responseThreadId || 'claude-session-' + Date.now();
    
    const reader = response.body?.getReader();
    let partialLine = '';
    let fullMessage = '';
    
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
              console.error('Error in Claude API stream:', parsed.error);
              continue;
            }
            
            if (parsed.threadId) {
              threadId = parsed.threadId;
              continue;
            }
            
            if (parsed.content) {
              // For token-by-token streaming, handle formatting
              fullMessage += parsed.content;
              
              // Call the chunk handler with each piece
              onMessageChunk(parsed.content);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
    
    // Call completion handler with the full message
    onComplete(fullMessage);
    
    return {
      threadId: threadId
    };
  } catch (error) {
    console.error('Error streaming from Anthropic API:', error);
    throw error;
  }
};