import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_development" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI chat completions endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, temperature, systemPrompt, assistantId } = req.body;
      
      // In a real app, we'd use the assistantId to select the right OpenAI assistant
      // For this prototype, we'll just use a direct completion
      
      const messagesWithSystem = systemPrompt 
        ? [{ role: "system", content: systemPrompt }, ...messages] 
        : messages;
      
      const response = await openai.chat.completions.create({
        model: model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: messagesWithSystem,
        temperature: temperature || 0.7,
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      res.status(500).json({ 
        error: "Failed to process chat request",
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
