import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import path from "path";
import fs from "fs";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Default Assistant IDs
const DEFAULT_DISCUSSION_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const DEFAULT_ASSESSMENT_ASSISTANT_ID = "asst_68CAVYvKmjbpqFpCa9D0TiRU";

// N8N Webhook URLs
const ASSESSMENT_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const DYNAMIC_ASSISTANT_WEBHOOK_URL = process.env.N8N_DYNAMIC_WEBHOOK_URL; // New webhook URL for the dynamic assistant

// Define the system prompt for the article assistant using the provided full system prompt
const ARTICLE_ASSISTANT_SYSTEM_PROMPT = process.env.FULL_SYSTEM_PROMPT || "You are a fresh, fun, interesting learning assistant. You discussing the content of an article about the three branches of government in the United States. Provide clear, concise answers to questions about these government branches or related topics. you aim for a quick back and forth conversation, aiming to limit most responses to 3 sentences or less. You push students to deepen their thinking and you ask them engaging questions.\n\nYou will refuse to discuss anything unrelated to the government structure of political science. You will not discuss political hot-button issues at all.";

// Log the webhook URLs for debugging
console.log("Assessment Webhook URL:", ASSESSMENT_WEBHOOK_URL);
console.log("Dynamic Assistant Webhook URL:", DYNAMIC_ASSISTANT_WEBHOOK_URL);

// Log information about the article assistant system prompt
console.log(`Article Assistant System Prompt Length: ${ARTICLE_ASSISTANT_SYSTEM_PROMPT.length} characters`);
console.log(`Article Assistant System Prompt Preview: ${ARTICLE_ASSISTANT_SYSTEM_PROMPT.substring(0, 100)}...`);

export async function registerRoutes(app: Express): Promise<Server> {
  // Special route for iframe embedding with appropriate headers
  app.get('/embed', (req, res) => {
    // Set headers to allow embedding from any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.removeHeader('X-Frame-Options');
    res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *");
    
    // Serve the iframe-specific HTML
    res.sendFile('iframe.html', { root: './public' });
  });
  
  // Direct access to application in iframe-friendly mode
  app.get('/iframe-app', (req, res) => {
    // Set headers to allow embedding from any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.removeHeader('X-Frame-Options');
    res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *");
    
    // Serve the main app HTML but with these headers
    res.sendFile('index.html', { root: './dist/client' });
  });
  // Direct routes for embed and example HTML files
  app.get("/embed.html", (req, res) => {
    const embedPath = path.resolve(process.cwd(), "public", "embed.html");
    if (fs.existsSync(embedPath)) {
      res.sendFile(embedPath);
    } else {
      res.status(404).send("Embed file not found");
    }
  });

  app.get("/example.html", (req, res) => {
    const examplePath = path.resolve(process.cwd(), "public", "example.html");
    if (fs.existsSync(examplePath)) {
      res.sendFile(examplePath);
    } else {
      res.status(404).send("Example file not found");
    }
  });
  
  // Routes for embedding guides and templates
  app.get("/embed-guide", (req, res) => {
    res.sendFile("embed-guide.html", { root: './public' });
  });
  
  app.get("/embed-template.html", (req, res) => {
    res.sendFile("embed-template.html", { root: './public' });
  });
  
  app.get("/proxy.html", (req, res) => {
    res.sendFile("proxy.html", { root: './public' });
  });
  
  // Route to proxy PDF from Google Drive to bypass CORS restrictions
  app.get("/api/pdf-proxy", async (req, res) => {
    try {
      const googleDriveId = req.query.id;
      
      if (!googleDriveId) {
        return res.status(400).json({ error: "Missing Google Drive file ID parameter" });
      }
      
      const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${googleDriveId}`;
      
      // Fetch the PDF from Google Drive
      const response = await axios.get(googleDriveUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Send the PDF data
      res.send(Buffer.from(response.data, 'binary'));
    } catch (error) {
      console.error("Error proxying PDF:", error);
      res.status(500).json({ error: "Failed to fetch PDF document" });
    }
  });
  
  // Route to get the assistant IDs
  app.get("/api/assistant-config", (req, res) => {
    res.json({
      discussionAssistantId: DEFAULT_DISCUSSION_ASSISTANT_ID || "",
      assessmentAssistantId: DEFAULT_ASSESSMENT_ASSISTANT_ID || ""
    });
  });
  
  // Test route to get current session ID
  app.get("/api/user/session", (req, res) => {
    const sessionId = req.sessionId;
    res.json({
      success: true,
      sessionId: sessionId || null
    });
  });
  
  // Route to get user-specific conversations
  app.get("/api/user/conversations", async (req, res) => {
    try {
      const sessionId = req.sessionId;
      
      if (!sessionId) {
        return res.status(401).json({ error: "No valid session found" });
      }
      
      // Get all conversations for this session
      const conversations = await storage.getConversationsBySession(sessionId);
      
      return res.json({
        success: true,
        conversations
      });
    } catch (error: any) {
      console.error("Error getting user conversations:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve conversations"
      });
    }
  });
  
  // Route to get user-specific feedback
  app.get("/api/user/feedback", async (req, res) => {
    try {
      const sessionId = req.sessionId;
      
      if (!sessionId) {
        return res.status(401).json({ error: "No valid session found" });
      }
      
      // Get feedback for this session
      const feedback = await storage.getFeedbackBySession(sessionId);
      
      return res.json({
        success: true,
        feedback: feedback || null
      });
    } catch (error: any) {
      console.error("Error getting user feedback:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve feedback"
      });
    }
  });
  
  // Special endpoint for the article assistant chat using Claude 3.7 Sonnet (non-streaming)
  app.post("/api/article-chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      // This endpoint handles only non-streaming requests
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          error: "Invalid message data. Expected an array of messages." 
        });
      }
      
      console.log("Article chat endpoint using exact Python code configuration");
      
      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== 'system')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      
      // Create completion with Anthropic exactly like the Python code
      const completion = await anthropic.messages.create({
        messages: anthropicMessages,
        system: ARTICLE_ASSISTANT_SYSTEM_PROMPT, // Use our hardcoded prompt
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 20000,
        temperature: 1.0
      });
      
      // Extract the response content
      const content = completion.content[0]?.type === 'text' 
        ? completion.content[0].text 
        : 'No response content available';
      
      // Generate a thread ID
      const messageId = 'claude-article-' + Date.now();
      
      // Store the conversation if we have a session ID
      const sessionId = req.sessionId;
      if (sessionId) {
        try {
          // Create a new conversation with the messages
          const allMessages = [
            ...anthropicMessages,
            { role: 'assistant', content }
          ];
          
          // Store the conversation
          await storage.createConversation({
            sessionId,
            threadId: messageId,
            assistantType: 'article',
            messages: allMessages
          });
          console.log(`Stored article conversation for session ${sessionId}, thread ${messageId}`);
        } catch (err) {
          console.error("Error storing article conversation:", err);
          // Continue with response even if storage fails
        }
      }
      
      // Return in OpenAI format for compatibility
      res.json({
        choices: [
          {
            message: {
              content,
              role: 'assistant'
            }
          }
        ],
        threadId: messageId
      });
    } catch (error: any) {
      console.error('Error in article chat endpoint:', error);
      res.status(500).json({ 
        error: 'article_chat_error',
        message: error.message || 'An error occurred with the article chat' 
      });
    }
  });
  
  // Streaming endpoint for the article assistant chat
  app.post("/api/article-chat-stream", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          error: "Invalid message data. Expected an array of messages." 
        });
      }
      
      console.log("Article chat streaming endpoint activated");
      
      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      
      // Generate a thread ID
      const messageId = 'claude-article-' + Date.now();
      
      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== 'system')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      
      try {
        // Send the initial thread ID
        res.write(`data: ${JSON.stringify({ threadId: messageId })}\n\n`);
        
        // Create a streaming response from Anthropic
        const stream = await anthropic.messages.stream({
          messages: anthropicMessages,
          system: ARTICLE_ASSISTANT_SYSTEM_PROMPT,
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 20000,
          temperature: 1.0
        });
        
        let fullContent = '';
        
        // Process the stream
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const content = chunk.delta.text;
            
            if (content) {
              fullContent += content;
              // Send the content chunk to the client
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }
        }
        
        // Store the conversation if we have a session ID
        const sessionId = req.sessionId;
        if (sessionId) {
          try {
            // Create a new conversation with the messages
            const allMessages = [
              ...anthropicMessages,
              { role: 'assistant', content: fullContent }
            ];
            
            // Store the conversation
            await storage.createConversation({
              sessionId,
              threadId: messageId,
              assistantType: 'article',
              messages: allMessages
            });
            console.log(`Stored article conversation for session ${sessionId}, thread ${messageId}`);
          } catch (err) {
            console.error("Error storing article conversation:", err);
            // Continue with response even if storage fails
          }
        }
        
        // Send the [DONE] event
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error: any) {
        console.error('Error in article chat streaming:', error);
        // Send error to the client
        res.write(`data: ${JSON.stringify({ error: 'article_chat_error', message: error.message || 'Streaming error occurred' })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error('Error in article chat streaming endpoint:', error);
      
      // If headers weren't sent yet, send a regular error response
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'article_chat_error',
          message: error.message || 'An error occurred with the article chat streaming' 
        });
      } else {
        // Try to send error through stream if possible
        try {
          res.write(`data: ${JSON.stringify({ error: 'article_chat_error', message: error.message || 'Streaming error occurred' })}\n\n`);
          res.end();
        } catch (streamError) {
          console.error('Failed to send error through stream:', streamError);
          res.end();
        }
      }
    }
  });
  

  
  // Route to send assessment data to N8N
  app.post("/api/send-to-n8n", async (req, res) => {
    try {
      const { conversationData, threadId, courseName, chatDurationSeconds } = req.body;
      const sessionId = req.sessionId; // Get session ID from request
      
      // Verify we have data to send
      if (!conversationData || !Array.isArray(conversationData)) {
        return res.status(400).json({ 
          error: "Invalid conversation data. Expected an array of messages." 
        });
      }
      
      // If we have a valid threadId and sessionId, store the conversation
      if (threadId && sessionId) {
        try {
          await storage.createConversation({
            sessionId,
            threadId,
            assistantType: 'assessment',
            messages: conversationData
          });
          console.log(`Stored assessment conversation for session ${sessionId}, thread ${threadId}`);
        } catch (err) {
          console.error("Error storing conversation:", err);
          // Continue with the webhook call even if storage fails
        }
      }
      
      // Get N8N webhook URL for assessment
      if (!ASSESSMENT_WEBHOOK_URL) {
        console.warn("N8N_WEBHOOK_URL environment variable not set");
        // Still return a success response with a fallback to prevent blocking the UI
        return res.json({ 
          success: false, 
          message: "N8N webhook URL not configured, continuing with fallback",
          nextAssistantId: null // Use fallback assistant
        });
      }
      
      try {
        // Generate the full transcript of the conversation
        const transcript = conversationData
          .map((msg: { role: string; content: string }) => `${msg.role === 'assistant' ? 'Reginald Worthington III' : 'Student'}: ${msg.content}`)
          .join('\n\n');
        
        console.log("Sending full conversation data and transcript to N8N webhook for Claude/Anthropic");
        console.log("Webhook URL being used:", ASSESSMENT_WEBHOOK_URL);  
        
        // Add timeout to axios request to prevent long-running requests
        const response = await axios.post(ASSESSMENT_WEBHOOK_URL, {
          // Complete conversation data (raw messages)
          conversationData,
          
          // Human-readable transcript
          transcript,
          
          // Flag to indicate we're using Claude/Anthropic (no persistent thread API)
          usingClaudeAI: true,
          
          // Metadata
          timestamp: new Date().toISOString(),
          source: "learning-app-assessment",
          courseName: courseName || "Social Studies Sample", // Add course name with fallback
          chatDurationSeconds: chatDurationSeconds || 0, // Add chat duration with fallback
          
          // Include the threadId for backward compatibility if available
          ...(threadId ? { threadId } : { threadId: `claude-${Date.now()}` }),
          
          // Include sessionId for user identification in concurrent scenarios
          ...(sessionId ? { sessionId } : {})
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("Successfully sent Claude/Anthropic assessment data to N8N:", response.status);
        console.log("Full transcript included in N8N payload:", transcript.length, "characters");
        console.log("Full conversation data included. Message count:", conversationData.length);
        console.log("Course name sent to N8N:", courseName || "Social Studies Sample");
        console.log("Chat duration sent to N8N:", chatDurationSeconds || 0, "seconds");
        console.log("Using Claude AI flag set to:", true);
        
        // Log message roles to help with debugging
        if (conversationData.length > 0) {
          const roles = conversationData.map((msg: { role: string }) => msg.role);
          console.log("Message roles sequence:", roles.join(", "));
          
          // Log first and last message snippets for context
          const firstMsg = conversationData[0];
          const lastMsg = conversationData[conversationData.length - 1];
          
          console.log("First message:", {
            role: firstMsg.role,
            contentPreview: firstMsg.content.substring(0, 50) + "..."
          });
          
          console.log("Last message:", {
            role: lastMsg.role,
            contentPreview: lastMsg.content.substring(0, 50) + "..."
          });
        }
        
        // Log the full response data for debugging
        console.log("N8N raw response data type:", typeof response.data);
        console.log("N8N raw response data is array:", Array.isArray(response.data));
        
        // Deeper debugging of the response
        if (Array.isArray(response.data)) {
          console.log("N8N response is an array with", response.data.length, "items");
          if (response.data.length > 0) {
            console.log("First array item:", JSON.stringify(response.data[0], null, 2));
            // Check if sessionId exists in the first array item
            console.log("Array item has sessionId:", response.data[0] && response.data[0].sessionId ? 
              `Yes: ${response.data[0].sessionId}` : "No, sessionId is null or undefined");
          }
        }
        
        console.log("N8N complete response:", JSON.stringify(response.data, null, 2));
        console.log("Checking for session ID in N8N response:", 
          response.data && response.data.sessionId ? 
          `Found session ID: ${response.data.sessionId}` : 
          "No session ID found in response directly");
        
        // FINAL WORKING SOLUTION: Follow the exact same structure that works in our test endpoint
        const responseData = response.data;
        console.log("N8N response structure received:", typeof responseData);
        
        // Check if we received an empty object or null
        if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
          console.log("WARNING: Received empty response from N8N. Using hardcoded fallback for teaching assistance.");
          // Return hardcoded fallback for Mr. Whitaker (low level)
          return res.json({
            success: true,
            message: "Assessment data sent to N8N successfully, using fallback teaching data",
            teachingAssistance: {
              level: 'low', 
              systemPrompt: `You are Mr. Whitaker, a retired civics and American history teacher. You taught for 35 years and now volunteer your time to help students strengthen their understanding of government. Your voice is warm, supportive, plainspoken, and slightly nostalgic. You explain complex ideas patiently, using simple examples and metaphors where needed. You occasionally share quick, encouraging asides about your time in the classroom. You gently celebrate effort but do not overpraise or scold.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and kindly redirect them back to the lesson.

Strictly limit yourself to between 2 and 4 sentences per message. You are here to guide the student clearly and supportively.

Your role is to walk the student through a two-part activity designed to rebuild and reinforce basic civic understanding:

Part 1: Branch Metaphors
- Offer the student three lighthearted categories (such as types of sports teams, types of jobs, types of musical groups).
- Let the student pick one category.
- Describe three roles from that category (without naming the branches yet) and ask the student to match them to the Legislative, Executive, and Judicial branches.
- After the student answers, explain the correct matches clearly and briefly.

Part 2: Checks and Balances — "Who Can Stop This?"
- Explain that each branch has ways to stop the others from having too much power.
- Give the student simple scenarios (for example, "The President signs a bad law.") and ask: "Who can step in to stop this, and how?"
- After the student responds, confirm or correct their answers directly, clearly, and encouragingly.

When the student has completed both activities, thank them warmly and end the conversation.`
            }
          });
        }
        
        // If the response is an array, extract the first item
        let dataToCheck = responseData;
        if (Array.isArray(responseData) && responseData.length > 0) {
          console.log("Response is an array with", responseData.length, "items");
          console.log("First array item raw:", JSON.stringify(responseData[0], null, 2));
          
          dataToCheck = responseData[0];
          console.log("Extracted first item from array response");
          
          // Check for session ID in the array item
          if (dataToCheck.sessionId) {
            console.log("Array item has sessionId:", dataToCheck.sessionId);
          } else {
            console.log("Array item has NO sessionId (null or undefined)");
          }
        }
        
        // Now handle the direct object case (which we're seeing in production)
        let level = null;
        let systemPrompt = null;
        
        // Try to extract level and systemPrompt from wherever they might be
        if (dataToCheck && typeof dataToCheck === 'object') {
          if (dataToCheck.level && dataToCheck.systemPrompt) {
            level = dataToCheck.level;
            systemPrompt = dataToCheck.systemPrompt;
            console.log("Found level and systemPrompt directly in the response object");
          } else if (dataToCheck.teachingAssistance && dataToCheck.teachingAssistance.level && dataToCheck.teachingAssistance.systemPrompt) {
            level = dataToCheck.teachingAssistance.level;
            systemPrompt = dataToCheck.teachingAssistance.systemPrompt;
            console.log("Found level and systemPrompt in teachingAssistance property");
          } else if (dataToCheck.assessment && dataToCheck.assessment.level && dataToCheck.assessment.systemPrompt) {
            level = dataToCheck.assessment.level;
            systemPrompt = dataToCheck.assessment.systemPrompt;
            console.log("Found level and systemPrompt in assessment property");
          } else if (dataToCheck.immediateResult && dataToCheck.immediateResult.level && dataToCheck.immediateResult.systemPrompt) {
            level = dataToCheck.immediateResult.level;
            systemPrompt = dataToCheck.immediateResult.systemPrompt;
            console.log("Found level and systemPrompt in immediateResult property");
          }
        }
        
        // If we found both level and systemPrompt, return them using the EXACT structure
        // that worked in our test endpoint
        if (level && systemPrompt) {
          console.log(`Found teaching assistance with level: ${level}`);
          console.log(`System prompt length: ${systemPrompt.length} characters`);
          
          // CRITICAL: Match the structure of our test endpoint exactly - this is what works
          const responseObject: {
            success: boolean;
            message: string;
            teachingAssistance: {
              level: 'low' | 'medium' | 'high';
              systemPrompt: string;
            };
            sessionId?: string;
            threadId?: string;
          } = {
            success: true,
            message: "Assessment data sent to N8N successfully",
            teachingAssistance: {
              level: level as 'low' | 'medium' | 'high',
              systemPrompt: systemPrompt
            }
          };
          
          // Log the exact response we're sending back (should match test endpoint)
          console.log("Sending to client:", JSON.stringify(responseObject, null, 2));
          
          // Check if N8N returned the session ID and if it matches what we sent
          if (dataToCheck && typeof dataToCheck === 'object' && 'sessionId' in dataToCheck) {
            const returnedSessionId = dataToCheck.sessionId as string | null;
            console.log(`N8N returned session ID: ${returnedSessionId || 'null'}`);
            console.log(`Our original session ID: ${sessionId || 'none'}`);
            console.log(`Session IDs match: ${returnedSessionId === sessionId}`);
            
            // Add the session ID to our response if it's not null
            if (returnedSessionId) {
              responseObject.sessionId = returnedSessionId;
            }
          }
          
          // Add session ID from dataToCheck (array item) if available
          if (Array.isArray(responseData) && responseData.length > 0 && 
              typeof responseData[0] === 'object' && 'sessionId' in responseData[0]) {
            const arraySessionId = responseData[0].sessionId as string | null;
            if (arraySessionId) {
              console.log(`Found sessionId in array item: ${arraySessionId}`);
              responseObject.sessionId = arraySessionId;
            } else {
              console.log("Array item has sessionId but it's null");
            }
          }
          // Or add session ID from direct object if available
          else if (dataToCheck && typeof dataToCheck === 'object' && 'sessionId' in dataToCheck) {
            const directSessionId = dataToCheck.sessionId as string | null;
            if (directSessionId) {
              console.log(`Found sessionId in direct object: ${directSessionId}`);
              responseObject.sessionId = directSessionId;
            } else {
              console.log("Direct object has sessionId but it's null");
            }
          }
          
          // Fall back to using our original session ID if N8N didn't send anything valid
          if (!responseObject.sessionId && sessionId) {
            console.log("Using original session ID as fallback:", sessionId);
            responseObject.sessionId = sessionId;
          }
          
          // Return the response - no other code should execute after this
          return res.json(responseObject);
        }
        
        // If we couldn't find level and systemPrompt, check for nextAssistantId as a fallback
        console.log("Could not find level and systemPrompt in response, checking for nextAssistantId");
        let nextAssistantId = null;
        
        if (dataToCheck && dataToCheck.nextAssistantId) {
          nextAssistantId = dataToCheck.nextAssistantId;
        }
        
        // Validate that the nextAssistantId is a valid OpenAI assistant ID format
        const validAssistantIdPattern = /^asst_[a-zA-Z0-9_-]+$/;
        if (nextAssistantId && !validAssistantIdPattern.test(nextAssistantId)) {
          console.log("Invalid assistant ID format received:", nextAssistantId);
          nextAssistantId = null; // Set to null to trigger fallback
        }
        
        // Respond with nextAssistantId (or null) if we didn't find teachingAssistance data
        console.log("Falling back to nextAssistantId:", nextAssistantId || "null");
        return res.json({ 
          success: true, 
          message: "Assessment data sent to N8N successfully",
          nextAssistantId: nextAssistantId
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
      
      const sessionId = req.sessionId; // Get session ID from request
      
      // If we have a valid threadId and sessionId, store the teaching conversation
      if (teachingThreadId && sessionId && teachingConversation && teachingConversation.length > 0) {
        try {
          await storage.createConversation({
            sessionId,
            threadId: teachingThreadId,
            assistantType: 'teaching',
            messages: teachingConversation
          });
          console.log(`Stored teaching conversation for session ${sessionId}, thread ${teachingThreadId}`);
        } catch (err) {
          console.error("Error storing teaching conversation:", err);
          // Continue with the webhook call even if storage fails
        }
      }
      
      // Prepare conversation data (may be null/undefined from client)
      const teachingData = teachingConversation || [];
      const assessmentData = assessmentConversation || [];
      
      // Verify we have at least one of: teaching conversation data or teaching thread ID
      if (!teachingThreadId && teachingData.length === 0) {
        return res.status(400).json({ 
          error: "Invalid request. Either teaching conversation data or thread ID is required." 
        });
      }
      
      // Generate a placeholder thread ID if we're only using Claude/Anthropic and don't have one
      const effectiveTeachingThreadId = teachingThreadId || `claude-teaching-${Date.now()}`;
      
      // Get N8N webhook URL for dynamic assistant
      if (!DYNAMIC_ASSISTANT_WEBHOOK_URL) {
        console.warn("N8N_DYNAMIC_WEBHOOK_URL environment variable not set");
        // Still return a success response with a warning to prevent blocking the UI
        return res.json({ 
          success: false, 
          message: "Dynamic assistant webhook URL not configured, continuing anyway",
          feedbackData: {
            summary: "You've completed this Social Studies Sample module successfully!",
            contentKnowledgeScore: 0,
            writingScore: 0,
            nextSteps: "Continue exploring more topics to expand your knowledge."
          }
        });
      }
      
      try {
        // Generate formatted transcripts for both conversations
        const teachingTranscript = teachingData
          .map((msg: { role: string; content: string }) => `${msg.role === 'assistant' ? 'Teacher' : 'Student'}: ${msg.content}`)
          .join('\n\n');
          
        const assessmentTranscript = assessmentData.length > 0 ? 
          assessmentData.map((msg: { role: string; content: string }) => `${msg.role === 'assistant' ? 'Reginald Worthington III' : 'Student'}: ${msg.content}`)
          .join('\n\n') : "";
          
        // Send complete data package to N8N webhook
        console.log("Calling teaching bot webhook with POST request (including full conversation data for Claude)");
        console.log("Dynamic webhook URL being used:", DYNAMIC_ASSISTANT_WEBHOOK_URL);
      
        const response = await axios.post(DYNAMIC_ASSISTANT_WEBHOOK_URL, {
          // Teaching bot data
          teachingThreadId: effectiveTeachingThreadId,  // Use our effective ID (real or generated)
          teachingConversation: teachingData, // Complete conversation data
          teachingTranscript, // Human-readable transcript
          
          // Assessment bot data (if available)
          assessmentThreadId: assessmentThreadId || `claude-assessment-${Date.now()}`, // Generate ID if missing
          assessmentConversation: assessmentData, // Complete conversation data
          assessmentTranscript, // Human-readable transcript
          
          // Flag to indicate we're using Claude/Anthropic (no thread API)
          usingClaudeAI: true,
          
          // Flag to indicate we're expecting feedback data in the response
          expectFeedbackData: true,
          
          // Common metadata
          timestamp: new Date().toISOString(),
          source: "learning-app-teaching",
          courseName: courseName || "Social Studies Sample", // Updated default course name
          chatDurationSeconds: chatDurationSeconds || 0,
          
          // Include sessionId for user identification in concurrent scenarios
          ...(sessionId ? { sessionId } : {})
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("Successfully sent Claude/Anthropic teaching data to N8N:", response.status);
        console.log("Teaching conversation data included. Message count:", teachingData.length);
        console.log("Teaching transcript length:", teachingTranscript.length, "characters");
        console.log("Assessment conversation data included. Message count:", assessmentData.length);
        console.log("Assessment transcript length:", assessmentTranscript.length, "characters");
        console.log("Teaching Thread ID:", effectiveTeachingThreadId);
        console.log("Assessment Thread ID:", assessmentThreadId || `claude-assessment-${Date.now()}`);
        console.log("Course name sent to N8N:", courseName || "Social Studies Sample");
        console.log("Chat duration sent to N8N:", chatDurationSeconds || 0, "seconds");
        console.log("Using Claude AI flag set to:", true);
        
        // Log message roles to help with debugging
        if (teachingData.length > 0) {
          const roles = teachingData.map((msg: { role: string }) => msg.role);
          console.log("Teaching message roles sequence:", roles.join(", "));
          
          // Log first and last teaching message snippets for context
          const firstMsg = teachingData[0];
          const lastMsg = teachingData[teachingData.length - 1];
          
          console.log("First teaching message:", {
            role: firstMsg.role,
            contentPreview: firstMsg.content.substring(0, 50) + "..."
          });
          
          console.log("Last teaching message:", {
            role: lastMsg.role,
            contentPreview: lastMsg.content.substring(0, 50) + "..."
          });
        }
        
        // Log assessment data if available
        if (assessmentData.length > 0) {
          const roles = assessmentData.map((msg: { role: string }) => msg.role);
          console.log("Assessment message roles sequence:", roles.join(", "));
        }
        
        // Extract feedback data from N8N response if available
        let feedbackData: {
          summary?: string;
          contentKnowledgeScore?: number;
          writingScore?: number;
          nextSteps?: string;
        } = {};
        
        // Log the exact N8N response for debugging - comprehensive logging
        console.log("N8N Response Data:", JSON.stringify(response.data));
        console.log("N8N Response Status:", response.status);
        console.log("N8N Response Headers:", JSON.stringify(response.headers));
        console.log("Response Data Type:", typeof response.data);
        console.log("Is Array?", Array.isArray(response.data));
        console.log("Raw response data (stringified):", JSON.stringify(response.data, null, 2));
        
        // DEBUG: Log raw request and response to understand what N8N is receiving and sending
        console.log("DEBUGGING N8N COMMUNICATION");
        console.log("----------------------------");
        console.log("We sent to N8N (request body sample):", JSON.stringify({
          teachingThreadId: effectiveTeachingThreadId,
          assessmentThreadId: assessmentThreadId || `claude-assessment-${Date.now()}`,
          // Other fields omitted for brevity
        }));
        console.log("We received from N8N:", JSON.stringify(response.data));
        console.log("----------------------------");
        
        // Deeper array inspection
        if (Array.isArray(response.data)) {
          console.log("Array Length:", response.data.length);
          
          // Inspect first item if it exists
          if (response.data.length > 0) {
            console.log("First Array Item:", JSON.stringify(response.data[0]));
            console.log("First Array Item Type:", typeof response.data[0]);
            if (response.data[0].feedbackData) {
              console.log("Found feedbackData in array format");
              console.log("feedbackData structure:", Object.keys(response.data[0].feedbackData));
            } else if (response.data[0].summary !== undefined) {
              console.log("Found summary directly in first array item");
            }
          }
        }
        
        // Object inspection
        if (typeof response.data === 'object' && response.data !== null) {
          console.log("Object Keys:", Object.keys(response.data));
          
          // If the object has summary and scores directly
          if (response.data.summary && response.data.contentKnowledgeScore !== undefined) {
            console.log("Found direct feedback properties at top level of response");
          }
        }
        
        // First check if response data is an array with the expected structure
        if (Array.isArray(response.data) && response.data.length > 0) {
          const firstItem = response.data[0];
          
          // Check for nested feedbackData
          if (firstItem.feedbackData) {
            console.log("MATCH: Processing array-formatted feedbackData from N8N");
            feedbackData = firstItem.feedbackData;
            console.log("Extracted nested feedbackData:", JSON.stringify(feedbackData));
          } 
          // Check for direct properties in the array item
          else if (firstItem.summary !== undefined && firstItem.contentKnowledgeScore !== undefined) {
            console.log("MATCH: Processing array item with direct properties");
            feedbackData = firstItem;
            console.log("Using array item directly:", JSON.stringify(feedbackData));
          }
        }
        // Then check for empty or null response
        else if (!response.data || (typeof response.data === 'object' && Object.keys(response.data).length === 0)) {
          console.log("WARNING: Received empty response from teaching webhook. Using fallback feedback data.");
          // Return hardcoded fallback feedback (using 0-4 scale)
          feedbackData = {
            summary: "You've completed this Social Studies Sample module with a good understanding of the three branches of government!",
            contentKnowledgeScore: 3.5,
            writingScore: 3.5,
            nextSteps: "Continue exploring the checks and balances between branches by reading more about specific historical cases where these powers were exercised."
          };
        } else if (response.data && typeof response.data === 'object') {
          // The response might be an array with a single object, or a direct object
          // Handle both cases by extracting the data appropriately
          let dataToProcess = response.data;
          
          // If the response is an array with at least one item, extract the first item
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log("Detected array response from N8N, extracting first item");
            console.log("Array response from N8N:", JSON.stringify(response.data));
            dataToProcess = response.data[0];
            console.log("Extracted item:", JSON.stringify(dataToProcess));
          }
          
          // Check if the data has a feedbackData field directly
          if (dataToProcess.feedbackData && typeof dataToProcess.feedbackData === 'object') {
            console.log("Found feedbackData object in N8N response");
            console.log("feedbackData object:", JSON.stringify(dataToProcess.feedbackData));
            const { summary, contentKnowledgeScore, writingScore, nextSteps } = dataToProcess.feedbackData;
            
            feedbackData = {
              summary: summary || "No summary provided",
              contentKnowledgeScore: contentKnowledgeScore || 0,
              writingScore: writingScore || 0,
              nextSteps: nextSteps || "No next steps provided"
            };
            
            console.log("Using feedbackData from N8N:", JSON.stringify(feedbackData));
          } 
          // Check for feedback fields at the top level of the response
          else if (dataToProcess.summary || dataToProcess.contentKnowledgeScore || 
                   dataToProcess.writingScore || dataToProcess.nextSteps) {
            console.log("Found feedback fields at top level of N8N response");
            const { summary, contentKnowledgeScore, writingScore, nextSteps } = dataToProcess;
            
            feedbackData = {
              summary: summary || "No summary provided",
              contentKnowledgeScore: contentKnowledgeScore || 0,
              writingScore: writingScore || 0,
              nextSteps: nextSteps || "No next steps provided"
            };
          } else {
            // No specific feedback fields found, use fallback
            console.log("WARNING: No feedback fields found in N8N response. Using fallback feedback data.");
            feedbackData = {
              summary: "You've completed this Social Studies Sample module with a good understanding of the three branches of government!",
              contentKnowledgeScore: 3.0,
              writingScore: 3.25,
              nextSteps: "Continue exploring more about how the branches interact in our government system."
            };
          }
        }
        
        // Extract session ID from N8N response if available
        let returnedSessionId = null;
        
        // Check if response data is an object with sessionId
        if (response.data && typeof response.data === 'object') {
          // Direct sessionId in the object
          if ('sessionId' in response.data) {
            returnedSessionId = response.data.sessionId;
            console.log(`N8N returned session ID in feedback flow: ${returnedSessionId || 'null'}`);
          } 
          // sessionId in the first item of an array
          else if (Array.isArray(response.data) && response.data.length > 0 && 
                  typeof response.data[0] === 'object' && 'sessionId' in response.data[0]) {
            returnedSessionId = response.data[0].sessionId;
            console.log(`N8N returned session ID in array for feedback flow: ${returnedSessionId || 'null'}`);
          }
        }
        
        // Log if session IDs match
        if (returnedSessionId && sessionId) {
          console.log(`Feedback flow: Session IDs match: ${returnedSessionId === sessionId}`);
        } else {
          console.log(`Feedback flow: Original session ID: ${sessionId || 'none'}, N8N session ID: ${returnedSessionId || 'none'}`);
        }
        
        // Store feedback data if we have a valid session ID
        if (sessionId && Object.keys(feedbackData).length > 0) {
          try {
            await storage.createFeedback({
              sessionId,
              summary: feedbackData.summary || "",
              contentKnowledgeScore: feedbackData.contentKnowledgeScore || 0,
              writingScore: feedbackData.writingScore || 0,
              nextSteps: feedbackData.nextSteps || ""
            });
            console.log(`Stored feedback data for session ${sessionId}`);
          } catch (err) {
            console.error("Error storing feedback data:", err);
            // Continue with the response even if storage fails
          }
        }
        
        // Create response object with session ID (prefer the one from N8N if valid)
        const responseObject = { 
          success: true, 
          message: "Combined teaching and assessment data sent to N8N successfully",
          feedbackData // Include the feedback data in the response
        };
        
        // Add session ID to the response if available - prefer N8N's returned one if valid
        if (returnedSessionId) {
          responseObject.sessionId = returnedSessionId;
        } else if (sessionId) {
          responseObject.sessionId = sessionId;
        }
        
        return res.json(responseObject);
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

  // Anthropic Claude API endpoint with streaming support
  app.post("/api/claude-chat", async (req, res) => {
    // Flag to track if headers have been sent to avoid errors
    let headersSent = false;
    let responseEnded = false;
    
    try {
      const { messages, systemPrompt, stream = false } = req.body;
      
      // Set up proper headers for streaming
      if (stream) {
        try {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          headersSent = true;
        } catch (headerError) {
          console.error('Error setting headers:', headerError);
          // If headers were already sent, we'll handle this gracefully
          headersSent = true;
        }
      }
      
      // Create a message ID to use as a thread ID
      const messageId = `claude-${Date.now()}`;
      
      // Set thread ID in response headers if possible
      if (!headersSent) {
        try {
          res.setHeader('X-Thread-Id', messageId);
        } catch (headerError) {
          console.error('Error setting thread ID header:', headerError);
          // Headers already sent, continue without setting this header
          headersSent = true;
        }
      }
      
      // Process the messages and system prompt for Claude format
      // Filter out system messages as Anthropic handles them separately
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== 'system')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      
      // Get the system prompt (either from messages or directly provided)
      const systemMessage = messages.find((msg: any) => msg.role === 'system');
      const finalSystemPrompt = systemMessage?.content || systemPrompt || '';
      
      console.log("Received system prompt on server:", finalSystemPrompt);
      
      // Handle streaming response
      if (stream) {
        // Defensive stream handler
        const handleStreamSafely = async () => {
          try {
            // Create stream with Anthropic
            const stream = await anthropic.messages.create({
              messages: anthropicMessages,
              system: finalSystemPrompt,
              model: "claude-3-7-sonnet-20250219", // Use the latest Claude model
              max_tokens: 20000,
              temperature: 1.0,
              stream: true
            });
            
            // Track response status
            responseEnded = !!res.writableEnded;
            
            // Set up early termination handling
            res.on('close', () => {
              responseEnded = true;
              if (!res.writableEnded) {
                try {
                  res.end();
                } catch (endError) {
                  console.error('Error ending response on close:', endError);
                }
              }
            });
            
            // Function to safely send events
            const sendEvent = (event: string, data: any) => {
              if (responseEnded || res.writableEnded) return;
              try {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
              } catch (writeError) {
                console.error('Error writing response chunk:', writeError);
                responseEnded = true;
              }
            };
            
            // Send the thread ID as the first event
            sendEvent('threadId', { threadId: messageId });
            
            // Process each chunk safely
            for await (const chunk of stream) {
              if (responseEnded || res.writableEnded) break;
              
              try {
                if (chunk.type === 'content_block_delta' && 
                    'delta' in chunk && 
                    'text' in chunk.delta && 
                    typeof chunk.delta.text === 'string') {
                  
                  // Send the content chunk
                  sendEvent('content', { content: chunk.delta.text });
                }
              } catch (chunkError) {
                console.error('Error processing chunk:', chunkError);
                // Continue with next chunk despite error
              }
            }
            
            // Signal the end of the stream safely
            if (!responseEnded && !res.writableEnded) {
              try {
                res.write('data: [DONE]\n\n');
                res.end();
                responseEnded = true;
              } catch (endError) {
                console.error('Error ending stream:', endError);
              }
            }
          } catch (streamError: any) {
            // Handle stream initialization errors
            console.error('Error during Claude streaming:', streamError);
            
            const isOverloaded = streamError.message && 
                                (streamError.message.includes("overloaded") || 
                                 streamError.message.includes("Overloaded"));
            
            const errorType = isOverloaded ? 'service_overloaded' : 'streaming_error';
            const errorMessage = isOverloaded ? 
                               'Claude API is currently overloaded. Please try again in a moment.' :
                               (streamError.message || 'Error during Claude API streaming');
            
            // Safely send error response depending on header state
            if (!headersSent && !responseEnded && !res.writableEnded) {
              // If headers not sent, send error response
              try {
                res.status(503).json({ 
                  error: errorType,
                  message: errorMessage,
                });
                responseEnded = true;
              } catch (jsonError) {
                console.error('Error sending error response:', jsonError);
              }
            } else if (!responseEnded && !res.writableEnded) {
              // If headers sent but response not ended, send error in SSE format
              try {
                res.write(`data: ${JSON.stringify({ error: true, message: errorMessage })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
                responseEnded = true;
              } catch (sseError) {
                console.error('Error sending error in SSE format:', sseError);
              }
            }
          }
        };
        
        // Execute the stream handler
        await handleStreamSafely();
        
      } else {
        // Non-streaming response with defensive handling
        try {
          // Attempt to get completion
          const completion = await anthropic.messages.create({
            messages: anthropicMessages,
            system: finalSystemPrompt,
            model: "claude-3-7-sonnet-20250219", // Use the latest Claude model
            max_tokens: 20000,
            temperature: 1.0
          });
          
          // Extract the response content
          const content = completion.content[0]?.type === 'text' 
            ? completion.content[0].text 
            : 'No response content available';
          
          // Store the conversation if we have a session ID
          const sessionId = req.sessionId;
          if (sessionId) {
            try {
              // Create a new conversation with the messages
              const allMessages = [
                ...anthropicMessages,
                { role: 'assistant', content }
              ];
              
              // Store the conversation
              await storage.createConversation({
                sessionId,
                threadId: messageId,
                assistantType: 'article',  // Default type - can be overridden with request param
                messages: allMessages
              });
              console.log(`Stored Claude conversation for session ${sessionId}, thread ${messageId}`);
            } catch (err) {
              console.error("Error storing Claude conversation:", err);
              // Continue with response even if storage fails
            }
          }
          
          // Only attempt to respond if we haven't already
          if (!responseEnded && !res.writableEnded) {
            res.json({
              choices: [
                {
                  message: {
                    content,
                    role: 'assistant'
                  }
                }
              ],
              threadId: messageId
            });
            responseEnded = true;
          }
        } catch (completionError: any) {
          console.error('Error in Claude API completion call:', completionError);
          
          // Only attempt to respond if we haven't already
          if (!responseEnded && !res.writableEnded) {
            // Provide a more useful error message for overload
            const isOverloaded = completionError.message && 
                                (completionError.message.includes("overloaded") || 
                                 completionError.message.includes("Overloaded"));
            
            res.status(isOverloaded ? 503 : 500).json({ 
              error: isOverloaded ? 'service_overloaded' : 'api_error',
              message: isOverloaded ? 
                      'Claude API is currently overloaded. Please try again in a moment.' :
                      (completionError.message || 'An error occurred with the Claude API')
            });
            responseEnded = true;
          }
        }
      }
    } catch (error: any) {
      console.error('Unhandled error in Claude API endpoint:', error);
      
      // Only attempt to respond if we haven't already
      if (!responseEnded && !res.writableEnded) {
        try {
          // If streaming headers were sent, respond in SSE format
          if (headersSent) {
            res.write(`data: ${JSON.stringify({ 
              error: true, 
              message: 'An unexpected error occurred with the Claude API' 
            })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
          } else {
            // Otherwise send normal JSON error
            res.status(500).json({ 
              error: 'unexpected_error',
              message: error.message || 'An unexpected error occurred with the Claude API' 
            });
          }
        } catch (responseError) {
          console.error('Failed to send error response:', responseError);
          // Last resort attempt to end the response
          try {
            if (!res.writableEnded) {
              res.end();
            }
          } catch (endError) {
            console.error('Failed to end response:', endError);
          }
        }
      }
    }
  });
  
  // OpenAI chat completions endpoint with streaming support
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, temperature, systemPrompt, assistantId, stream = false } = req.body;
      
      // Set up proper headers if streaming
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }
      
      // If an assistantId is provided or we have a default assistant ID, use the assistant API
      if (assistantId || DEFAULT_DISCUSSION_ASSISTANT_ID || DEFAULT_ASSESSMENT_ASSISTANT_ID) {
        const threadId = await createThread();
        
        // Add messages to the thread
        await addMessagesToThread(threadId, messages, systemPrompt);
        
        // Use the provided assistantId or select an appropriate default
        const actualAssistantId = assistantId || DEFAULT_DISCUSSION_ASSISTANT_ID || "";
        
        // Run the assistant
        const runId = await runAssistant(threadId, actualAssistantId);
        
        if (stream) {
          // Start streaming the response
          streamAssistantResponse(res, threadId, runId);
        } else {
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
        }
      } else {
        // Fallback to direct chat completion if no assistant ID is provided
        const messagesWithSystem = systemPrompt 
          ? [{ role: "system", content: systemPrompt }, ...messages] 
          : messages;
        
        if (stream) {
          // Use streaming API for regular completions
          const stream = await openai.chat.completions.create({
            model: model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages: messagesWithSystem,
            temperature: temperature || 1.0,
            stream: true,
          });
          
          // Stream each chunk as it comes in
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }
          
          // End the stream
          res.write('data: [DONE]\n\n');
          res.end();
        } else {
          // Regular non-streaming response
          const response = await openai.chat.completions.create({
            model: model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages: messagesWithSystem,
            temperature: temperature || 1.0,
          });
          
          res.json(response);
        }
      }
    } catch (error: any) {
      console.error("Error calling OpenAI:", error);
      
      // If streaming, send error in the stream format
      if (req.body.stream) {
        res.write(`data: ${JSON.stringify({ error: "Failed to process chat request" })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.status(500).json({ 
          error: "Failed to process chat request",
          details: error.message || String(error)
        });
      }
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
  
  // Enhanced streaming function with rapid polling for real-time updates
  async function streamAssistantResponse(res: any, threadId: string, runId: string) {
    try {
      console.log(`Starting enhanced streaming for thread ${threadId}, run ${runId}`);
      
      // Set headers for server-sent events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Track the run status and gather latest messages
      let run = await openai.beta.threads.runs.retrieve(threadId, runId);
      
      // Keep track of which messages we've already processed
      let processedContentParts = new Set();
      let latestMessageId = '';
      let latestContentIndex = -1;  // Index within a message's content parts
      
      // Poll rapidly while the run is processing
      while (run.status === 'queued' || run.status === 'in_progress') {
        // Get the latest messages
        const messagesResponse = await openai.beta.threads.messages.list(threadId, { 
          order: 'desc',  // Get newest messages first
          limit: 10       // Reasonable limit for recent messages
        });
        
        // Process each message's content incrementally
        for (const message of messagesResponse.data) {
          // Only process assistant messages
          if (message.role !== 'assistant') continue;
          
          // If this is a new message or we're still on the same message
          if (message.id !== latestMessageId) {
            // Reset state for the new message
            latestMessageId = message.id;
            latestContentIndex = -1;
          }
          
          // Process any new content parts since our last check
          for (let i = 0; i < message.content.length; i++) {
            const content = message.content[i];
            
            // Only process if it's text content and we haven't processed it before
            if (content.type === 'text' && i > latestContentIndex) {
              const text = content.text.value;
              latestContentIndex = i;
              
              // Process the content with preservation of formatting
              // Split text into chunks that preserve newlines
              const chunks = [];
              
              // Split by newlines first, to preserve paragraph breaks
              const paragraphs = text.split(/(\n+)/);
              
              // Then split each paragraph into words
              for (const paragraph of paragraphs) {
                if (paragraph.match(/^\n+$/)) {
                  // This is just newlines, send as is to preserve formatting
                  chunks.push(paragraph);
                } else if (paragraph.trim() !== '') {
                  // Split non-empty paragraphs into words
                  const words = paragraph.split(/(\s+)/);
                  chunks.push(...words);
                }
              }
              
              // Send each chunk with appropriate timing
              for (const chunk of chunks) {
                if (chunk) {
                  // Send chunk with formatting preserved
                  res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                  
                  // Adjust timing based on chunk type
                  if (chunk.match(/^\n+$/)) {
                    // Newlines - send quickly
                    await new Promise(resolve => setTimeout(resolve, 5));
                  } else {
                    // Words - slightly longer delay
                    await new Promise(resolve => setTimeout(resolve, 15));
                  }
                }
              }
            }
          }
        }
        
        // Check the run status again
        run = await openai.beta.threads.runs.retrieve(threadId, runId);
        
        // Brief pause to avoid hammering the API
        if (run.status === 'queued' || run.status === 'in_progress') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Final check for any last messages when the run completes
      if (run.status === 'completed') {
        // Get the final messages to be sure we have everything
        const finalMessages = await openai.beta.threads.messages.list(threadId, { order: 'desc', limit: 5 });
        
        // Process any new content we might have missed
        for (const message of finalMessages.data) {
          if (message.role === 'assistant' && message.id !== latestMessageId) {
            for (const content of message.content) {
              if (content.type === 'text') {
                const text = content.text.value;
                
                // Send any final text that might have been missed
                res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
              }
            }
          }
        }
      } else {
        // Handle non-completed runs
        res.write(`data: ${JSON.stringify({ error: `Run ended with status: ${run.status}` })}\n\n`);
      }
      
      // Send the thread ID at the end
      res.write(`data: ${JSON.stringify({ threadId })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Error streaming assistant response:', error);
      res.write(`data: ${JSON.stringify({ error: error.message || String(error) })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
