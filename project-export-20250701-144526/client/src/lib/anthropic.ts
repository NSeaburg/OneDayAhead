import Anthropic from '@anthropic-ai/sdk';
import { Message } from './openai';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025
const defaultModel = 'claude-sonnet-4-20250514';

// Default max tokens for Claude responses
const DEFAULT_MAX_TOKENS = 20000;

// Default temperature for Claude responses
const DEFAULT_TEMPERATURE = 1.0;

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
    temperature: DEFAULT_TEMPERATURE,
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
 * Includes error handling and retry mechanism for API overload conditions
 */
export const streamChatCompletionWithClaude = async (
  request: { messages: Message[], systemPrompt?: string },
  onMessageChunk: (chunk: string) => void,
  onComplete: (fullMessage: string) => void
): Promise<{ threadId: string }> => {
  // Maximum number of retries for overloaded API
  const MAX_RETRIES = 2;
  let retries = 0;
  
  // Exponential backoff delay calculation
  const getBackoffDelay = (retry: number) => Math.min(1000 * Math.pow(2, retry), 8000);
  
  // Function to attempt streaming with retry capability
  const attemptStreamWithRetry = async (): Promise<{ threadId: string }> => {
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
      
      // Check if we got an overloaded API error (HTTP 503)
      if (response.status === 503) {
        const errorData = await response.json();
        
        // Check if this is specifically an overloaded error
        const isOverloaded = errorData.error === 'service_overloaded' || 
                             (errorData.message && errorData.message.toLowerCase().includes('overloaded'));
        
        if (isOverloaded && retries < MAX_RETRIES) {
          retries++;
          const delay = getBackoffDelay(retries);
          
          console.log(`Claude API overloaded, retrying in ${delay}ms (attempt ${retries} of ${MAX_RETRIES})`);
          
          // Notify the user about retry
          const retryMessage = `\n[Claude API is currently busy. Retrying in ${Math.round(delay/1000)} seconds... (${retries}/${MAX_RETRIES})]\n`;
          onMessageChunk(retryMessage);
          
          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptStreamWithRetry();
        }
        
        // If we've used all retries or it's not an overload error, propagate the error
        const errorMessage = errorData.message || 'Claude API service error';
        onMessageChunk(`\n[Error: ${errorMessage}]\n`);
        onComplete(`\n[Error: ${errorMessage}]\n`);
        throw new Error(errorMessage);
      }
      
      // Handle other error responses
      if (!response.ok) {
        const errorMessage = `Network error: ${response.status}`;
        onMessageChunk(`\n[${errorMessage}]\n`);
        onComplete(`\n[${errorMessage}]\n`);
        throw new Error(errorMessage);
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
      
      // Flag to track if we've had a successful response
      let hasReceivedContent = false;
      
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
              // Stream is done - don't add this marker to the message content
              console.log("Received [DONE] marker, stream finished");
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              // Check for error in the stream
              if (parsed.error) {
                console.error('Error in Claude API stream:', parsed.error);
                
                const errorMsg = parsed.message || 'An error occurred with Claude API';
                
                // Check if this is an overload error that we can retry
                if ((errorMsg.toLowerCase().includes('overloaded') || 
                     errorMsg.toLowerCase().includes('busy')) && 
                     retries < MAX_RETRIES && !hasReceivedContent) {
                  
                  retries++;
                  const delay = getBackoffDelay(retries);
                  
                  console.log(`Claude API overloaded in stream, retrying in ${delay}ms (attempt ${retries} of ${MAX_RETRIES})`);
                  
                  // Notify the user about retry
                  const retryMessage = `\n[Claude API is currently busy. Retrying in ${Math.round(delay/1000)} seconds... (${retries}/${MAX_RETRIES})]\n`;
                  onMessageChunk(retryMessage);
                  
                  // Wait and retry
                  await new Promise(resolve => setTimeout(resolve, delay));
                  return attemptStreamWithRetry();
                }
                
                // For non-retryable errors, just display the error
                onMessageChunk(`\n[Error: ${errorMsg}]\n`);
                continue;
              }
              
              if (parsed.threadId) {
                threadId = parsed.threadId;
                continue;
              }
              
              if (parsed.content) {
                // Mark that we've received real content
                hasReceivedContent = true;
                
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
      
      // If we finished the stream but didn't get any content, that's strange
      if (!hasReceivedContent) {
        console.warn('Stream completed without content');
        onMessageChunk('\n[No response received from Claude. The service may be experiencing issues.]\n');
      }
      
      // Call completion handler with the full message
      onComplete(fullMessage);
      
      return {
        threadId: threadId
      };
    } catch (error: any) {
      console.error('Error streaming from Anthropic API:', error);
      
      // If we haven't notified the user yet about the error, do so now
      const errorMessage = error.message || 'Error communicating with Claude API';
      onMessageChunk(`\n[Error: ${errorMessage}]\n`);
      onComplete(`\n[Error: ${errorMessage}]\n`);
      
      // Return a placeholder thread ID
      return {
        threadId: 'error-' + Date.now()
      };
    }
  };
  
  // Start the initial attempt
  return attemptStreamWithRetry();
};