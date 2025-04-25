import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Default Assistant ID
const DEFAULT_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to get the assistant ID
  app.get("/api/assistant-config", (req, res) => {
    res.json({
      assistantId: process.env.OPENAI_ASSISTANT_ID || ""
    });
  });

  // OpenAI chat completions endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, temperature, systemPrompt, assistantId } = req.body;
      
      // If an assistantId is provided or we have a default assistant ID, use the assistant API
      if (assistantId || DEFAULT_ASSISTANT_ID) {
        const threadId = await createThread();
        
        // Add messages to the thread
        await addMessagesToThread(threadId, messages, systemPrompt);
        
        // Run the assistant
        const runId = await runAssistant(threadId, assistantId || DEFAULT_ASSISTANT_ID);
        
        // Wait for the run to complete and get messages
        const response = await getAssistantResponse(threadId, runId);
        
        res.json({
          choices: [
            {
              message: {
                content: response,
                role: "assistant"
              }
            }
          ]
        });
      } else {
        // Fallback to direct chat completion if no assistant ID is provided
        const messagesWithSystem = systemPrompt 
          ? [{ role: "system", content: systemPrompt }, ...messages] 
          : messages;
        
        const response = await openai.chat.completions.create({
          model: model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: messagesWithSystem,
          temperature: temperature || 0.7,
        });
        
        res.json(response);
      }
    } catch (error: any) {
      console.error("Error calling OpenAI:", error);
      res.status(500).json({ 
        error: "Failed to process chat request",
        details: error.message || String(error)
      });
    }
  });
  
  // Helper functions for OpenAI Assistant API
  
  // Create a new thread
  async function createThread() {
    try {
      const thread = await openai.beta.threads.create();
      return thread.id;
    } catch (error: any) {
      console.error("Error creating thread:", error);
      throw new Error(error.message || String(error));
    }
  }
  
  // Add messages to a thread
  async function addMessagesToThread(threadId: string, messages: any[], systemPrompt?: string) {
    try {
      // If there's a system prompt, add it first using tool instructions
      if (systemPrompt) {
        // Note: Currently Assistant API doesn't support system messages directly
        // We can use run instructions instead when running the assistant
      }
      
      // Add user messages to the thread
      for (const message of messages) {
        if (message.role === 'user') {
          await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message.content
          });
        }
      }
    } catch (error: any) {
      console.error("Error adding messages to thread:", error);
      throw new Error(error.message || String(error));
    }
  }
  
  // Run the assistant on a thread
  async function runAssistant(threadId: string, assistantId: string) {
    try {
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId
      });
      return run.id;
    } catch (error: any) {
      console.error("Error running assistant:", error);
      throw new Error(error.message || String(error));
    }
  }
  
  // Wait for the run to complete and get the assistant's response
  async function getAssistantResponse(threadId: string, runId: string) {
    try {
      // Poll for run completion
      let run = await openai.beta.threads.runs.retrieve(threadId, runId);
      
      // Wait for the run to complete
      while (run.status === "queued" || run.status === "in_progress") {
        // Wait for 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await openai.beta.threads.runs.retrieve(threadId, runId);
      }
      
      if (run.status !== "completed") {
        throw new Error(`Run ended with status: ${run.status}`);
      }
      
      // Get the assistant's messages
      const messages = await openai.beta.threads.messages.list(threadId);
      
      // Find the latest assistant message
      const latestAssistantMessage = messages.data
        .filter(msg => msg.role === "assistant")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      if (!latestAssistantMessage) {
        return "No response from assistant.";
      }
      
      // Extract and return the text content from the message
      let messageText = "No text response from assistant.";
      
      // Check for text content in the message
      for (const contentPart of latestAssistantMessage.content) {
        if (contentPart.type === 'text') {
          messageText = contentPart.text.value;
          break;
        }
      }
      
      return messageText;
    } catch (error: any) {
      console.error("Error getting assistant response:", error);
      throw new Error(error.message || String(error));
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
