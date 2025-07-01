import { useCallback } from "react";
import { apiRequest } from "./queryClient";

// Legacy model reference - now using Claude via Anthropic API
const MODEL = "claude-sonnet-4-20250514";

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  assistantId?: string;
}

export interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
  threadId?: string; // Optional thread ID when using Claude conversations
}

// Function to create a chat completion using the Claude API via our backend
export const createChatCompletion = async (
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> => {
  try {
    const response = await apiRequest("POST", "/api/chat", {
      ...request,
      model: request.model || MODEL,
      temperature: request.temperature || 0.7,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error creating chat completion:", error);
    throw error;
  }
};

// Hook to create a simple chat stream function
export const useChatCompletion = () => {
  const sendMessage = useCallback(
    async (messages: Message[], systemPrompt?: string, assistantId?: string): Promise<[string, string?]> => {
      const messagesWithSystem: Message[] = systemPrompt
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : [...messages];

      try {
        const completion = await createChatCompletion({
          messages: messagesWithSystem,
          model: MODEL,
          assistantId: assistantId,
        });

        return [completion.choices[0].message.content, completion.threadId];
      } catch (error) {
        console.error("Error in chat completion:", error);
        return ["I'm sorry, I couldn't process your request. Please try again.", undefined];
      }
    },
    []
  );

  return { sendMessage };
};
