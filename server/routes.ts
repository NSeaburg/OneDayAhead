import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import axios from "axios";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Default Assistant IDs
const DEFAULT_DISCUSSION_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const DEFAULT_ASSESSMENT_ASSISTANT_ID = "asst_68CAVYvKmjbpqFpCa9D0TiRU";

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to get the assistant IDs
  app.get("/api/assistant-config", (req, res) => {
    res.json({
      discussionAssistantId: DEFAULT_DISCUSSION_ASSISTANT_ID || "",
      assessmentAssistantId: DEFAULT_ASSESSMENT_ASSISTANT_ID || ""
    });
  });
  
  // Route to send assessment data to N8N
  app.post("/api/send-to-n8n", async (req, res) => {
    try {
      const { conversationData } = req.body;
      
      // Verify we have data to send
      if (!conversationData || !Array.isArray(conversationData)) {
        return res.status(400).json({ 
          error: "Invalid conversation data. Expected an array of messages." 
        });
      }
      
      // Get N8N webhook URL from environment variable
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      
      if (!n8nWebhookUrl) {
        console.warn("N8N_WEBHOOK_URL environment variable not set");
        return res.status(500).json({ 
          error: "N8N webhook URL not configured" 
        });
      }
      
      // Log what we're sending
      console.log("Sending data to N8N webhook URL:", n8nWebhookUrl.substring(0, 15) + "...");
      console.log("Data structure being sent:", {
        conversationCount: conversationData.length,
        firstMessagePreview: conversationData[0]?.content.substring(0, 30) + "...",
        lastMessagePreview: conversationData[conversationData.length - 1]?.content.substring(0, 30) + "...",
        timestamp: new Date().toISOString(),
        source: "learning-app-assessment"
      });

      // Prepare payload with structure that N8N webhooks typically expect
      const payload = {
        data: {
          conversationData,
          timestamp: new Date().toISOString(),
          source: "learning-app-assessment"
        }
      };
      
      // Send data to N8N webhook with appropriate headers
      const response = await axios.post(n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Learning-App/1.0'
        }
      });
      
      console.log("Successfully sent assessment data to N8N:", response.status);
      console.log("N8N response headers:", response.headers);
      console.log("N8N response data:", response.data);
      
      return res.json({ 
        success: true, 
        message: "Assessment data sent to N8N successfully" 
      });
    } catch (error: any) {
      console.error("Error sending data to N8N:", error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("N8N error response status:", error.response.status);
        console.error("N8N error response headers:", error.response.headers);
        console.error("N8N error response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("N8N no response received. Request details:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("N8N request setup error:", error.message);
      }
      
      return res.status(500).json({ 
        error: "Failed to send assessment data to N8N",
        details: error.message || String(error)
      });
    }
  });

  // OpenAI chat completions endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, temperature, systemPrompt, assistantId } = req.body;
      
      // If an assistantId is provided or we have a default assistant ID, use the assistant API
      if (assistantId || DEFAULT_DISCUSSION_ASSISTANT_ID || DEFAULT_ASSESSMENT_ASSISTANT_ID) {
        const threadId = await createThread();
        
        // Add messages to the thread
        await addMessagesToThread(threadId, messages, systemPrompt);
        
        // Use the provided assistantId or select an appropriate default
        const actualAssistantId = assistantId || DEFAULT_DISCUSSION_ASSISTANT_ID || "";
        
        // Run the assistant
        const runId = await runAssistant(threadId, actualAssistantId);
        
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
