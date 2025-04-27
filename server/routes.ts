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

// N8N Webhook URLs
const ASSESSMENT_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const DYNAMIC_ASSISTANT_WEBHOOK_URL = process.env.N8N_DYNAMIC_WEBHOOK_URL; // New webhook URL for the dynamic assistant

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
      const { conversationData, threadId, courseName, chatDurationSeconds } = req.body;
      
      // Verify we have data to send
      if (!conversationData || !Array.isArray(conversationData)) {
        return res.status(400).json({ 
          error: "Invalid conversation data. Expected an array of messages." 
        });
      }
      
      // Get N8N webhook URL for assessment
      if (!ASSESSMENT_WEBHOOK_URL) {
        console.warn("N8N_WEBHOOK_URL environment variable not set");
        return res.status(500).json({ 
          error: "N8N webhook URL not configured" 
        });
      }
      
      try {
        // Send data to N8N webhook with the threadId included
        const response = await axios.post(ASSESSMENT_WEBHOOK_URL, {
          conversationData,
          threadId, // Include the thread ID in the N8N payload
          timestamp: new Date().toISOString(),
          source: "learning-app-assessment",
          courseName: courseName || "Gravity Course", // Add course name with fallback
          chatDurationSeconds: chatDurationSeconds || 0 // Add chat duration with fallback
        });
        
        console.log("Successfully sent assessment data to N8N:", response.status);
        console.log("ThreadId included in N8N payload:", threadId);
        console.log("Course name sent to N8N:", courseName || "Gravity Course");
        console.log("Chat duration sent to N8N:", chatDurationSeconds || 0, "seconds");
        
        // Extract the nextAssistantId from the N8N response if available
        let nextAssistantId = response.data?.nextAssistantId;
        
        // Validate that the nextAssistantId is a valid OpenAI assistant ID format
        // Valid assistant IDs start with "asst_" and only contain letters, numbers, underscores, or dashes
        const validAssistantIdPattern = /^asst_[a-zA-Z0-9_-]+$/;
        
        if (!nextAssistantId) {
          console.log("Missing assistant ID in N8N response");
          nextAssistantId = null; // Set to null to trigger fallback
        } else if (nextAssistantId.includes("{{$json") || !validAssistantIdPattern.test(nextAssistantId)) {
          console.log("Invalid assistant ID format received:", nextAssistantId);
          nextAssistantId = null; // Set to null to trigger fallback
        } else {
          console.log("Valid assistant ID received from N8N:", nextAssistantId);
        }
        
        console.log("Next Assistant ID received from N8N:", nextAssistantId || "None provided (or invalid format)");
        
        return res.json({ 
          success: true, 
          message: "Assessment data sent to N8N successfully",
          nextAssistantId: nextAssistantId // Include the next assistant ID in the response
        });
      } catch (axiosError: any) {
        // Handle N8N webhook errors but allow the application to continue
        console.error("N8N webhook error:", axiosError.response?.data || axiosError.message);
        
        // Return a successful response to the client, but with a warning
        // This allows the application to continue with a fallback
        return res.json({ 
          success: false, 
          message: "N8N workflow error, continuing with fallback",
          error: axiosError.response?.data?.message || "N8N workflow execution failed",
          nextAssistantId: null // Use fallback assistant
        });
      }
    } catch (error: any) {
      console.error("Error in N8N integration:", error);
      
      // Return a response that allows the client to continue rather than showing an error
      return res.json({ 
        success: false, 
        message: "Error in N8N integration, continuing with fallback",
        error: error.message || String(error),
        nextAssistantId: null // Use fallback assistant
      });
    }
  });
  
  // Route to send dynamic assistant (teaching bot) data to N8N (including assessment data)
  app.post("/api/send-teaching-data", async (req, res) => {
    try {
      const { 
        // Teaching bot data
        teachingConversation, 
        teachingThreadId,
        
        // Assessment bot data
        assessmentConversation,
        assessmentThreadId,
        
        // Common metadata
        courseName, 
        chatDurationSeconds 
      } = req.body;
      
      // Verify we have at least the teaching thread ID to send
      if (!teachingThreadId) {
        return res.status(400).json({ 
          error: "Invalid request. Teaching Thread ID is required." 
        });
      }
      
      // Prepare conversation data (may be null/undefined from client)
      const teachingData = teachingConversation || [];
      const assessmentData = assessmentConversation || [];
      
      // Get N8N webhook URL for dynamic assistant
      if (!DYNAMIC_ASSISTANT_WEBHOOK_URL) {
        console.warn("N8N_DYNAMIC_WEBHOOK_URL environment variable not set");
        return res.status(500).json({ 
          error: "Dynamic assistant webhook URL not configured" 
        });
      }
      
      try {
        // Send complete data package to N8N webhook
        console.log("Calling teaching bot webhook with POST request (including assessment data)");
        const response = await axios.post(DYNAMIC_ASSISTANT_WEBHOOK_URL, {
          // Teaching bot data
          teachingThreadId,
          teachingConversation: teachingData,
          
          // Assessment bot data (if available)
          assessmentThreadId: assessmentThreadId || "",
          assessmentConversation: assessmentData,
          
          // Common metadata
          timestamp: new Date().toISOString(),
          source: "learning-app-teaching",
          courseName: courseName || "Gravity Course",
          chatDurationSeconds: chatDurationSeconds || 0
        });
        
        console.log("Successfully sent combined data to N8N:", response.status);
        console.log("Teaching Thread ID:", teachingThreadId);
        console.log("Assessment Thread ID:", assessmentThreadId || "Not available");
        console.log("Course name sent to N8N:", courseName || "Gravity Course");
        console.log("Chat duration sent to N8N:", chatDurationSeconds || 0, "seconds");
        
        return res.json({ 
          success: true, 
          message: "Combined teaching and assessment data sent to N8N successfully"
        });
      } catch (axiosError: any) {
        // Handle N8N webhook errors but allow the application to continue
        console.error("Teaching bot N8N webhook error:", axiosError.response?.data || axiosError.message);
        
        // Return a response that allows the client to continue
        return res.json({ 
          success: false, 
          message: "N8N workflow error for teaching data, continuing anyway",
          error: axiosError.response?.data?.message || "N8N workflow execution failed"
        });
      }
    } catch (error: any) {
      console.error("Error in teaching bot N8N integration:", error);
      
      // Return a response that allows the client to continue
      return res.json({ 
        success: false, 
        message: "Error in teaching bot N8N integration, continuing anyway",
        error: error.message || String(error)
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
          ],
          threadId: threadId // Include the thread ID in the response
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
