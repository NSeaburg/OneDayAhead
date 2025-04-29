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
    temperature: 0.7,
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
 * Stream chat completion using Anthropic's Claude API
 */
export const streamChatCompletionWithClaude = async (
  request: { messages: Message[], systemPrompt?: string },
  onMessageChunk: (chunk: string) => void,
  onComplete: (fullMessage: string) => void
): Promise<{ threadId: string }> => {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const anthropicRequest = convertToAnthropicMessages(request.messages, request.systemPrompt);
    
    // Collect the full message
    let fullMessage = '';
    let messageId = '';
    
    // Make the streaming API call to Anthropic
    const stream = await anthropic.messages.create({
      messages: anthropicRequest.messages,
      system: anthropicRequest.system,
      model: anthropicRequest.model,
      max_tokens: anthropicRequest.max_tokens,
      temperature: anthropicRequest.temperature,
      stream: true,
    });
    
    // Process the stream
    for await (const chunk of stream) {
      // Store the message ID from the first chunk if available
      if (!messageId && 'message_id' in chunk && typeof chunk.message_id === 'string') {
        messageId = chunk.message_id;
      }
      
      // Handle content block deltas that contain text
      if (chunk.type === 'content_block_delta' && 
          'delta' in chunk && 
          'text' in chunk.delta && 
          typeof chunk.delta.text === 'string') {
        
        const textChunk = chunk.delta.text;
        fullMessage += textChunk;
        onMessageChunk(textChunk);
      }
    }
    
    // Call completion handler with the full message
    onComplete(fullMessage);
    
    return {
      threadId: messageId || 'claude-session-' + Date.now()
    };
  } catch (error) {
    console.error('Error streaming from Anthropic API:', error);
    throw error;
  }
};