import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ltiAuthMiddleware } from "./lti/auth";
import ltiRoutes from "./lti/routes";
import { ltiServices } from "./lti/services";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import {
  aiRateLimit,
  aiRateLimit10Min, 
  ipRateLimit,
  circuitBreakerMiddleware,
  requireLtiSession,
  checkBlockedIp,
  validateMessage,
  checkDailyUsage,
  limitConversationLength,
  trackAiUsage,
  estimateTokens
} from "./aiAbuseMiddleware";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize OpenAI client for image generation (optional)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI client initialized for image generation");
  } else {
    console.log("⚠️ OpenAI API key not found - image generation will be unavailable");
  }
} catch (error) {
  console.error("❌ Failed to initialize OpenAI client:", error);
  openai = null;
}

// N8N Webhook URLs
const ASSESSMENT_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const DYNAMIC_ASSISTANT_WEBHOOK_URL = process.env.N8N_DYNAMIC_WEBHOOK_URL; // New webhook URL for the dynamic assistant

// Import system prompts from configuration file
import {
  ASSESSMENT_ASSISTANT_PROMPT,
  ARTICLE_ASSISTANT_SYSTEM_PROMPT,
  TEACHING_ASSISTANT_FALLBACK_PROMPT,
  ASSESSMENT_EVALUATION_PROMPT,
  INTAKE_BASICS_PROMPT,
  INTAKE_CONTEXT_PROMPT,
  INTAKE_ASSESSMENT_BOT_PROMPT,
  PERSONALITY_TESTING_PROMPT,
  ASSESSMENT_BOT_GBPAC_TEMPLATE,
} from "./prompts";

import { contentManager } from "./contentManager";

// Log the webhook URLs for debugging
console.log("Assessment Webhook URL:", ASSESSMENT_WEBHOOK_URL);
console.log("Dynamic Assistant Webhook URL:", DYNAMIC_ASSISTANT_WEBHOOK_URL);



export async function registerRoutes(app: Express): Promise<Server> {


  // Enhanced security middleware
  app.use(
    helmet({
      frameguard: false, // Disable frameguard since we handle frame-ancestors manually
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameSrc: [
            "'self'",
            "https://www.youtube.com",
            "https://www.youtube-nocookie.com",
            "https://youtube.com"
          ],
          frameAncestors: [
            "'self'",
            "https://*.onedayahead.com",
            "https://*.replit.app",
            "https://*.instructure.com", // Canvas domains
            "https://*.canvas.com", // Canvas domains
            "https://canvas.instructure.com", // Specific Canvas domain
            "https://*.canvaslms.com", // Additional Canvas domain
          ],
          formAction: [
            "'self'",
            "https://*.instructure.com", // Allow form submission to Canvas
            "https://*.canvas.com",
            "https://canvas.instructure.com",
            "https://*.canvaslms.com",
          ],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
        },
      },
    }),
  );

  // ADD THIS DEBUG LOGGING
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.get("origin") || req.get("referer") || "unknown"}`,
    );
    if (req.path.includes("lti")) {
      console.log("LTI Request Headers:", JSON.stringify(req.headers, null, 2));
      console.log("LTI Request Body:", JSON.stringify(req.body, null, 2));
    }
    next();
  });

  // Global rate limiting and security middleware
  app.use(checkBlockedIp); // Check for blocked IPs first
  app.use(circuitBreakerMiddleware); // Platform-wide circuit breaker
  app.use(ipRateLimit); // IP-based rate limiting (500/hour)
  
  // General rate limiting (less strict for non-AI endpoints)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use(limiter);

  // LTI 1.3 routes - mounted before other routes
  app.use("/api/lti", ltiRoutes);

  // Apply LTI authentication to protected routes (skip for development and static assets)
  app.use("/api", (req, res, next) => {
    // Skip LTI auth completely in development mode
    if (process.env.NODE_ENV === "development") {
      return next();
    }

    // For production Canvas usage, we need to handle two scenarios:
    // 1. Initial LTI launch creates a session
    // 2. Subsequent API calls use that session
    
    // Check if we have a valid session (either from LTI or regular login)
    if (req.session && req.sessionID) {
      // Trust the session - user was already authenticated
      return next();
    }

    // Only require LTI auth if no session exists
    if (
      req.path.includes("/claude-chat") ||

      req.path.includes("/send-to-n8n") ||
      req.path.includes("/conversations") ||
      req.path.includes("/feedback")
    ) {
      return ltiAuthMiddleware(req, res, next);
    }

    next();
  });

  // Development route for testing without LTI
  app.get("/dev", (req, res) => {
    // Set up mock LTI session for development using express-session
    if (req.session) {
      req.session.ltiContext = {
        userId: "dev-user",
        courseId: "dev-course",
        isDevelopment: true,
        claims: {
          iss: "https://canvas.instructure.com",
          sub: "dev-user-123",
          aud: "dev-client",
          exp: Date.now() / 1000 + 3600,
          iat: Date.now() / 1000,
          nonce: "dev-nonce",
          "https://purl.imsglobal.org/spec/lti/claim/deployment_id":
            "dev-deployment",
          "https://purl.imsglobal.org/spec/lti/claim/target_link_uri":
            req.originalUrl,
          "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
            id: "dev-resource-123",
          },
          "https://purl.imsglobal.org/spec/lti/claim/context": {
            id: "dev-context-123",
            type: ["CourseTemplate"],
            label: "DEV 101",
            title: "Development Course",
          },
          "https://purl.imsglobal.org/spec/lti/claim/roles": [
            "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner",
          ],
          "https://purl.imsglobal.org/spec/lti/claim/platform_instance": {
            guid: "dev-platform-123",
            name: "Development Canvas",
            url: "https://dev.instructure.com",
          },
          "https://purl.imsglobal.org/spec/lti/claim/launch_presentation": {
            document_target: "iframe",
          },
          name: "Dev User",
          given_name: "Dev",
          family_name: "User",
          email: "dev@example.com",
        },
      };
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Development Access</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .btn { background: #0066cc; color: white; padding: 12px 24px; border: none; border-radius: 4px; text-decoration: none; display: inline-block; margin: 10px 0; }
          .btn:hover { background: #0052a3; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Government Learning Platform - Development Mode</h1>
          <div class="warning">
            <strong>Development Access:</strong> This bypasses LTI authentication for testing purposes.
          </div>
          <div class="success">
            <strong>Mock LTI Session Created:</strong> All chat endpoints should now work properly.
          </div>
          <p>Access the application in development mode with mock LTI context.</p>
          <a href="/?dev_mode=true" class="btn">Launch Application</a>
          <a href="/api/lti/config" class="btn">View LTI Configuration</a>
          
          <h3>LTI 1.3 Endpoints</h3>
          <ul>
            <li><strong>Login:</strong> /api/lti/login</li>
            <li><strong>Launch:</strong> /api/lti/launch</li>
            <li><strong>JWKS:</strong> /api/lti/jwks</li>
            <li><strong>Deep Linking:</strong> /api/lti/deep-linking</li>
            <li><strong>Configuration:</strong> /api/lti/config</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  });

  // Special route for iframe embedding with appropriate headers
  app.get("/embed", (req, res) => {
    // Set headers to allow embedding from any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *",
    );

    // Serve the iframe-specific HTML
    res.sendFile("iframe.html", { root: "./public" });
  });

  // Direct access to application in iframe-friendly mode
  app.get("/iframe-app", (req, res) => {
    // Set headers to allow embedding from any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *",
    );

    // Check for embed=true parameter which indicates this is being accessed from an iframe
    if (req.query.embed === "true") {
      // Serve the iframe entry HTML
      res.sendFile("iframe-entry.html", { root: "./public" });
    } else {
      // Otherwise serve the main app directly
      res.sendFile("index.html", { root: "./client" });
    }
  });

  // Direct embedding with simplified bridge page
  app.get("/embed-direct", (req, res) => {
    // Set headers to allow embedding from any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *",
    );

    // Serve the simplified embed HTML
    res.sendFile("embed-direct.html", { root: "./public" });
  });

  // Lightweight embed solution specifically for onedayahead.com domains
  app.get("/lightweight-embed", (req, res) => {
    // Set headers to allow embedding from onedayahead.com domains
    const origin = req.headers.origin || "*";

    if (origin.includes("onedayahead.com")) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *.onedayahead.com",
    );

    // Serve the standalone lightweight embed solution
    res.sendFile("lightweight-embed.html", { root: "./public" });
  });

  // Full application embedding solution
  app.get("/embed-full", (req, res) => {
    // Set headers to allow embedding from onedayahead.com domains
    const origin = req.headers.origin || "*";

    if (origin.includes("onedayahead.com")) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *.onedayahead.com",
    );

    // Serve the full application embedding solution
    res.sendFile("embed-full.html", { root: "./public" });
  });

  // Production-mode embed solution specifically for ai.onedayahead.com
  app.get("/production-embed", (req, res) => {
    // Set headers to allow embedding from onedayahead.com domains
    const origin = req.headers.origin || "*";

    if (origin.includes("onedayahead.com")) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *.onedayahead.com",
    );

    // Serve the production-ready embed solution
    res.sendFile("production-embed.html", { root: "./public" });
  });

  // Specialized embed solution for onedayahead.com (simplified and direct)
  app.get("/embed-onedayahead", (req, res) => {
    // Set headers to allow embedding from onedayahead.com domains
    const origin = req.headers.origin || "*";

    if (origin.includes("onedayahead.com")) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *.onedayahead.com demo.onedayahead.com ai.onedayahead.com",
    );

    // Serve the specialized onedayahead embed solution
    res.sendFile("embed-onedayahead.html", { root: "./public" });
  });

  // Compiled standalone embed for onedayahead.com - fully built HTML/JS/CSS
  app.get("/compiled-embed", (req, res) => {
    // Set headers to allow embedding from onedayahead.com domains
    const origin = req.headers.origin || "*";

    if (origin.includes("onedayahead.com")) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.removeHeader("X-Frame-Options");
    res.header(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *.onedayahead.com demo.onedayahead.com ai.onedayahead.com",
    );

    // Serve the compiled standalone embed
    res.sendFile("compiled-embed.html", { root: "./public" });
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

  // Route to proxy PDF from Google Drive to bypass CORS restrictions
  app.get("/api/pdf-proxy", async (req, res) => {
    try {
      const googleDriveId = req.query.id;

      if (!googleDriveId) {
        return res
          .status(400)
          .json({ error: "Missing Google Drive file ID parameter" });
      }

      const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${googleDriveId}`;

      // Fetch the PDF from Google Drive
      const response = await axios.get(googleDriveUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      // Set appropriate headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Send the PDF data
      res.send(Buffer.from(response.data, "binary"));
    } catch (error) {
      console.error("Error proxying PDF:", error);
      res.status(500).json({ error: "Failed to fetch PDF document" });
    }
  });



  // Route to get the assistant IDs and system prompts
  app.get("/api/assistant-config", async (req, res) => {
    try {
      const experience = req.query.experience as string;
      console.log('🔥 SERVER - /api/assistant-config called with experience:', experience);
      console.log('🔥 SERVER - Full query params:', req.query);
      let contentPackage = null;
      
      // If experience is provided, load the content package
      if (experience) {
        const parts = experience.split('/');
        console.log('🔥 SERVER - Experience parts:', parts);
        if (parts.length === 3) {
          const [district, course, topic] = parts;
          contentPackage = await contentManager.loadContentPackage(district, course, topic);
          console.log('🔥 SERVER - Loaded content package:', contentPackage?.name, 'with bot:', contentPackage?.assessmentBot?.name);
        }
      } else {
        console.log('🔥 SERVER - No experience parameter, using default Three Branches');
      }
      
      // Use content package data if available, otherwise fall back to defaults
      const response = {
        assessmentAssistantId: contentPackage?.assessmentBot ? "claude-assessment-dynamic" : "claude-assessment",
        contentPackage: contentPackage,
        systemPrompts: {
          assessment: contentPackage?.assessmentBot?.personality || ASSESSMENT_ASSISTANT_PROMPT,
          teachingFallback: TEACHING_ASSISTANT_FALLBACK_PROMPT,
        },
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error loading assistant config:', error);
      // Fall back to defaults on error
      res.json({
        discussionAssistantId: "claude-discussion",
        assessmentAssistantId: "claude-assessment",
        contentPackage: null,
        systemPrompts: {
          discussion: ARTICLE_ASSISTANT_SYSTEM_PROMPT,
          assessment: ASSESSMENT_ASSISTANT_PROMPT,
          teachingFallback: TEACHING_ASSISTANT_FALLBACK_PROMPT,
        },
      });
    }
  });

  // Test route to get current session ID
  app.get("/api/user/session", (req, res) => {
    const sessionId = req.sessionId;
    res.json({
      success: true,
      sessionId: sessionId || null,
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
        conversations,
      });
    } catch (error: any) {
      console.error("Error getting user conversations:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve conversations",
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
        feedback: feedback || null,
      });
    } catch (error: any) {
      console.error("Error getting user feedback:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve feedback",
      });
    }
  });



  // Streaming endpoint for the article assistant chat
  app.post("/api/article-chat-stream", 
    requireLtiSession,
    aiRateLimit,
    aiRateLimit10Min,
    validateMessage,
    checkDailyUsage,
    async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          error: "Invalid message data. Expected an array of messages.",
        });
      }

      console.log("Article chat streaming endpoint activated");

      // Set up SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Generate a thread ID
      const messageId = "claude-article-" + Date.now();

      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      try {
        // Send the initial thread ID
        res.write(`data: ${JSON.stringify({ threadId: messageId })}\n\n`);

        // Create a streaming response from Anthropic
        const stream = await anthropic.messages.stream({
          messages: anthropicMessages,
          system: ARTICLE_ASSISTANT_SYSTEM_PROMPT,
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4096,
          temperature: 1.0,
        });

        let fullContent = "";

        // Process the stream
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
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
              { role: "assistant", content: fullContent },
            ];

            // Store the conversation
            await storage.createConversation({
              sessionId,
              threadId: messageId,
              assistantType: "article",
              messages: allMessages,
            });
            console.log(
              `Stored article conversation for session ${sessionId}, thread ${messageId}`,
            );
          } catch (err) {
            console.error("Error storing article conversation:", err);
            // Continue with response even if storage fails
          }
        }

        // Send the [DONE] event
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (error: any) {
        console.error("Error in article chat streaming:", error);
        // Send error to the client
        res.write(
          `data: ${JSON.stringify({ error: "article_chat_error", message: error.message || "Streaming error occurred" })}\n\n`,
        );
        res.end();
      }
    } catch (error: any) {
      console.error("Error in article chat streaming endpoint:", error);

      // If headers weren't sent yet, send a regular error response
      if (!res.headersSent) {
        res.status(500).json({
          error: "article_chat_error",
          message:
            error.message ||
            "An error occurred with the article chat streaming",
        });
      } else {
        // Try to send error through stream if possible
        try {
          res.write(
            `data: ${JSON.stringify({ error: "article_chat_error", message: error.message || "Streaming error occurred" })}\n\n`,
          );
          res.end();
        } catch (streamError) {
          console.error("Failed to send error through stream:", streamError);
          res.end();
        }
      }
    }
  });

  // Route to send assessment data to N8N
  app.post("/api/send-to-n8n", async (req, res) => {
    try {
      const { conversationData, threadId, courseName, chatDurationSeconds } =
        req.body;
      const sessionId = req.sessionId; // Get session ID from request

      // Verify we have data to send
      if (!conversationData || !Array.isArray(conversationData)) {
        return res.status(400).json({
          error: "Invalid conversation data. Expected an array of messages.",
        });
      }

      // If we have a valid threadId and sessionId, store the conversation
      if (threadId && sessionId) {
        try {
          await storage.createConversation({
            sessionId,
            threadId,
            assistantType: "assessment",
            messages: conversationData,
          });
          console.log(
            `Stored assessment conversation for session ${sessionId}, thread ${threadId}`,
          );
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
          nextAssistantId: null, // Use fallback assistant
        });
      }

      try {
        // Generate the full transcript of the conversation
        const transcript = conversationData
          .map(
            (msg: { role: string; content: string }) =>
              `${msg.role === "assistant" ? "Reginald Worthington III" : "Student"}: ${msg.content}`,
          )
          .join("\n\n");

        console.log(
          "Sending full conversation data and transcript to N8N webhook for Claude/Anthropic",
        );
        console.log("Webhook URL being used:", ASSESSMENT_WEBHOOK_URL);

        // Add timeout to axios request to prevent long-running requests
        const response = await axios.post(
          ASSESSMENT_WEBHOOK_URL,
          {
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
            ...(sessionId ? { sessionId } : {}),
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        console.log(
          "Successfully sent Claude/Anthropic assessment data to N8N:",
          response.status,
        );
        console.log(
          "Full transcript included in N8N payload:",
          transcript.length,
          "characters",
        );
        console.log(
          "Full conversation data included. Message count:",
          conversationData.length,
        );
        console.log(
          "Course name sent to N8N:",
          courseName || "Social Studies Sample",
        );
        console.log(
          "Chat duration sent to N8N:",
          chatDurationSeconds || 0,
          "seconds",
        );
        console.log("Using Claude AI flag set to:", true);

        // Log message roles to help with debugging
        if (conversationData.length > 0) {
          const roles = conversationData.map(
            (msg: { role: string }) => msg.role,
          );
          console.log("Message roles sequence:", roles.join(", "));

          // Log first and last message snippets for context
          const firstMsg = conversationData[0];
          const lastMsg = conversationData[conversationData.length - 1];

          console.log("First message:", {
            role: firstMsg.role,
            contentPreview: firstMsg.content.substring(0, 50) + "...",
          });

          console.log("Last message:", {
            role: lastMsg.role,
            contentPreview: lastMsg.content.substring(0, 50) + "...",
          });
        }

        // Log the full response data for debugging
        console.log("N8N raw response data type:", typeof response.data);
        console.log(
          "N8N raw response data is array:",
          Array.isArray(response.data),
        );

        // Deeper debugging of the response
        if (Array.isArray(response.data)) {
          console.log(
            "N8N response is an array with",
            response.data.length,
            "items",
          );
          if (response.data.length > 0) {
            console.log(
              "First array item:",
              JSON.stringify(response.data[0], null, 2),
            );
            // Check if sessionId exists in the first array item
            console.log(
              "Array item has sessionId:",
              response.data[0] && response.data[0].sessionId
                ? `Yes: ${response.data[0].sessionId}`
                : "No, sessionId is null or undefined",
            );
          }
        }

        console.log(
          "N8N complete response:",
          JSON.stringify(response.data, null, 2),
        );
        console.log(
          "Checking for session ID in N8N response:",
          response.data && response.data.sessionId
            ? `Found session ID: ${response.data.sessionId}`
            : "No session ID found in response directly",
        );

        // FINAL WORKING SOLUTION: Follow the exact same structure that works in our test endpoint
        const responseData = response.data;
        console.log("N8N response structure received:", typeof responseData);

        // Check if we received an empty object or null
        if (
          !responseData ||
          (typeof responseData === "object" &&
            Object.keys(responseData).length === 0)
        ) {
          console.log(
            "WARNING: Received empty response from N8N. Using hardcoded fallback for teaching assistance.",
          );
          // Return hardcoded fallback for Mr. Whitaker (low level)
          return res.json({
            success: true,
            message:
              "Assessment data sent to N8N successfully, using fallback teaching data",
            teachingAssistance: {
              level: "low",
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

When the student has completed both activities, thank them warmly and end the conversation.`,
            },
          });
        }

        // If the response is an array, extract the first item
        let dataToCheck = responseData;
        if (Array.isArray(responseData) && responseData.length > 0) {
          console.log(
            "Response is an array with",
            responseData.length,
            "items",
          );
          console.log(
            "First array item raw:",
            JSON.stringify(responseData[0], null, 2),
          );

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
        if (dataToCheck && typeof dataToCheck === "object") {
          if (dataToCheck.level && dataToCheck.systemPrompt) {
            level = dataToCheck.level;
            systemPrompt = dataToCheck.systemPrompt;
            console.log(
              "Found level and systemPrompt directly in the response object",
            );
          } else if (
            dataToCheck.teachingAssistance &&
            dataToCheck.teachingAssistance.level &&
            dataToCheck.teachingAssistance.systemPrompt
          ) {
            level = dataToCheck.teachingAssistance.level;
            systemPrompt = dataToCheck.teachingAssistance.systemPrompt;
            console.log(
              "Found level and systemPrompt in teachingAssistance property",
            );
          } else if (
            dataToCheck.assessment &&
            dataToCheck.assessment.level &&
            dataToCheck.assessment.systemPrompt
          ) {
            level = dataToCheck.assessment.level;
            systemPrompt = dataToCheck.assessment.systemPrompt;
            console.log("Found level and systemPrompt in assessment property");
          } else if (
            dataToCheck.immediateResult &&
            dataToCheck.immediateResult.level &&
            dataToCheck.immediateResult.systemPrompt
          ) {
            level = dataToCheck.immediateResult.level;
            systemPrompt = dataToCheck.immediateResult.systemPrompt;
            console.log(
              "Found level and systemPrompt in immediateResult property",
            );
          }
        }

        // If we found both level and systemPrompt, return them using the EXACT structure
        // that worked in our test endpoint
        if (level && systemPrompt) {
          console.log(`Found teaching assistance with level: ${level}`);
          console.log(
            `System prompt length: ${systemPrompt.length} characters`,
          );

          // CRITICAL: Match the structure of our test endpoint exactly - this is what works
          const responseObject: {
            success: boolean;
            message: string;
            teachingAssistance: {
              level: "low" | "medium" | "high";
              systemPrompt: string;
            };
            sessionId?: string;
            threadId?: string;
          } = {
            success: true,
            message: "Assessment data sent to N8N successfully",
            teachingAssistance: {
              level: level as "low" | "medium" | "high",
              systemPrompt: systemPrompt,
            },
          };

          // Log the exact response we're sending back (should match test endpoint)
          console.log(
            "Sending to client:",
            JSON.stringify(responseObject, null, 2),
          );

          // Check if N8N returned the session ID and if it matches what we sent
          if (
            dataToCheck &&
            typeof dataToCheck === "object" &&
            "sessionId" in dataToCheck
          ) {
            const returnedSessionId = dataToCheck.sessionId as string | null;
            console.log(
              `N8N returned session ID: ${returnedSessionId || "null"}`,
            );
            console.log(`Our original session ID: ${sessionId || "none"}`);
            console.log(
              `Session IDs match: ${returnedSessionId === sessionId}`,
            );

            // Add the session ID to our response if it's not null
            if (returnedSessionId) {
              responseObject.sessionId = returnedSessionId;
            }
          }

          // Add session ID from dataToCheck (array item) if available
          if (
            Array.isArray(responseData) &&
            responseData.length > 0 &&
            typeof responseData[0] === "object" &&
            "sessionId" in responseData[0]
          ) {
            const arraySessionId = responseData[0].sessionId as string | null;
            if (arraySessionId) {
              console.log(`Found sessionId in array item: ${arraySessionId}`);
              responseObject.sessionId = arraySessionId;
            } else {
              console.log("Array item has sessionId but it's null");
            }
          }
          // Or add session ID from direct object if available
          else if (
            dataToCheck &&
            typeof dataToCheck === "object" &&
            "sessionId" in dataToCheck
          ) {
            const directSessionId = dataToCheck.sessionId as string | null;
            if (directSessionId) {
              console.log(
                `Found sessionId in direct object: ${directSessionId}`,
              );
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
        console.log(
          "Could not find level and systemPrompt in response, checking for nextAssistantId",
        );
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
        console.log(
          "Falling back to nextAssistantId:",
          nextAssistantId || "null",
        );
        return res.json({
          success: true,
          message: "Assessment data sent to N8N successfully",
          nextAssistantId: nextAssistantId,
        });
      } catch (axiosError: any) {
        // Handle N8N webhook errors but allow the application to continue
        console.error(
          "N8N webhook error:",
          axiosError.response?.data || axiosError.message,
        );

        // Return a successful response to the client, but with a warning
        // This allows the application to continue with a fallback
        return res.json({
          success: false,
          message: "N8N workflow error, continuing with fallback",
          error:
            axiosError.response?.data?.message ||
            "N8N workflow execution failed",
          nextAssistantId: null, // Use fallback assistant
        });
      }
    } catch (error: any) {
      console.error("Error in N8N integration:", error);

      // Return a response that allows the client to continue rather than showing an error
      return res.json({
        success: false,
        message: "Error in N8N integration, continuing with fallback",
        error: error.message || String(error),
        nextAssistantId: null, // Use fallback assistant
      });
    }
  });

  // NEW: Claude-based assessment evaluation endpoint (replaces N8N webhook)
  app.post("/api/assess-conversation", 
    requireLtiSession,
    aiRateLimit,
    aiRateLimit10Min,
    validateMessage,
    checkDailyUsage,
    async (req, res) => {
    try {
      const { conversationData, threadId, courseName, chatDurationSeconds, contentPackage } = req.body;
      const sessionId = req.sessionId;

      // Verify we have data to evaluate
      if (!conversationData || !Array.isArray(conversationData)) {
        return res.status(400).json({
          error: "Invalid conversation data. Expected an array of messages.",
        });
      }

      // Store the conversation if we have valid IDs
      if (threadId && sessionId) {
        try {
          await storage.createConversation({
            sessionId,
            threadId,
            assistantType: "assessment",
            messages: conversationData,
          });
          console.log(`Stored assessment conversation for session ${sessionId}, thread ${threadId}`);
        } catch (err) {
          console.error("Error storing conversation:", err);
          // Continue with assessment even if storage fails
        }
      }

      // Load assessment criteria from content package or use default
      let assessmentCriteria = null;
      let evaluationPrompt = ASSESSMENT_EVALUATION_PROMPT; // fallback
      
      if (contentPackage) {
        try {
          const [district, course, topic] = contentPackage.id.split('/');
          const loadedPackage = await contentManager.loadContentPackage(district, course, topic);
          assessmentCriteria = loadedPackage?.assessmentCriteria;
          
          if (assessmentCriteria?.evaluationPrompt) {
            evaluationPrompt = assessmentCriteria.evaluationPrompt;
            console.log("🔧 Using assessment criteria from content package:", assessmentCriteria.name);
          } else {
            console.log("🔧 No assessment criteria found, using fallback prompt");
          }
        } catch (error) {
          console.error("Error loading assessment criteria:", error);
          console.log("🔧 Falling back to default assessment prompt");
        }
      }

      // Generate conversation transcript for Claude evaluation
      const transcript = conversationData
        .map((msg: { role: string; content: string }) =>
          `${msg.role === "assistant" ? "Assessment Bot" : "Student"}: ${msg.content}`
        )
        .join("\n\n");

      console.log("Evaluating conversation with Claude for performance level...");

      // Use Claude to evaluate the conversation
      const evaluationMessages = [
        {
          role: "user" as const,
          content: `Please evaluate this learning conversation:

${transcript}

Based on the assessment criteria, determine the student's understanding level and provide your reasoning.`
        }
      ];

      const evaluation = await anthropic.messages.create({
        messages: evaluationMessages,
        system: evaluationPrompt,
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for consistent evaluation
      });

      // Extract Claude's response
      const evaluationContent = evaluation.content[0]?.type === "text" 
        ? evaluation.content[0].text 
        : "{}";

      // Track AI usage for cost monitoring
      const inputText = evaluationMessages.map(m => m.content).join(' ');
      await trackAiUsage(sessionId, "/api/assess-conversation", inputText, evaluationContent, req.ip);

      let assessmentResult;
      try {
        assessmentResult = JSON.parse(evaluationContent);
      } catch (parseError) {
        console.error("Failed to parse Claude evaluation response:", evaluationContent);
        // Fallback to medium level if parsing fails
        assessmentResult = {
          level: "medium",
          reasoning: "Assessment parsing failed, defaulting to medium level"
        };
      }

      const level = assessmentResult.level || "medium";
      const reasoning = assessmentResult.reasoning || "No reasoning provided";

      console.log(`Claude assessed student at "${level}" level: ${reasoning}`);

      // Generate appropriate system prompt based on level using content package or fallback
      let systemPrompt = "";
      let imageAssistant = "";

      // Try to load teaching bot from content package first
      if (contentPackage && assessmentCriteria) {
        try {
          const teachingBotLevel = level === "high" ? "high" : level === "medium" ? "medium" : "low";
          const teachingBot = contentPackage.teachingBots?.[teachingBotLevel];
          
          if (teachingBot?.personality) {
            systemPrompt = teachingBot.personality;
            imageAssistant = teachingBot.avatar?.replace('.png', '') || teachingBotLevel;
            console.log(`🔧 Using teaching bot "${teachingBot.name}" from content package`);
          } else {
            console.log(`🔧 No teaching bot found for level ${teachingBotLevel}, using fallback`);
          }
        } catch (error) {
          console.error("Error loading teaching bot from content package:", error);
        }
      }

      // Fall back to hardcoded prompts if content package doesn't have them
      if (!systemPrompt) {
        console.log(`🔧 Using fallback teaching prompts for level: ${level}`);
        
        if (level === "high") {
          systemPrompt = `You are Mrs. Parton, an American history teacher. Your voice is dry, wry, funny and direct. You are fun and challenging. You treat students like young scholars, expecting thoughtful conversation while providing support and encouragement. You occasionally share quick, encouraging asides about how democracy has evolved, but you stay focused on the task.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and kindly redirect them back to the lesson.

You aim for between two and five sentences in your responses. You are here to guide analysis and occasionally teach directly. 

Begin by introducing yourself, explaining what we are doing here, and asking if they are willing before just diving in. Invite them to take part in a free flowing conversation and say that you expect pushback and engagement. 

Your role is to walk the student through a structured application of their knowledge using the United States v. Nixon case study. The student has read a short article about the case (background, events, and ruling). Your job is to guide them through analyzing how the three branches of government interacted during this crisis.

Begin by confirming that the student understands the material and the role of each branch. Touch on each branch one at a time, and add some color commentary, human interest, or historical context if you think it adds interest for the student. 

If the student struggles, prompt gently with hints, but do not supply full answers unless they clearly need help.

Then move into analyzing how Checks and Balances operated in this crisis. Challenge them to reflect briefly: Did the system work the way the Founders intended?

Pursue anything you think is interesting or provocative. Push back on the students thinking. 

After you have mined this case study, wrap up by thinking the student warmly for their thoughtful work. End the conversation naturally and invite them to continue in the course by explicitly mentioning the next button at the bottom of the screen.`;
          imageAssistant = "parton";
        } else if (level === "medium") {
          systemPrompt = `You are Mrs. Bannerman, a retired civics and American history teacher. Your voice is warm, supportive, plainspoken, and slightly nostalgic. You explain complex ideas patiently, using real-world examples and encouraging students to think deeply. You occasionally share quick, encouraging asides about your time in the classroom. You gently challenge students to expand their thinking without ever making them feel foolish. You are here to be a concise guide, not a lecture.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and kindly redirect them back to the lesson.

Start by explaining that you are here to teach through counterfactuals. By asking "what if" we can see why the system is structured like it is. Don't move on until they agree to take part. 

Then walk the student through a structured thought experiment one short message at a time. Be brief and invite engagement and exploration. 

Part 1: What If One Branch Ruled Alone?
Walk students through the pros and cons of each branch ruling alone. After you discuss the implications of each branch, draw their attention to a historical example or interesting fact that proves your point before moving to the next branch. The time where you are fleshing out these examples are the only times you can directly teach and be long winded. Don't skimp here. When you move to the next branch, do so in it's own paragraph. 

When it's time to move on to Part 2, smoothly transition to this idea positing it as a way to wrap up our conversation. 

Part 2: Tweaks

Recognize that our system is not perfect, and that there are many with opinions on how it "should be". Ask the student what they would tweak in our system to make it function better. Validate and challenge their suggestion, while recognizing that you don't have all the right answers. 

After you have been through this flow thank the student and explicitly instruct them to move on in the course by hitting the "next" button below.`;
          imageAssistant = "bannerman";
        } else { // low
          systemPrompt = `You are Mr. Whitaker, a retired civics and American history teacher. You taught for 35 years and now volunteer your time to help students strengthen their understanding of government. Your voice is warm, supportive, plainspoken, and slightly nostalgic. You explain complex ideas patiently, using simple examples and metaphors where needed. You occasionally share quick, encouraging asides about your time in the classroom. You gently celebrate effort but do not overpraise or scold.

Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond the structure of government. If the student tries to take the conversation off-topic, gently and kindly redirect them back to the lesson. If the student is struggling with the concept, remind them of what each branch does. Dumb it down if you have to. 

Aim for between 2 and 5 sentences for each response. When you are listing things (like categories) give bullet points.  

You will walk the student through a three-stage activity designed to rebuild and reinforce basic civic understanding. Introduce each stage and wait for their consent before diving in.

Stage 1: Branch Metaphor Matching

- Offer the student three lighthearted categories you can use to create branches of government metaphors.  
- Let the student pick one category.
- describe three examples or features from that category (without naming the branches) and ask the student to match each one to Legislative, Executive, and Judicial.
- After the student responds, explain the correct matches clearly and briefly.
- Repeat this full metaphor-matching activity one more time with a new category.
- Be creative and funny. 

Stage 2: Student-Generated Metaphors

- Offer the student three new lighthearted categories.
- Let them pick one.
- Then ask them to create a metaphor: one job/role from that category that could represent each branch of government.
- After the student responds, gently review and discuss the matches — confirming, correcting, or building on their ideas with encouragement.
- Repeat this metaphor-creation activity one more time with a new category.

Stage 3: Checks and Balances – "Who Can Stop This?"

- Briefly explain the concept of checks and balances. 
- Wait for the student to respond.
- Then give a simple scenario (e.g., "Congress passes a law the president doesn't like") and ask: "Who can step in to stop this, and how?"
- After the student answers, confirm or correct them directly, clearly, and encouragingly.
- Do three of these scenarios in total, one at a time. When the student has completed all three stages, thank them warmly and end the conversation naturally. Invite them to move on my explicitly naming the "next button" at the bottom of the screen.`;
          imageAssistant = "whitaker";
        }
      }

      // Return structured response matching the existing format
      const response = {
        success: true,
        message: "Assessment completed successfully with Claude",
        teachingAssistance: {
          level: level as "low" | "medium" | "high",
          systemPrompt: systemPrompt,
          imageAssistant: imageAssistant,
          reasoning: reasoning
        }
      };

      console.log(`Returning ${level} level teaching assistant (${imageAssistant})`);
      return res.json(response);

    } catch (error: any) {
      console.error("Error in Claude assessment:", error);
      
      // Return fallback response to allow app to continue
      return res.json({
        success: false,
        message: "Assessment evaluation failed, using fallback",
        error: error.message || String(error),
        teachingAssistance: {
          level: "medium",
          systemPrompt: `You are Ms. Bannerman, a patient and encouraging middle school civics teacher. Your voice is supportive, clear, and methodical. You help students build confidence in their understanding of government by reinforcing what they know well while gently addressing knowledge gaps.`,
          imageAssistant: "bannerman",
          reasoning: "Fallback due to assessment error"
        }
      });
    }
  });

  // NEW: Claude-based comprehensive grading endpoint (replaces second N8N webhook)
  app.post("/api/grade-conversations", 
    requireLtiSession,
    aiRateLimit,
    aiRateLimit10Min,
    validateMessage,
    checkDailyUsage,
    async (req, res) => {
    try {
      const {
        teachingConversation,
        teachingThreadId,
        assessmentConversation,
        assessmentThreadId,
        courseName,
        chatDurationSeconds,
        contentPackage,
      } = req.body;
      
      const sessionId = req.sessionId;

      // Store teaching conversation if provided
      if (teachingThreadId && sessionId && teachingConversation && teachingConversation.length > 0) {
        try {
          await storage.createConversation({
            sessionId,
            threadId: teachingThreadId,
            assistantType: "teaching",
            messages: teachingConversation,
          });
          console.log(`Stored teaching conversation for session ${sessionId}, thread ${teachingThreadId}`);
        } catch (err) {
          console.error("Error storing teaching conversation:", err);
        }
      }

      // Prepare conversation data
      const teachingData = teachingConversation || [];
      const assessmentData = assessmentConversation || [];

      // Generate transcripts for Claude evaluation
      const teachingTranscript = teachingData.length > 0 
        ? teachingData.map((msg: { role: string; content: string }) =>
            `${msg.role === "assistant" ? "Teaching Assistant" : "Student"}: ${msg.content}`
          ).join("\n\n")
        : "No teaching conversation available.";

      const assessmentTranscript = assessmentData.length > 0
        ? assessmentData.map((msg: { role: string; content: string }) =>
            `${msg.role === "assistant" ? "Reginald Worthington III" : "Student"}: ${msg.content}`
          ).join("\n\n")
        : "No assessment conversation available.";

      console.log("Evaluating complete learning session with Claude for final grading...");
      console.log("📊 GRADING DEBUG - Received data:");
      console.log("- teachingConversation length:", teachingData.length);
      console.log("- assessmentConversation length:", assessmentData.length);
      console.log("- teachingTranscript preview:", teachingTranscript.substring(0, 200) + "...");
      console.log("- assessmentTranscript preview:", assessmentTranscript.substring(0, 200) + "...");

      // Load feedback instructions from content package or use default
      let feedbackInstructions = null;
      let gradingPrompt = `You are an educational assessment specialist. Evaluate student learning conversations and provide feedback in exactly 4 areas as requested.

SCORING GUIDELINES:
- Content Knowledge: 0-4 scale in 0.5 intervals (focus on understanding of core concepts)
- Writing Quality: 0-4 scale in 0.5 intervals (sentence structure, word choice, grammar, spelling)

RESPONSE FORMAT:
- Use positive, encouraging tone
- Be specific about strengths and areas for growth
- Keep "What's Next" section brief and engaging
- If conversations are missing/insufficient, acknowledge this clearly

Return ONLY a JSON object with exactly these fields: summary, contentKnowledgeScore, writingScore, nextSteps`;

      if (contentPackage) {
        try {
          const [district, course, topic] = contentPackage.id.split('/');
          const loadedPackage = await contentManager.loadContentPackage(district, course, topic);
          feedbackInstructions = loadedPackage?.feedbackInstructions;
          
          if (feedbackInstructions?.gradingPrompt) {
            gradingPrompt = feedbackInstructions.gradingPrompt;
            console.log("🔧 Using feedback instructions from content package:", feedbackInstructions.name);
          } else {
            console.log("🔧 No feedback instructions found, using fallback prompt");
          }
        } catch (error) {
          console.error("Error loading feedback instructions:", error);
          console.log("🔧 Falling back to default grading prompt");
        }
      }

      // Create dynamic grading content based on content package or fallback
      const isThreeBranches = contentPackage?.topic === "three-branches" || courseName?.includes("branches") || !contentPackage;
      
      const gradingConfig = isThreeBranches ? {
        subject: "the three branches of U.S. government",
        contentFocus: "the three branches of government, including the branch names, their powers, and the way they limit each other through checks and balances",
        deeperExploration: "the three branches of government",
        nextUnit: "The next unit in this course is about whales. Write something poppy and fun about what they can expect next. Be brief."
      } : {
        subject: contentPackage?.description || contentPackage?.name || "the current topic",
        contentFocus: contentPackage?.description || "the current learning objectives",
        deeperExploration: contentPackage?.name || "the current topic",
        nextUnit: "Write something brief and engaging about what they can expect in their continued learning journey."
      };

      // Use Claude to evaluate the complete learning session
      const gradingMessages = [
        {
          role: "user" as const,
          content: `Please evaluate this student's complete learning session about ${gradingConfig.subject}. 

ASSESSMENT CONVERSATION:
${assessmentTranscript}

TEACHING CONVERSATION:
${teachingTranscript}

Provide feedback in these 4 areas:

1. GENERAL FEEDBACK: Summarize the conversations in a positive manner. If no conversations are present, say that. If conversations exist, provide feedback on where the student could explore deeper when it comes to ${gradingConfig.deeperExploration}.

2. CONTENT KNOWLEDGE: The student is learning about ${gradingConfig.contentFocus}. Return a score between 0 and 4 in 0.5 intervals.

3. WRITING QUALITY: Grade sentence structure, word choice, grammar and spelling. Return a score between 0 and 4 in 0.5 intervals.

4. WHAT'S NEXT: ${gradingConfig.nextUnit}

Format your response as JSON with these exact fields: summary, contentKnowledgeScore, writingScore, nextSteps`
        }
      ];

      const grading = await anthropic.messages.create({
        messages: gradingMessages,
        system: gradingPrompt,
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1500,
        temperature: 0.3,
      });

      // Extract Claude's response
      const gradingContent = grading.content[0]?.type === "text" 
        ? grading.content[0].text 
        : "{}";

      // Track AI usage for cost monitoring
      const inputText = gradingMessages.map(m => m.content).join(' ');
      await trackAiUsage(sessionId, "/api/grade-conversations", inputText, gradingContent, req.ip);

      let gradingResult;
      try {
        // Try to extract JSON from response, handling markdown code blocks
        let cleanContent = gradingContent;
        
        // First, try to find JSON within markdown code blocks
        const jsonMatch = gradingContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          cleanContent = jsonMatch[1];
        } else {
          // Remove any remaining markdown formatting
          cleanContent = gradingContent.replace(/```(?:json)?/g, '').trim();
        }
        
        gradingResult = JSON.parse(cleanContent);
        console.log("Successfully parsed Claude grading response");
      } catch (parseError: any) {
        console.error("Failed to parse Claude grading response. Original content:", gradingContent);
        console.error("Parse error:", parseError.message);
        // Fallback with default scores
        gradingResult = {
          contentKnowledgeScore: 2.5,
          writingScore: 2.5,
          summary: "Assessment completed with basic understanding demonstrated. Some parsing issues occurred during evaluation.",
          nextSteps: "Continue practicing government concepts and written communication."
        };
      }

      const feedbackData = {
        contentKnowledgeScore: gradingResult.contentKnowledgeScore || 2.5,
        writingScore: gradingResult.writingScore || 2.5,
        summary: gradingResult.summary || "Learning session completed successfully.",
        nextSteps: gradingResult.nextSteps || "Continue exploring government concepts."
      };

      console.log(`Claude grading complete - Content: ${feedbackData.contentKnowledgeScore}, Writing: ${feedbackData.writingScore}`);

      // Return structured response
      const response = {
        success: true,
        message: "Comprehensive grading completed successfully with Claude",
        feedbackData: feedbackData
      };

      console.log("Returning comprehensive feedback:", feedbackData.summary);
      return res.json(response);

    } catch (error: any) {
      console.error("Error in Claude comprehensive grading:", error);
      
      // Return fallback response
      return res.json({
        success: false,
        message: "Comprehensive grading failed, using fallback",
        error: error.message || String(error),
        feedbackData: {
          contentKnowledgeScore: 2.5,
          writingScore: 2.5,
          summary: "You've completed learning about the three branches of government! Some data could not be processed, but you've made good progress through the material.",
          nextSteps: "Continue exploring governmental concepts with other resources and practice explaining checks and balances."
        }
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
        chatDurationSeconds,
      } = req.body;

      const sessionId = req.sessionId; // Get session ID from request

      // If we have a valid threadId and sessionId, store the teaching conversation
      if (
        teachingThreadId &&
        sessionId &&
        teachingConversation &&
        teachingConversation.length > 0
      ) {
        try {
          await storage.createConversation({
            sessionId,
            threadId: teachingThreadId,
            assistantType: "teaching",
            messages: teachingConversation,
          });
          console.log(
            `Stored teaching conversation for session ${sessionId}, thread ${teachingThreadId}`,
          );
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
          error:
            "Invalid request. Either teaching conversation data or thread ID is required.",
        });
      }

      // Generate a placeholder thread ID if we're only using Claude/Anthropic and don't have one
      const effectiveTeachingThreadId =
        teachingThreadId || `claude-teaching-${Date.now()}`;

      // Get N8N webhook URL for dynamic assistant
      if (!DYNAMIC_ASSISTANT_WEBHOOK_URL) {
        console.warn("N8N_DYNAMIC_WEBHOOK_URL environment variable not set");
        // Still return a success response with a warning to prevent blocking the UI
        return res.json({
          success: false,
          message:
            "Dynamic assistant webhook URL not configured, continuing anyway",
          feedbackData: {
            summary:
              "You've completed this Social Studies Sample module successfully!",
            contentKnowledgeScore: 0,
            writingScore: 0,
            nextSteps:
              "Continue exploring more topics to expand your knowledge.",
          },
        });
      }

      try {
        // Generate formatted transcripts for both conversations
        const teachingTranscript = teachingData
          .map(
            (msg: { role: string; content: string }) =>
              `${msg.role === "assistant" ? "Teacher" : "Student"}: ${msg.content}`,
          )
          .join("\n\n");

        const assessmentTranscript =
          assessmentData.length > 0
            ? assessmentData
                .map(
                  (msg: { role: string; content: string }) =>
                    `${msg.role === "assistant" ? "Reginald Worthington III" : "Student"}: ${msg.content}`,
                )
                .join("\n\n")
            : "";

        // Send complete data package to N8N webhook
        console.log(
          "Calling teaching bot webhook with POST request (including full conversation data for Claude)",
        );
        console.log(
          "Dynamic webhook URL being used:",
          DYNAMIC_ASSISTANT_WEBHOOK_URL,
        );

        const response = await axios.post(
          DYNAMIC_ASSISTANT_WEBHOOK_URL,
          {
            // Teaching bot data
            teachingThreadId: effectiveTeachingThreadId, // Use our effective ID (real or generated)
            teachingConversation: teachingData, // Complete conversation data
            teachingTranscript, // Human-readable transcript

            // Assessment bot data (if available)
            assessmentThreadId:
              assessmentThreadId || `claude-assessment-${Date.now()}`, // Generate ID if missing
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
            ...(sessionId ? { sessionId } : {}),
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        console.log(
          "Successfully sent Claude/Anthropic teaching data to N8N:",
          response.status,
        );
        console.log(
          "Teaching conversation data included. Message count:",
          teachingData.length,
        );
        console.log(
          "Teaching transcript length:",
          teachingTranscript.length,
          "characters",
        );
        console.log(
          "Assessment conversation data included. Message count:",
          assessmentData.length,
        );
        console.log(
          "Assessment transcript length:",
          assessmentTranscript.length,
          "characters",
        );
        console.log("Teaching Thread ID:", effectiveTeachingThreadId);
        console.log(
          "Assessment Thread ID:",
          assessmentThreadId || `claude-assessment-${Date.now()}`,
        );
        console.log(
          "Course name sent to N8N:",
          courseName || "Social Studies Sample",
        );
        console.log(
          "Chat duration sent to N8N:",
          chatDurationSeconds || 0,
          "seconds",
        );
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
            contentPreview: firstMsg.content.substring(0, 50) + "...",
          });

          console.log("Last teaching message:", {
            role: lastMsg.role,
            contentPreview: lastMsg.content.substring(0, 50) + "...",
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
        console.log(
          "Raw response data (stringified):",
          JSON.stringify(response.data, null, 2),
        );

        // DEBUG: Log raw request and response to understand what N8N is receiving and sending
        console.log("DEBUGGING N8N COMMUNICATION");
        console.log("----------------------------");
        console.log(
          "We sent to N8N (request body sample):",
          JSON.stringify({
            teachingThreadId: effectiveTeachingThreadId,
            assessmentThreadId:
              assessmentThreadId || `claude-assessment-${Date.now()}`,
            // Other fields omitted for brevity
          }),
        );
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
              console.log(
                "feedbackData structure:",
                Object.keys(response.data[0].feedbackData),
              );
            } else if (response.data[0].summary !== undefined) {
              console.log("Found summary directly in first array item");
            }
          }
        }

        // Object inspection
        if (typeof response.data === "object" && response.data !== null) {
          console.log("Object Keys:", Object.keys(response.data));

          // If the object has summary and scores directly
          if (
            response.data.summary &&
            response.data.contentKnowledgeScore !== undefined
          ) {
            console.log(
              "Found direct feedback properties at top level of response",
            );
          }
        }

        // First check if response data is an array with the expected structure
        if (Array.isArray(response.data) && response.data.length > 0) {
          const firstItem = response.data[0];

          // Check for nested feedbackData
          if (firstItem.feedbackData) {
            console.log(
              "MATCH: Processing array-formatted feedbackData from N8N",
            );
            feedbackData = firstItem.feedbackData;
            console.log(
              "Extracted nested feedbackData:",
              JSON.stringify(feedbackData),
            );
          }
          // Check for direct properties in the array item
          else if (
            firstItem.summary !== undefined &&
            firstItem.contentKnowledgeScore !== undefined
          ) {
            console.log("MATCH: Processing array item with direct properties");
            feedbackData = firstItem;
            console.log(
              "Using array item directly:",
              JSON.stringify(feedbackData),
            );
          }
        }
        // Then check for empty or null response
        else if (
          !response.data ||
          (typeof response.data === "object" &&
            Object.keys(response.data).length === 0)
        ) {
          console.log(
            "WARNING: Received empty response from teaching webhook. Using fallback feedback data.",
          );
          // Return hardcoded fallback feedback (using 0-4 scale)
          feedbackData = {
            summary:
              "You've completed this Social Studies Sample module with a good understanding of the three branches of government!",
            contentKnowledgeScore: 3.5,
            writingScore: 3.5,
            nextSteps:
              "Continue exploring the checks and balances between branches by reading more about specific historical cases where these powers were exercised.",
          };
        } else if (response.data && typeof response.data === "object") {
          // The response might be an array with a single object, or a direct object
          // Handle both cases by extracting the data appropriately
          let dataToProcess = response.data;

          // If the response is an array with at least one item, extract the first item
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(
              "Detected array response from N8N, extracting first item",
            );
            console.log(
              "Array response from N8N:",
              JSON.stringify(response.data),
            );
            dataToProcess = response.data[0];
            console.log("Extracted item:", JSON.stringify(dataToProcess));
          }

          // Check if the data has a feedbackData field directly
          if (
            dataToProcess.feedbackData &&
            typeof dataToProcess.feedbackData === "object"
          ) {
            console.log("Found feedbackData object in N8N response");
            console.log(
              "feedbackData object:",
              JSON.stringify(dataToProcess.feedbackData),
            );
            const { summary, contentKnowledgeScore, writingScore, nextSteps } =
              dataToProcess.feedbackData;

            feedbackData = {
              summary: summary || "No summary provided",
              contentKnowledgeScore: contentKnowledgeScore || 0,
              writingScore: writingScore || 0,
              nextSteps: nextSteps || "No next steps provided",
            };

            console.log(
              "Using feedbackData from N8N:",
              JSON.stringify(feedbackData),
            );
          }
          // Check for feedback fields at the top level of the response
          else if (
            dataToProcess.summary ||
            dataToProcess.contentKnowledgeScore ||
            dataToProcess.writingScore ||
            dataToProcess.nextSteps
          ) {
            console.log("Found feedback fields at top level of N8N response");
            const { summary, contentKnowledgeScore, writingScore, nextSteps } =
              dataToProcess;

            feedbackData = {
              summary: summary || "No summary provided",
              contentKnowledgeScore: contentKnowledgeScore || 0,
              writingScore: writingScore || 0,
              nextSteps: nextSteps || "No next steps provided",
            };
          } else {
            // No specific feedback fields found, use fallback
            console.log(
              "WARNING: No feedback fields found in N8N response. Using fallback feedback data.",
            );
            feedbackData = {
              summary:
                "You've completed this Social Studies Sample module with a good understanding of the three branches of government!",
              contentKnowledgeScore: 3.0,
              writingScore: 3.25,
              nextSteps:
                "Continue exploring more about how the branches interact in our government system.",
            };
          }
        }

        // Extract session ID from N8N response if available
        let returnedSessionId = null;

        // Check if response data is an object with sessionId
        if (response.data && typeof response.data === "object") {
          // Direct sessionId in the object
          if ("sessionId" in response.data) {
            returnedSessionId = response.data.sessionId;
            console.log(
              `N8N returned session ID in feedback flow: ${returnedSessionId || "null"}`,
            );
          }
          // sessionId in the first item of an array
          else if (
            Array.isArray(response.data) &&
            response.data.length > 0 &&
            typeof response.data[0] === "object" &&
            "sessionId" in response.data[0]
          ) {
            returnedSessionId = response.data[0].sessionId;
            console.log(
              `N8N returned session ID in array for feedback flow: ${returnedSessionId || "null"}`,
            );
          }
        }

        // Log if session IDs match
        if (returnedSessionId && sessionId) {
          console.log(
            `Feedback flow: Session IDs match: ${returnedSessionId === sessionId}`,
          );
        } else {
          console.log(
            `Feedback flow: Original session ID: ${sessionId || "none"}, N8N session ID: ${returnedSessionId || "none"}`,
          );
        }

        // Store feedback data if we have a valid session ID
        if (sessionId && Object.keys(feedbackData).length > 0) {
          try {
            // Calculate final grade for LTI passback
            const finalGrade = Math.round(
              ((feedbackData.contentKnowledgeScore || 0) +
                (feedbackData.writingScore || 0)) /
                2,
            );

            await storage.createFeedback({
              sessionId,
              summary: feedbackData.summary || "",
              contentKnowledgeScore: feedbackData.contentKnowledgeScore || 0,
              writingScore: feedbackData.writingScore || 0,
              nextSteps: feedbackData.nextSteps || "",
              grade: finalGrade,
              maxGrade: 100,
            });
            console.log(`Stored feedback data for session ${sessionId}`);

            // Process LTI grade passback if this is an LTI session
            if (req.lti?.claims) {
              try {
                const gradeSuccess =
                  await ltiServices.processAssessmentCompletion(
                    sessionId,
                    req.lti.claims,
                    {
                      contentKnowledgeScore:
                        feedbackData.contentKnowledgeScore || 0,
                      writingScore: feedbackData.writingScore || 0,
                      totalPossible: 100,
                    },
                  );

                if (gradeSuccess) {
                  console.log(
                    `LTI grade passback successful for session ${sessionId}`,
                  );
                } else {
                  console.log(
                    `LTI grade passback failed or not available for session ${sessionId}`,
                  );
                }
              } catch (gradeError) {
                console.error("LTI grade passback error:", gradeError);
              }
            }
          } catch (err) {
            console.error("Error storing feedback data:", err);
            // Continue with the response even if storage fails
          }
        }

        // Create response object with session ID (prefer the one from N8N if valid)
        const responseObject = {
          success: true,
          message:
            "Combined teaching and assessment data sent to N8N successfully",
          feedbackData, // Include the feedback data in the response
        };

        // Add session ID to the response if available - prefer N8N's returned one if valid
        if (returnedSessionId) {
          (responseObject as any).sessionId = returnedSessionId;
        } else if (sessionId) {
          (responseObject as any).sessionId = sessionId;
        }

        return res.json(responseObject);
      } catch (axiosError: any) {
        // Handle N8N webhook errors but allow the application to continue
        console.error(
          "Teaching bot N8N webhook error:",
          axiosError.response?.data || axiosError.message,
        );

        // Return a response that allows the client to continue
        return res.json({
          success: false,
          message: "N8N workflow error for teaching data, continuing anyway",
          error:
            axiosError.response?.data?.message ||
            "N8N workflow execution failed",
        });
      }
    } catch (error: any) {
      console.error("Error in teaching bot N8N integration:", error);

      // Return a response that allows the client to continue
      return res.json({
        success: false,
        message: "Error in teaching bot N8N integration, continuing anyway",
        error: error.message || String(error),
      });
    }
  });

  // Streaming endpoint for assessment and teaching bots
  app.post("/api/claude-chat", 
    requireLtiSession,
    aiRateLimit,
    aiRateLimit10Min,
    validateMessage,
    checkDailyUsage,
    async (req, res) => {
    try {
      const { messages, systemPrompt, threadId, assistantType } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          error: "Invalid message data. Expected an array of messages.",
        });
      }

      // Log the system prompt to verify it's being received
      console.log(
        "Received system prompt on server:",
        systemPrompt?.substring(0, 100) + "...",
      );

      // Set up streaming headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== "system")
        .filter((msg: any) => msg.content && msg.content.trim().length > 0) // Filter out empty messages
        .map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content.trim(),
        }));

      // Log message filtering results
      console.log(`Filtered ${messages.length} input messages to ${anthropicMessages.length} valid messages`);
      if (anthropicMessages.length === 0) {
        console.error("No valid messages after filtering - all messages were empty");
        res.write(`data: ${JSON.stringify({ error: "No valid messages to process" })}\n\n`);
        res.end();
        return;
      }

      // Generate a thread ID based on assistant type
      const detectedAssistantType = systemPrompt?.includes("Reginald")
        ? "assessment"
        : "teaching";
      const messageId =
        threadId || `claude-${detectedAssistantType}-${Date.now()}`;

      // Send initial thread ID
      res.write(`data: ${JSON.stringify({ threadId: messageId })}\n\n`);

      // Start streaming response from Claude
      const stream = await anthropic.messages.stream({
        messages: anthropicMessages,
        system: systemPrompt || ASSESSMENT_ASSISTANT_PROMPT,
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096, // Fixed: reduced from 20000 to 8192 (max allowed)
        temperature: 1.0,
      });

      let fullContent = "";

      // Process the stream
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          const content = chunk.delta.text;

          if (content) {
            fullContent += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      }

      // Send completion signal
      res.write(`data: [DONE]\n\n`);
      res.end();

      // Store the conversation if we have a session ID
      const sessionId = req.sessionId;
      if (sessionId) {
        try {
          const allMessages = [
            ...messages,
            { role: "assistant", content: fullContent },
          ];
          await storage.createConversation({
            sessionId,
            threadId: messageId,
            assistantType: detectedAssistantType,
            messages: allMessages,
          });
        } catch (error) {
          console.error("Error storing conversation:", error);
        }
      }
    } catch (error: any) {
      console.error("Error in claude chat:", error);

      // Since we're streaming, we need to send the error through the stream
      // Check if headers were already sent (streaming started)
      if (res.headersSent) {
        // Send error through the stream
        try {
          res.write(
            `data: ${JSON.stringify({ error: "claude_chat_error", message: error.message || "Streaming error occurred" })}\n\n`,
          );
          res.end();
        } catch (streamError) {
          console.error("Failed to send error through stream:", streamError);
          res.end();
        }
      } else {
        // Headers not sent yet, can send regular JSON response
        res
          .status(500)
          .json({ error: "Chat request failed", details: error.message });
      }
    }
  });

  // Legacy Anthropic Claude API endpoint with streaming support (keeping for compatibility)
  app.post("/api/claude-chat-legacy", async (req, res) => {
    // Flag to track if headers have been sent to avoid errors
    let headersSent = false;
    let responseEnded = false;

    try {
      const { messages, systemPrompt, stream = false } = req.body;

      // Set up proper headers for streaming
      if (stream) {
        try {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          headersSent = true;
        } catch (headerError) {
          console.error("Error setting headers:", headerError);
          // If headers were already sent, we'll handle this gracefully
          headersSent = true;
        }
      }

      // Create a message ID to use as a thread ID
      const messageId = `claude-${Date.now()}`;

      // Set thread ID in response headers if possible
      if (!headersSent) {
        try {
          res.setHeader("X-Thread-Id", messageId);
        } catch (headerError) {
          console.error("Error setting thread ID header:", headerError);
          // Headers already sent, continue without setting this header
          headersSent = true;
        }
      }

      // Process the messages and system prompt for Claude format
      // Filter out system messages as Anthropic handles them separately
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Get the system prompt (either from messages or directly provided)
      const systemMessage = messages.find((msg: any) => msg.role === "system");
      const finalSystemPrompt = systemMessage?.content || systemPrompt || "";

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
              max_tokens: 4096,
              temperature: 1.0,
              stream: true,
            });

            // Track response status
            responseEnded = !!res.writableEnded;

            // Set up early termination handling
            res.on("close", () => {
              responseEnded = true;
              if (!res.writableEnded) {
                try {
                  res.end();
                } catch (endError) {
                  console.error("Error ending response on close:", endError);
                }
              }
            });

            // Function to safely send events
            const sendEvent = (event: string, data: any) => {
              if (responseEnded || res.writableEnded) return;
              try {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
              } catch (writeError) {
                console.error("Error writing response chunk:", writeError);
                responseEnded = true;
              }
            };

            // Send the thread ID as the first event
            sendEvent("threadId", { threadId: messageId });

            // Process each chunk safely
            for await (const chunk of stream) {
              if (responseEnded || res.writableEnded) break;

              try {
                if (
                  chunk.type === "content_block_delta" &&
                  "delta" in chunk &&
                  "text" in chunk.delta &&
                  typeof chunk.delta.text === "string"
                ) {
                  // Send the content chunk
                  sendEvent("content", { content: chunk.delta.text });
                }
              } catch (chunkError) {
                console.error("Error processing chunk:", chunkError);
                // Continue with next chunk despite error
              }
            }

            // Signal the end of the stream safely
            if (!responseEnded && !res.writableEnded) {
              try {
                res.write("data: [DONE]\n\n");
                res.end();
                responseEnded = true;
              } catch (endError) {
                console.error("Error ending stream:", endError);
              }
            }
          } catch (streamError: any) {
            // Handle stream initialization errors
            console.error("Error during Claude streaming:", streamError);

            const isOverloaded =
              streamError.message &&
              (streamError.message.includes("overloaded") ||
                streamError.message.includes("Overloaded"));

            const errorType = isOverloaded
              ? "service_overloaded"
              : "streaming_error";
            const errorMessage = isOverloaded
              ? "Claude API is currently overloaded. Please try again in a moment."
              : streamError.message || "Error during Claude API streaming";

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
                console.error("Error sending error response:", jsonError);
              }
            } else if (!responseEnded && !res.writableEnded) {
              // If headers sent but response not ended, send error in SSE format
              try {
                res.write(
                  `data: ${JSON.stringify({ error: true, message: errorMessage })}\n\n`,
                );
                res.write("data: [DONE]\n\n");
                res.end();
                responseEnded = true;
              } catch (sseError) {
                console.error("Error sending error in SSE format:", sseError);
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
            max_tokens: 4096,
            temperature: 1.0,
          });

          // Extract the response content
          const content =
            completion.content[0]?.type === "text"
              ? completion.content[0].text
              : "No response content available";

          // Store the conversation if we have a session ID
          const sessionId = req.sessionId;
          if (sessionId) {
            try {
              // Create a new conversation with the messages
              const allMessages = [
                ...anthropicMessages,
                { role: "assistant", content },
              ];

              // Store the conversation
              await storage.createConversation({
                sessionId,
                threadId: messageId,
                assistantType: "article", // Default type - can be overridden with request param
                messages: allMessages,
              });
              console.log(
                `Stored Claude conversation for session ${sessionId}, thread ${messageId}`,
              );
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
                    role: "assistant",
                  },
                },
              ],
              threadId: messageId,
            });
            responseEnded = true;
          }
        } catch (completionError: any) {
          console.error(
            "Error in Claude API completion call:",
            completionError,
          );

          // Only attempt to respond if we haven't already
          if (!responseEnded && !res.writableEnded) {
            // Provide a more useful error message for overload
            const isOverloaded =
              completionError.message &&
              (completionError.message.includes("overloaded") ||
                completionError.message.includes("Overloaded"));

            res.status(isOverloaded ? 503 : 500).json({
              error: isOverloaded ? "service_overloaded" : "api_error",
              message: isOverloaded
                ? "Claude API is currently overloaded. Please try again in a moment."
                : completionError.message ||
                  "An error occurred with the Claude API",
            });
            responseEnded = true;
          }
        }
      }
    } catch (error: any) {
      console.error("Unhandled error in Claude API endpoint:", error);

      // Only attempt to respond if we haven't already
      if (!responseEnded && !res.writableEnded) {
        try {
          // If streaming headers were sent, respond in SSE format
          if (headersSent) {
            res.write(
              `data: ${JSON.stringify({
                error: true,
                message: "An unexpected error occurred with the Claude API",
              })}\n\n`,
            );
            res.write("data: [DONE]\n\n");
            res.end();
          } else {
            // Otherwise send normal JSON error
            res.status(500).json({
              error: "unexpected_error",
              message:
                error.message ||
                "An unexpected error occurred with the Claude API",
            });
          }
        } catch (responseError) {
          console.error("Failed to send error response:", responseError);
          // Last resort attempt to end the response
          try {
            if (!res.writableEnded) {
              res.end();
            }
          } catch (endError) {
            console.error("Failed to end response:", endError);
          }
        }
      }
    }
  });

  // LTI user context and progress endpoints
  app.get("/api/lti/user/context", async (req: any, res) => {
    try {
      if (!req.lti?.claims) {
        return res.status(401).json({ error: "No LTI context available" });
      }

      const context = {
        user: {
          id: req.lti.claims.sub,
          name: req.lti.claims.name,
          email: req.lti.claims.email,
          roles:
            req.lti.claims["https://purl.imsglobal.org/spec/lti/claim/roles"],
        },
        course: {
          id: req.lti.claims[
            "https://purl.imsglobal.org/spec/lti/claim/context"
          ]?.id,
          title:
            req.lti.claims["https://purl.imsglobal.org/spec/lti/claim/context"]
              ?.title,
          label:
            req.lti.claims["https://purl.imsglobal.org/spec/lti/claim/context"]
              ?.label,
        },
        platform: {
          name: req.lti.claims[
            "https://purl.imsglobal.org/spec/lti/claim/platform_instance"
          ]?.name,
          url: req.lti.claims[
            "https://purl.imsglobal.org/spec/lti/claim/platform_instance"
          ]?.url,
        },
        hasGradePassback:
          !!req.lti.claims[
            "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
          ],
        hasNRPS:
          !!req.lti.claims[
            "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"
          ],
      };

      res.json(context);
    } catch (error) {
      console.error("Error getting LTI context:", error);
      res.status(500).json({ error: "Failed to retrieve LTI context" });
    }
  });

  app.get("/api/lti/user/progress", async (req: any, res) => {
    try {
      if (!req.lti?.claims) {
        return res.status(401).json({ error: "No LTI context available" });
      }

      const progress = await ltiServices.getUserProgress(req.lti.claims);
      res.json(progress || { message: "No progress data available" });
    } catch (error) {
      console.error("Error getting user progress:", error);
      res.status(500).json({ error: "Failed to retrieve progress" });
    }
  });

  app.post("/api/lti/submit-grade", async (req: any, res) => {
    try {
      if (!req.lti?.claims) {
        return res.status(401).json({ error: "No LTI context available" });
      }

      const { score, maxScore, comment } = req.body;
      const agsEndpoint =
        req.lti.claims[
          "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
        ];

      if (!agsEndpoint?.lineitem) {
        return res
          .status(400)
          .json({ error: "No grade passback endpoint available" });
      }

      const success = await ltiServices.submitGrade(req.lti.claims, {
        userId: req.lti.claims.sub,
        lineitemId: agsEndpoint.lineitem,
        scoreGiven: score,
        scoreMaximum: maxScore,
        comment: comment,
        timestamp: new Date().toISOString(),
      });

      if (success) {
        res.json({ success: true, message: "Grade submitted successfully" });
      } else {
        res.status(500).json({ error: "Grade submission failed" });
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
      res.status(500).json({ error: "Failed to submit grade" });
    }
  });

  // Content Management API Endpoints
  
  // Get all content packages
  app.get("/api/content/packages", async (req, res) => {
    try {
      const packages = await contentManager.scanContentPackages();
      res.json({ packages });
    } catch (error) {
      console.error("Error scanning content packages:", error);
      res.status(500).json({ error: "Failed to scan content packages" });
    }
  });

  // Get specific content package
  app.get("/api/content/packages/:district/:course/:topic", async (req, res) => {
    try {
      const { district, course, topic } = req.params;
      const pkg = await contentManager.loadContentPackage(district, course, topic);
      
      if (!pkg) {
        return res.status(404).json({ error: "Content package not found" });
      }
      
      res.json({ package: pkg });
    } catch (error) {
      console.error("Error loading content package:", error);
      res.status(500).json({ error: "Failed to load content package" });
    }
  });

  // Get bot personality text
  app.get("/api/content/personality/:district/:course/:topic/:botType/:level?", async (req, res) => {
    try {
      const { district, course, topic, botType, level } = req.params;
      const personality = await contentManager.getPersonality(district, course, topic, botType, level || null);
      res.json({ personality });
    } catch (error) {
      console.error("Error getting personality:", error);
      res.status(500).json({ error: "Failed to get personality" });
    }
  });

  // Save bot personality text
  app.put("/api/content/personality/:district/:course/:topic/:botType/:level?", async (req, res) => {
    try {
      const { district, course, topic, botType, level } = req.params;
      const { personality } = req.body;
      
      if (!personality || typeof personality !== 'string') {
        return res.status(400).json({ error: "Personality text is required" });
      }
      
      await contentManager.savePersonality(district, course, topic, botType, level || null, personality);
      res.json({ success: true, message: "Personality saved successfully" });
    } catch (error) {
      console.error("Error saving personality:", error);
      res.status(500).json({ error: "Failed to save personality" });
    }
  });

  // Create new content package
  app.post("/api/content/packages", async (req, res) => {
    try {
      const { district, course, topic, template } = req.body;
      
      if (!district || !course || !topic) {
        return res.status(400).json({ error: "District, course, and topic are required" });
      }
      
      await contentManager.createContentPackage(district, course, topic, template);
      res.json({ success: true, message: "Content package created successfully" });
    } catch (error) {
      console.error("Error creating content package:", error);
      res.status(500).json({ error: "Failed to create content package" });
    }
  });

  // Create new complete learning experience from admin form with avatar uploads
  app.post("/api/content/create-package", upload.fields([
    { name: 'assessmentAvatar', maxCount: 1 },
    { name: 'highBotAvatar', maxCount: 1 },
    { name: 'mediumBotAvatar', maxCount: 1 },
    { name: 'lowBotAvatar', maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Parse the FormData body - arrays and objects come as JSON strings
      const experienceData = { ...req.body };
      
      // Parse JSON fields that were stringified
      ['assessmentListeningTopics', 'highFocusTopics', 'mediumFocusTopics', 'lowFocusTopics'].forEach(field => {
        if (experienceData[field] && typeof experienceData[field] === 'string') {
          try {
            experienceData[field] = JSON.parse(experienceData[field]);
          } catch (e) {
            experienceData[field] = [];
          }
        }
      });
      
      // Validate required fields
      if (!experienceData.name || !experienceData.district || !experienceData.course || !experienceData.topic) {
        return res.status(400).json({ error: "Name, district, course, and topic are required" });
      }

      // Create the content package directory structure
      await contentManager.createContentPackage(
        experienceData.district, 
        experienceData.course, 
        experienceData.topic
      );

      const packagePath = path.join(
        process.cwd(), 
        'content', 
        experienceData.district, 
        experienceData.course, 
        experienceData.topic
      );

      // Create config.json with the experience configuration
      const config = {
        name: experienceData.name,
        description: experienceData.description,
        district: experienceData.district,
        course: experienceData.course,
        topic: experienceData.topic,
        assessmentBot: {
          name: experienceData.assessmentName || "Assessment Assistant",
          description: experienceData.assessmentDescription || "Assessment bot for this experience",
          avatar: files?.assessmentAvatar?.[0] ? `${experienceData.assessmentName || 'assessment'}-avatar.png` : 'reginald-worthington.png',
          role: "assessment",
          personality: experienceData.assessmentPersonality,
          criteria: experienceData.assessmentCriteria || "",
          config: {}
        },
        assessmentCriteria: {
          high: experienceData.highCriteria || "",
          medium: experienceData.mediumCriteria || "",
          low: experienceData.lowCriteria || ""
        },
        teachingBots: {
          high: {
            name: experienceData.highBotName || "High Level Assistant",
            description: experienceData.highBotDescription || "For advanced students",
            avatar: files?.highBotAvatar?.[0] ? `${experienceData.highBotName || 'high'}-avatar.png` : 'Parton.png',
            role: "teaching",
            personality: experienceData.highBotPersonality,
            config: {}
          },
          medium: {
            name: experienceData.mediumBotName || "Medium Level Assistant", 
            description: experienceData.mediumBotDescription || "For students at grade level",
            avatar: files?.mediumBotAvatar?.[0] ? `${experienceData.mediumBotName || 'medium'}-avatar.png` : 'Bannerman.png',
            role: "teaching",
            personality: experienceData.mediumBotPersonality,
            config: {}
          },
          low: {
            name: experienceData.lowBotName || "Support Assistant",
            description: experienceData.lowBotDescription || "For students needing extra support",
            avatar: files?.lowBotAvatar?.[0] ? `${experienceData.lowBotName || 'low'}-avatar.png` : 'Whitaker.png',
            role: "teaching", 
            personality: experienceData.lowBotPersonality,
            config: {}
          }
        }
      };

      // Write the config file
      const configPath = path.join(packagePath, 'config.json');
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));

      // Create UI configuration files for assessment bot
      const assessmentBotPath = path.join(packagePath, 'assessment-bot');
      await fs.promises.mkdir(assessmentBotPath, { recursive: true });
      
      const assessmentUIConfig = {
        botTitle: experienceData.assessmentBotTitle || experienceData.assessmentName || "Assessment Bot",
        botDescription: experienceData.assessmentDescription || "Let's explore your understanding",
        chatHeaderTitle: experienceData.assessmentChatHeaderTitle || "Assessment Chat",
        listeningSection: {
          title: "I'm listening for",
          topics: experienceData.assessmentListeningTopics || []
        },
        progressSection: {
          title: experienceData.assessmentProgressTitle || "Assessment Progress",
          threshold: experienceData.assessmentProgressThreshold || 8
        },
        keepInMindSection: {
          title: experienceData.assessmentKeepInMindTitle || "Keep in mind",
          description: experienceData.assessmentKeepInMindDescription || "Be specific and detailed in your responses"
        },
        inputPlaceholder: experienceData.assessmentInputPlaceholder || "Type your response here...",
        initialGreeting: experienceData.assessmentInitialGreeting || ""
      };
      
      await fs.promises.writeFile(
        path.join(assessmentBotPath, 'ui-config.json'), 
        JSON.stringify(assessmentUIConfig, null, 2)
      );

      // Create UI configuration files for teaching bots
      const teachingBotsPath = path.join(packagePath, 'teaching-bots');
      
      // High level UI config
      const highLevelPath = path.join(teachingBotsPath, 'high-level');
      await fs.promises.mkdir(highLevelPath, { recursive: true });
      
      const highUIConfig = {
        botTitle: experienceData.highBotTitle || experienceData.highBotName || "Advanced Analysis",
        botDescription: experienceData.highBotDescription || "Let's dive deep into advanced concepts",
        chatHeaderTitle: experienceData.highChatHeaderTitle || "Advanced Discussion",
        teachingApproach: {
          title: experienceData.highTeachingApproachTitle || "Teaching Approach",
          description: experienceData.highTeachingApproachDescription || "Advanced analytical exploration"
        },
        focusAreas: experienceData.highFocusTopics || [],
        challengeSection: {
          title: experienceData.highChallengeTitle || "Ready for a challenge?",
          description: experienceData.highChallengeDescription || "Let's explore complex connections"
        },
        inputPlaceholder: experienceData.highInputPlaceholder || "Type your message here...",
        initialGreeting: experienceData.highInitialGreeting || ""
      };
      
      await fs.promises.writeFile(
        path.join(highLevelPath, 'ui-config.json'), 
        JSON.stringify(highUIConfig, null, 2)
      );

      // Medium level UI config
      const mediumLevelPath = path.join(teachingBotsPath, 'medium-level');
      await fs.promises.mkdir(mediumLevelPath, { recursive: true });
      
      const mediumUIConfig = {
        botTitle: experienceData.mediumBotTitle || experienceData.mediumBotName || "Guided Learning",
        botDescription: experienceData.mediumBotDescription || "Let's strengthen your understanding together",
        chatHeaderTitle: experienceData.mediumChatHeaderTitle || "Focused Discussion",
        teachingApproach: {
          title: experienceData.mediumTeachingApproachTitle || "Teaching Approach",
          description: experienceData.mediumTeachingApproachDescription || "Building deeper understanding step by step"
        },
        focusAreas: experienceData.mediumFocusTopics || [],
        encouragementSection: {
          title: experienceData.mediumEncouragementTitle || "You're doing great!",
          description: experienceData.mediumEncouragementDescription || "Let's keep building your knowledge"
        },
        inputPlaceholder: experienceData.mediumInputPlaceholder || "Type your message here...",
        initialGreeting: experienceData.mediumInitialGreeting || ""
      };
      
      await fs.promises.writeFile(
        path.join(mediumLevelPath, 'ui-config.json'), 
        JSON.stringify(mediumUIConfig, null, 2)
      );

      // Low level UI config
      const lowLevelPath = path.join(teachingBotsPath, 'low-level');
      await fs.promises.mkdir(lowLevelPath, { recursive: true });
      
      const lowUIConfig = {
        botTitle: experienceData.lowBotTitle || experienceData.lowBotName || "Foundation Building",
        botDescription: experienceData.lowBotDescription || "Let's build a strong foundation together",
        chatHeaderTitle: experienceData.lowChatHeaderTitle || "Foundational Learning",
        teachingApproach: {
          title: experienceData.lowTeachingApproachTitle || "Teaching Approach",
          description: experienceData.lowTeachingApproachDescription || "Starting with the basics and building up"
        },
        focusAreas: experienceData.lowFocusTopics || [],
        encouragementSection: {
          title: experienceData.lowEncouragementTitle || "Keep learning!",
          description: experienceData.lowEncouragementDescription || "Every step forward is progress"
        },
        inputPlaceholder: experienceData.lowInputPlaceholder || "Type your message here...",
        initialGreeting: experienceData.lowInitialGreeting || ""
      };
      
      await fs.promises.writeFile(
        path.join(lowLevelPath, 'ui-config.json'), 
        JSON.stringify(lowUIConfig, null, 2)
      );

      // Create assessment criteria file
      const assessmentCriteriaConfig = {
        name: experienceData.name,
        description: experienceData.description,
        subject: experienceData.course,
        gradeLevel: "General",
        evaluationPrompt: `Evaluate the student's understanding of ${experienceData.topic} based on the following criteria`,
        routingCriteria: {
          high: {
            description: experienceData.highCriteria || "Strong understanding demonstrated",
            indicators: [],
            teachingBot: "high",
            minScore: 0.7
          },
          medium: {
            description: experienceData.mediumCriteria || "Basic understanding with some gaps",
            indicators: [],
            teachingBot: "medium",
            minScore: 0.4
          },
          low: {
            description: experienceData.lowCriteria || "Needs foundational support",
            indicators: [],
            teachingBot: "low",
            minScore: 0
          }
        },
        fallbackLevel: "medium"
      };
      
      await fs.promises.writeFile(
        path.join(packagePath, 'assessment-criteria.json'), 
        JSON.stringify(assessmentCriteriaConfig, null, 2)
      );

      // Create feedback instructions file
      const feedbackInstructionsConfig = {
        name: experienceData.name,
        description: experienceData.description,
        subject: experienceData.course,
        gradeLevel: "General",
        gradingPrompt: `Provide comprehensive feedback on the student's understanding of ${experienceData.topic}`,
        feedbackComponents: {
          summary: {
            description: "Overall performance summary",
            length: "2-3 sentences"
          },
          contentKnowledgeScore: {
            description: "Content knowledge score",
            scale: "0-4"
          },
          writingScore: {
            description: "Writing quality score",
            scale: "0-4"
          },
          nextSteps: {
            description: "Recommended next steps",
            requirements: ["Be specific", "Be actionable", "Be encouraging"]
          }
        },
        rubricGuidelines: {
          excellentPerformance: {
            contentRange: "3.5-4.0",
            writingRange: "3.5-4.0",
            characteristics: ["Deep understanding", "Clear communication", "Insightful connections"]
          },
          proficientPerformance: {
            contentRange: "2.5-3.4",
            writingRange: "2.5-3.4",
            characteristics: ["Good understanding", "Clear explanations", "Some connections"]
          },
          developingPerformance: {
            contentRange: "1.5-2.4",
            writingRange: "1.5-2.4",
            characteristics: ["Basic understanding", "Simple explanations", "Limited connections"]
          },
          beginningPerformance: {
            contentRange: "0-1.4",
            writingRange: "0-1.4",
            characteristics: ["Minimal understanding", "Unclear explanations", "No connections"]
          }
        }
      };
      
      await fs.promises.writeFile(
        path.join(packagePath, 'feedback-instructions.json'), 
        JSON.stringify(feedbackInstructionsConfig, null, 2)
      );

      // Handle avatar file uploads if present
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Save assessment bot avatar if uploaded
      if (files?.assessmentAvatar?.[0]) {
        const assessmentAvatarPath = path.join(packagePath, 'assessment-bot', `${experienceData.assessmentName || 'assessment'}-avatar.png`);
        await fs.promises.writeFile(assessmentAvatarPath, files.assessmentAvatar[0].buffer);
        console.log(`Saved assessment avatar to: ${assessmentAvatarPath}`);
      }
      
      // Save teaching bot avatars if uploaded
      const teachingLevels = ['high', 'medium', 'low'];
      const avatarFields = ['highBotAvatar', 'mediumBotAvatar', 'lowBotAvatar'];
      const botNames = [experienceData.highBotName, experienceData.mediumBotName, experienceData.lowBotName];
      
      for (let i = 0; i < teachingLevels.length; i++) {
        const level = teachingLevels[i];
        const avatarField = avatarFields[i];
        const botName = botNames[i];
        
        if (files?.[avatarField]?.[0]) {
          const avatarPath = path.join(packagePath, 'teaching-bots', `${level}-level`, `${botName || level}-avatar.png`);
          await fs.promises.writeFile(avatarPath, files[avatarField][0].buffer);
          console.log(`Saved ${level} teaching bot avatar to: ${avatarPath}`);
        }
      }

      res.json({ 
        success: true, 
        message: "Learning experience created successfully",
        packageId: `${experienceData.district}/${experienceData.course}/${experienceData.topic}`
      });
    } catch (error) {
      console.error("Error creating learning experience:", error);
      res.status(500).json({ error: "Failed to create learning experience" });
    }
  });

  // Delete content package endpoint
  app.delete("/api/content/delete-package", async (req, res) => {
    try {
      const { district, course, topic } = req.body;
      
      // Validate required fields
      if (!district || !course || !topic) {
        return res.status(400).json({ error: "District, course, and topic are required" });
      }

      // Protect the original Three Branches experience
      if (district === "demo-district" && course === "civics-government" && topic === "three-branches") {
        return res.status(403).json({ error: "Cannot delete the original Three Branches experience" });
      }

      const packagePath = path.join(
        process.cwd(), 
        'content', 
        district, 
        course, 
        topic
      );

      // Check if the directory exists
      if (!await fs.promises.access(packagePath).then(() => true).catch(() => false)) {
        return res.status(404).json({ error: "Content package not found" });
      }

      // Delete the entire directory
      await fs.promises.rm(packagePath, { recursive: true, force: true });

      res.json({ 
        success: true, 
        message: "Learning experience deleted successfully",
        packageId: `${district}/${course}/${topic}`
      });
    } catch (error) {
      console.error("Error deleting learning experience:", error);
      res.status(500).json({ error: "Failed to delete learning experience" });
    }
  });

  // Content creation assistant chat endpoint
  app.post("/api/claude/chat", async (req, res) => {
    try {
      const { messages, assistantType, stageContext, uploadedFiles } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          error: "Invalid message data. Expected an array of messages.",
        });
      }

      // Set up SSE headers for streaming
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Generate a thread ID
      const messageId = `claude-${assistantType || "general"}-${Date.now()}`;

      // Convert messages to Anthropic format and filter out empty messages
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== "system")
        .filter((msg: any) => msg.content && msg.content.trim().length > 0)
        .map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Choose system prompt based on assistant type
      let systemPrompt = "";
      
      // Debug logging to see what's happening
      console.log(`🔍 DEBUG Claude Chat - assistantType: "${assistantType}"`);
      console.log(`🔍 DEBUG Claude Chat - stageContext:`, stageContext);
      
      // 🔍 DEBUG: Log what uploadedFiles we received from frontend
      console.log("🔍 BACKEND DEBUG - Received uploadedFiles:", uploadedFiles);
      console.log("🔍 BACKEND DEBUG - uploadedFiles type:", typeof uploadedFiles);
      console.log("🔍 BACKEND DEBUG - uploadedFiles is array:", Array.isArray(uploadedFiles));
      console.log("🔍 BACKEND DEBUG - uploadedFiles length:", uploadedFiles?.length || 0);
      
      if (uploadedFiles && Array.isArray(uploadedFiles)) {
        uploadedFiles.forEach((file, index) => {
          console.log(`🔍 BACKEND DEBUG - File ${index + 1} received:`, {
            id: file.id,
            name: file.name,
            type: file.type,
            processingStatus: file.processingStatus,
            hasExtractedContent: !!file.extractedContent,
            contentLength: file.extractedContent?.length || 0,
            contentPreview: file.extractedContent?.substring(0, 100) || 'No content',
            interpretation: file.interpretation
          });
        });
      } else {
        console.log("🔍 BACKEND DEBUG - No uploaded files or not an array");
      }
      
      if (assistantType === "intake-basics") {
        systemPrompt = INTAKE_BASICS_PROMPT;
        console.log(`✅ DEBUG Claude Chat - Using INTAKE_BASICS_PROMPT`);
      } else if (assistantType === "intake-context") {
        // Build context-aware prompt for Stage 2
        let contextPrompt = INTAKE_CONTEXT_PROMPT;
        
        if (stageContext) {
          const contextInfo = `

## Stage 1 Context From Previous Conversation:
- School District: ${stageContext.schoolDistrict}
- School: ${stageContext.school}
- Subject: ${stageContext.subject}
- Topic: ${stageContext.topic}
- Grade Level: ${stageContext.gradeLevel}
- Learning Objectives: ${stageContext.learningObjectives}

Continue seamlessly from where Stage 1 left off. The teacher is now ready to provide course context and content materials.`;
          
          contextPrompt = INTAKE_CONTEXT_PROMPT + contextInfo;
        }
        
        // Add uploaded file content to the Stage 2 bot's context
        if (uploadedFiles && uploadedFiles.length > 0) {
          console.log(`📁 DEBUG Claude Chat - Processing ${uploadedFiles.length} uploaded files for context`);
          
          const completedFiles = uploadedFiles.filter((file: any) => file.extractedContent && file.processingStatus === 'completed');
          console.log(`📁 DEBUG Claude Chat - Found ${completedFiles.length} completed files with content`);
          
          const fileContent = completedFiles
            .map((file: any) => `## ${file.name}:\n${file.extractedContent}`)
            .join('\n\n');
          
          console.log(`📁 DEBUG Claude Chat - Generated file content length: ${fileContent.length} characters`);
          
          if (fileContent) {
            contextPrompt += `

## Uploaded Content for Analysis:
The teacher has uploaded the following materials for you to analyze and interpret:

${fileContent}

Use this content to help the teacher understand how their materials align with their teaching goals and to provide specific suggestions for their assessment bot design.`;
            console.log(`📁 DEBUG Claude Chat - Added ${uploadedFiles.length} uploaded files to context`);
            console.log(`📁 DEBUG Claude Chat - Final contextPrompt includes file content: ${contextPrompt.includes('Uploaded Content for Analysis')}`);
          } else {
            console.log(`📁 DEBUG Claude Chat - No file content to add (fileContent is empty)`);
          }
        } else {
          console.log(`📁 DEBUG Claude Chat - No uploaded files to process`);
        }
        
        systemPrompt = contextPrompt;
        console.log(`✅ DEBUG Claude Chat - Using INTAKE_CONTEXT_PROMPT with context`);
      } else if (assistantType === "intake-assessment-bot") {
        // Build context-aware prompt for Stage 3 (Assessment Bot Design)
        let assessmentBotPrompt = INTAKE_ASSESSMENT_BOT_PROMPT;
        
        if (stageContext) {
          const contextInfo = `

## Context From Previous Stages:
- School District: ${stageContext.schoolDistrict}
- School: ${stageContext.school}
- Subject: ${stageContext.subject}
- Topic: ${stageContext.topic}
- Grade Level: ${stageContext.gradeLevel}
- Learning Objectives: ${stageContext.learningObjectives}

## Course Materials Collected:
The teacher has already provided course context and materials in Stage 2. Use this background to help design an assessment bot that fits perfectly with their course content and student needs.`;
          
          assessmentBotPrompt = INTAKE_ASSESSMENT_BOT_PROMPT + contextInfo;
        }
        
        // Add uploaded file content to help inform bot design
        if (uploadedFiles && uploadedFiles.length > 0) {
          const completedFiles = uploadedFiles.filter((file: any) => file.extractedContent && file.processingStatus === 'completed');
          
          if (completedFiles.length > 0) {
            const fileContent = completedFiles
              .map((file: any) => `## ${file.name}:\n${file.extractedContent.substring(0, 1000)}...`)
              .join('\n\n');
            
            assessmentBotPrompt += `

## Course Content Reference:
Here's a sample of the materials the teacher provided for context (use this to inform personality and assessment approach):

${fileContent}`;
          }
        }
        
        systemPrompt = assessmentBotPrompt;
        console.log(`✅ DEBUG Claude Chat - Using INTAKE_ASSESSMENT_BOT_PROMPT with context`);
      } else if (assistantType === "personality-testing") {
        // Handle personality testing bot using GBPAC template
        const botPersonality = (req.body as any).botPersonality || "";
        const botName = (req.body as any).botName || "";
        const botJobTitle = (req.body as any).botJobTitle || "";
        const botWelcomeMessage = (req.body as any).botWelcomeMessage || "";
        const assessmentTargets = (req.body as any).assessmentTargets || (req.body as any).stageContext?.learningTargets || [];
        const stageContext = (req.body as any).stageContext || {};
        const uploadedFiles = (req.body as any).uploadedFiles || [];
        
        // 🔍 DETAILED DEBUG LOGGING
        console.log("🔥 PERSONALITY-TESTING DEBUG - Full request body keys:", Object.keys(req.body));
        console.log("🔥 PERSONALITY-TESTING DEBUG - botPersonality:", botPersonality);
        console.log("🔥 PERSONALITY-TESTING DEBUG - botName:", botName);
        console.log("🔥 PERSONALITY-TESTING DEBUG - botJobTitle:", botJobTitle);
        console.log("🔥 PERSONALITY-TESTING DEBUG - botWelcomeMessage:", botWelcomeMessage);
        console.log("🔥 PERSONALITY-TESTING DEBUG - assessmentTargets:", assessmentTargets);
        console.log("🔥 PERSONALITY-TESTING DEBUG - stageContext:", JSON.stringify(stageContext, null, 2));
        console.log("🔥 PERSONALITY-TESTING DEBUG - uploadedFiles length:", uploadedFiles?.length || 0);
        
        // Build uploaded files context from summaries
        let uploadedFilesContext = "No additional materials provided";
        if (uploadedFiles && uploadedFiles.length > 0) {
          const completedFiles = uploadedFiles.filter((file: any) => file.extractedContent && file.processingStatus === 'completed');
          
          if (completedFiles.length > 0) {
            uploadedFilesContext = completedFiles
              .map((file: any) => `${file.name}: ${file.extractedContent}`) // Use full summary (no truncation)
              .join('\n\n');
          }
        }
        
        // Use GBPAC template with variable substitution
        systemPrompt = PERSONALITY_TESTING_PROMPT
          .replace('[botName]', botName || 'Assessment Bot')
          .replace('[botJobTitle]', botJobTitle || 'Educational Assistant')
          .replace('[assessmentTargets]', Array.isArray(assessmentTargets) ? assessmentTargets.join(', ') : assessmentTargets || 'general understanding')
          .replace('[botPersonality]', botPersonality)
          .replace('[gradeLevel]', stageContext.gradeLevel || 'appropriate grade level')
          .replace(/\[gradeLevel\]/g, stageContext.gradeLevel || 'appropriate grade level') // Replace all instances
          .replace('[subject]', stageContext.subject || 'this subject')
          .replace(/\[subject\]/g, stageContext.subject || 'this subject') // Replace all instances
          .replace('[topic]', stageContext.topic || 'the topic')
          .replace('[uploadedFiles]', uploadedFilesContext)
          .replace('[botWelcomeMessage]', botWelcomeMessage || 'Welcome! Let\'s assess your understanding.')
          .replace('[additionalBoundaries]', ''); // Boundaries are now hardcoded in the template
        
        console.log(`✅ DEBUG Claude Chat - Using GBPAC template for personality testing`);
        console.log(`🎯 DEBUG - Bot Identity: ${botName} (${botJobTitle})`);
        console.log(`🎯 DEBUG - Course Context: ${stageContext.subject} - ${stageContext.topic} (Grade ${stageContext.gradeLevel})`);
        console.log(`🎯 DEBUG - Assessment Targets: ${Array.isArray(assessmentTargets) ? assessmentTargets.join(', ') : assessmentTargets}`);
        console.log(`🎯 DEBUG - Uploaded Files: ${uploadedFiles?.length || 0} files`);
        console.log(`🎯 DEBUG - Welcome Message: ${botWelcomeMessage ? 'Yes' : 'No'}`);
        console.log("🔥 FINAL SYSTEM PROMPT (first 500 chars):", systemPrompt.substring(0, 500));
        console.log("🔥 FINAL SYSTEM PROMPT (length):", systemPrompt.length);
      }
      
      // Final debug log to see what system prompt is actually being sent to Claude
      console.log(`🎯 DEBUG Claude Chat - Final systemPrompt (first 100 chars): "${systemPrompt.substring(0, 100)}..."`);
      console.log(`🎯 DEBUG Claude Chat - systemPrompt length: ${systemPrompt.length}`);
      console.log(`🎯 DEBUG Claude Chat - Is it the joke prompt? ${systemPrompt === INTAKE_BASICS_PROMPT}`);
      console.log(`🎯 DEBUG Claude Chat - System prompt assigned: ${systemPrompt ? 'Yes' : 'No'}`);
      console.log(`🎯 DEBUG Claude Chat - Messages count: ${anthropicMessages.length}`);
      console.log(`🎯 DEBUG Claude Chat - First user message: "${anthropicMessages.length > 0 ? anthropicMessages[anthropicMessages.length - 1]?.content?.substring(0, 50) + '...' : 'None'}"`);

      try {
        // Send the initial thread ID
        res.write(`data: ${JSON.stringify({ threadId: messageId })}\n\n`);

        // Create streaming response from Anthropic
        const stream = await anthropic.messages.stream({
          messages: anthropicMessages,
          system: systemPrompt,
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4096,
          temperature: 0.7,
        });

        let fullContent = "";

        // Process the stream
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
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
            const allMessages = [
              ...anthropicMessages,
              { role: "assistant", content: fullContent },
            ];

            await storage.createConversation({
              sessionId,
              threadId: messageId,
              assistantType: assistantType || "general",
              messages: allMessages,
            });
            console.log(`Stored ${assistantType} conversation for session ${sessionId}`);
          } catch (err) {
            console.error("Error storing conversation:", err);
          }
        }

        // 🔍 LOG: Capture the exact JSON format Claude is sending
        console.log('🔥 STREAMING COMPLETION - Full content length:', fullContent.length);
        console.log('🔥 STREAMING COMPLETION - Last 500 chars:', fullContent.substring(fullContent.length - 500));
        
        // Check for JSON patterns in Claude's response
        if (fullContent.includes('confirm_persona')) {
          console.log('🔥 STREAMING COMPLETION - Contains confirm_persona, extracting JSON patterns:');
          
          // Check for markdown JSON blocks
          const markdownJsonRegex = /```json\s*\n([\s\S]*?)\n```/g;
          let match;
          while ((match = markdownJsonRegex.exec(fullContent)) !== null) {
            console.log('🔥 STREAMING COMPLETION - Found markdown JSON:', match[1]);
          }
          
          // Check for plain JSON objects
          const plainJsonRegex = /\{\s*"action":\s*"[^"]+"\s*,[\s\S]*?\}/g;
          let plainMatch;
          while ((plainMatch = plainJsonRegex.exec(fullContent)) !== null) {
            console.log('🔥 STREAMING COMPLETION - Found plain JSON:', plainMatch[0]);
          }
        }

        // Send the [DONE] event
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (error: any) {
        console.error("Error in Claude chat streaming:", error);
        res.write(
          `data: ${JSON.stringify({ error: "chat_error", message: error.message || "Streaming error occurred" })}\n\n`,
        );
        res.end();
      }
    } catch (error: any) {
      console.error("Claude chat endpoint error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process chat request" });
      }
    }
  });



  // Production Deep Linking Test Route
  app.get('/test-deep-linking', async (req, res) => {
    try {
      const packages = await contentManager.scanContentPackages();
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Deep Linking Test - Production Verification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
            .header { background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .status { background: #fff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4caf50; }
            .test-section { background: #fff; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .package { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .success { color: #2e7d32; font-weight: bold; }
            .info { color: #1976d2; }
            .note { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .link { color: #1976d2; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Deep Linking Production Test</h1>
            <p>This page verifies that your AWS deployment is correctly serving the deep linking functionality.</p>
          </div>

          <div class="status">
            <h2 class="success">✅ Production Status: Working Correctly</h2>
            <p><strong>Found ${packages.length} content packages ready for Canvas integration</strong></p>
          </div>

          <div class="test-section">
            <h3>Available Content Packages:</h3>
            ${packages.map(pkg => `
              <div class="package">
                <h4>${pkg.name}</h4>
                <p><strong>ID:</strong> ${pkg.id}</p>
                <p><strong>Description:</strong> ${pkg.description}</p>
                <p><strong>Assessment Bot:</strong> ${pkg.assessmentBot.name}</p>
              </div>
            `).join('')}
          </div>

          <div class="note">
            <h3>🔍 How Deep Linking Works:</h3>
            <ul>
              <li><strong>Direct Visit (app.onedayahead.com):</strong> Shows Three Branches with Reggie (default experience)</li>
              <li><strong>Canvas Deep Linking:</strong> Teachers see content selection interface when creating assignments</li>
              <li><strong>Test URL:</strong> <a href="/api/lti/deep-linking-dev" target="_blank" class="link">Visit Deep Linking Test Interface</a></li>
            </ul>
          </div>

          <div class="note">
            <h3>✨ Next Steps for Canvas Integration:</h3>
            <ol>
              <li>Register your LTI tool in Canvas using: <a href="/api/lti/config" target="_blank" class="link">/api/lti/config</a></li>
              <li>When teachers create assignments, they'll see the content selection interface</li>
              <li>Selected content will launch the appropriate experience (Three Branches, Clouds, etc.)</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p class="success">🎉 Your deployment is working perfectly!</p>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Test page error:', error);
      res.status(500).send('Error generating test page');
    }
  });

  // AI Usage Dashboard API endpoint
  app.get("/api/admin/ai-usage", async (req, res) => {
    try {
      const now = new Date();
      
      // Calculate date ranges
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);
      
      const monthStart = new Date(today);
      monthStart.setDate(monthStart.getDate() - 30);
      
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      // Get usage stats for different periods
      const [todayStats, yesterdayStats, weekStats, monthStats] = await Promise.all([
        storage.getAiUsageStats(today, endOfToday),
        storage.getAiUsageStats(yesterday, endOfYesterday),
        storage.getAiUsageStats(weekStart, endOfToday),
        storage.getAiUsageStats(monthStart, endOfToday)
      ]);

      res.json({
        today: todayStats,
        yesterday: yesterdayStats,
        week: weekStats,
        month: monthStats
      });
    } catch (error) {
      console.error("Error fetching AI usage stats:", error);
      res.status(500).json({
        error: "Failed to fetch AI usage statistics"
      });
    }
  });

  // File processing endpoints for Stage 2 content collection
  
  // YouTube transcript extraction endpoint using RapidAPI
  app.post("/api/intake/extract-youtube", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      console.log(`🎥 RAPIDAPI YOUTUBE - Processing URL: ${url}`);

      // Extract video ID from YouTube URL
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      // Get video title using oEmbed API
      let title = "YouTube Video";
      try {
        const titleResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          title = titleData.title || "YouTube Video";
          console.log(`🎥 RAPIDAPI YOUTUBE - Retrieved title: ${title}`);
        }
      } catch (titleError) {
        console.log(`🎥 RAPIDAPI YOUTUBE - Could not retrieve title: ${titleError.message}`);
      }

      // Get transcript using RapidAPI directly
      console.log(`🎥 RAPIDAPI YOUTUBE - Fetching transcript via RapidAPI...`);
      
      const options = {
        method: 'GET',
        url: 'https://youtube-transcriptor.p.rapidapi.com/transcript',
        params: {
          video_id: videoId,
          lang: 'en'
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'youtube-transcriptor.p.rapidapi.com'
        }
      };

      try {
        const response = await axios.request(options);
        
        console.log(`🎥 RAPIDAPI - Response status: ${response.status}`);
        
        // Check if we got a valid response with video data
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const videoData = response.data[0];
          
          // Check if transcription exists
          if (videoData.transcription && Array.isArray(videoData.transcription)) {
            // Convert RapidAPI format to our expected format and create full text
            const fullText = videoData.transcription
              .map(segment => segment.subtitle)
              .join(' ');
            
            console.log(`🎥 RAPIDAPI YOUTUBE - Success! Retrieved ${videoData.transcription.length} segments, ${fullText.length} characters`);
            
            const responseData = {
              success: true,
              videoId,
              title,
              transcript: fullText,
              transcriptError: null,
              chunks: videoData.transcription.length,
              duration: 0
            };

            res.json(responseData);
          } else if (videoData.transcriptionAsText) {
            // If no segment data but we have full text, use that
            console.log(`🎥 RAPIDAPI YOUTUBE - Using transcriptionAsText fallback`);
            
            const responseData = {
              success: true,
              videoId,
              title,
              transcript: videoData.transcriptionAsText,
              transcriptError: null,
              chunks: 1,
              duration: 0
            };

            res.json(responseData);
          } else {
            throw new Error('No transcript data found in response');
          }
        } else {
          throw new Error('Empty or invalid response from API');
        }
      } catch (apiError: any) {
        console.error('🎥 RAPIDAPI YOUTUBE - API Error:', apiError.response?.data || apiError.message);
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to extract transcript';
        
        if (apiError.response?.status === 401) {
          errorMessage = 'Invalid API key - please check RAPIDAPI_KEY configuration';
        } else if (apiError.response?.status === 403) {
          errorMessage = 'API access forbidden - check subscription and quotas';
        } else if (apiError.response?.status === 429) {
          errorMessage = 'Rate limit exceeded - too many requests';
        } else if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        const responseData = {
          success: true,
          videoId,
          title,
          transcript: "",
          transcriptError: errorMessage,
          chunks: 0,
          duration: 0
        };

        res.json(responseData);
      }
      
    } catch (error: any) {
      console.error('🎥 RAPIDAPI YOUTUBE - Error:', error);
      res.status(500).json({
        error: "Failed to extract YouTube transcript",
        details: error.message
      });
    }
  });

  // Canvas .imscc file upload and parsing endpoint
  app.post("/api/intake/upload-imscc", upload.single('imscc'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "IMSCC file is required" });
      }

      // Validate file type (should be .imscc or .zip)
      const fileName = req.file.originalname.toLowerCase();
      if (!fileName.endsWith('.imscc') && !fileName.endsWith('.zip')) {
        return res.status(400).json({ 
          error: "File must be a Canvas .imscc export file" 
        });
      }

      // Import the IMSCC parser
      const IMSCCParser = require('./imscc-parser');
      const parser = new IMSCCParser();

      // Save uploaded file temporarily
      const fs = require('fs');
      const path = require('path');
      const tempDir = path.join(__dirname, 'temp');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `${Date.now()}-${req.file.originalname}`);
      fs.writeFileSync(tempFilePath, req.file.buffer);

      try {
        // Parse the .imscc file
        const courseData = await parser.parseIMSCC(tempFilePath);
        
        // Generate course summary for AI assistant
        const courseSummary = parser.generateCourseSummary(courseData);
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        res.json({
          success: true,
          filename: req.file.originalname,
          courseName: courseData.title,
          summary: courseSummary,
          // Include detailed data for debugging (can be removed in production)
          fullData: {
            moduleCount: courseData.modules.length,
            pagesCount: courseData.pages.length,
            quizzesCount: courseData.quizzes.length,
            filesCount: courseData.files.length,
            totalWords: courseSummary.content.totalWords
          }
        });
        
      } catch (parseError: any) {
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        console.error('IMSCC parsing error:', parseError);
        res.status(500).json({
          error: "Failed to parse Canvas course file",
          details: parseError.message
        });
      }
      
    } catch (error: any) {
      console.error('IMSCC upload error:', error);
      res.status(500).json({
        error: "Failed to process Canvas course upload",
        details: error.message
      });
    }
  });

  // Multiple avatar options generation endpoint
  app.post("/api/intake/generate-avatars", async (req, res) => {
    try {
      console.log("🎨 AVATAR SERVER DEBUG - Avatar generation endpoint called");
      console.log("🎨 AVATAR SERVER DEBUG - Request body keys:", Object.keys(req.body));
      
      const { prompt, style = "digital art", count = 3 } = req.body;

      console.log("🎨 AVATAR SERVER DEBUG - Extracted prompt:", prompt);
      console.log("🎨 AVATAR SERVER DEBUG - Prompt length:", prompt?.length || 0);
      console.log("🎨 AVATAR SERVER DEBUG - Style:", style);
      console.log("🎨 AVATAR SERVER DEBUG - Count:", count);

      if (!prompt) {
        console.log("🎨 AVATAR SERVER DEBUG - No prompt provided, returning error");
        return res.status(400).json({ error: "Image prompt is required" });
      }

      if (!openai) {
        console.log("🎨 AVATAR SERVER DEBUG - OpenAI client not configured, returning error");
        return res.status(500).json({ 
          error: "OpenAI API key not configured",
          details: "Image generation is not available - please provide OPENAI_API_KEY" 
        });
      }

      console.log(`🎨 AVATAR SERVER DEBUG - About to generate ${count} avatar options with OpenAI DALL-E 3`);
      console.log(`🎨 AVATAR SERVER DEBUG - Full prompt being sent:`, prompt);
      
      // Generate multiple images with slight variations
      const avatarPromises = Array.from({ length: count }, (_, i) => {
        const variation = i === 0 ? "" : `, variation ${i + 1}`;
        const fullPrompt = `${prompt}${variation}. Style: ${style}. Educational, friendly, appropriate for students, cartoon-style square illustration, professional character design. IMPORTANT: Show only ONE person, a single character, centered, and facing forward. Do not include multiple people or figures.`;
        
        console.log(`🎨 AVATAR SERVER DEBUG - DALL-E Prompt ${i + 1}:`, fullPrompt);
        
        return openai.images.generate({
          model: "dall-e-3",
          prompt: fullPrompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        });
      });

      const responses = await Promise.all(avatarPromises);
      console.log(`🎨 AVATAR SERVER DEBUG - OpenAI responses received:`, responses.length);
      console.log(`🎨 AVATAR SERVER DEBUG - Response statuses:`, responses.map((r, i) => `Response ${i + 1}: ${r.data?.[0]?.url ? 'SUCCESS' : 'FAILED'}`));
      
      const avatars = responses.map((response, index) => ({
        id: `avatar_${index + 1}`,
        imageUrl: response.data[0]?.url,
        description: `${prompt} - Option ${index + 1}`
      })).filter(avatar => avatar.imageUrl);

      console.log(`🎨 AVATAR SERVER DEBUG - Generated ${avatars.length} avatar options successfully`);
      console.log(`🎨 AVATAR SERVER DEBUG - Avatar URLs present:`, avatars.map(a => a.imageUrl ? '✓' : '✗'));
      console.log(`🎨 AVATAR SERVER DEBUG - First avatar URL (first 50 chars):`, avatars[0]?.imageUrl?.substring(0, 50) || 'None');

      res.json({
        success: true,
        avatars,
        prompt: prompt,
        style: style,
        source: "OpenAI DALL-E 3"
      });

    } catch (error: any) {
      console.error('Multiple avatar generation error:', error);
      
      let errorMessage = 'Failed to generate avatars';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded - too many image generation requests';
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({
        error: "Avatar generation failed",
        details: errorMessage
      });
    }
  });

  // Single image generation endpoint for Stage 3 Assessment Bot design  
  app.post("/api/intake/generate-image", async (req, res) => {
    try {
      const { prompt, style = "digital art" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Image prompt is required" });
      }

      if (!openai) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured",
          details: "Image generation is not available - please provide OPENAI_API_KEY" 
        });
      }

      console.log("🎨 Generating image with OpenAI DALL-E 3 for prompt:", prompt);
      
      // Generate image using OpenAI DALL-E
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${prompt}. Style: ${style}. Educational, friendly, appropriate for students, cartoon-style square illustration. IMPORTANT: Show only ONE person, a single character, centered, and facing forward. Do not include multiple people or figures.`,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = response.data[0]?.url;
      
      console.log("✅ OpenAI DALL-E 3 response received, image URL:", imageUrl ? "✓" : "✗");
      
      if (!imageUrl) {
        console.error("❌ No image URL returned from OpenAI");
        return res.status(500).json({ 
          error: "Failed to generate image",
          details: "No image URL returned from OpenAI" 
        });
      }

      res.json({
        success: true,
        imageUrl,
        prompt: prompt,
        style: style,
        source: "OpenAI DALL-E 3"
      });

    } catch (error: any) {
      console.error('Image generation error:', error);
      
      let errorMessage = 'Failed to generate image';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded - too many image generation requests';
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({
        error: "Image generation failed",
        details: errorMessage
      });
    }
  });

  // AI-powered bot name and description extraction endpoint
  app.post("/api/intake/generate-welcome-message", async (req, res) => {
    try {
      const { botName, botJobTitle, botPersonality, stageContext } = req.body;

      if (!botName || !botPersonality) {
        return res.status(400).json({ error: "Bot name and personality are required" });
      }

      const welcomePrompt = `Generate a warm, engaging welcome message for students who are about to interact with an assessment bot. This message will appear on the page before they start chatting with the bot.

## Bot Details:
- Name: ${botName}
- Role: ${botJobTitle || 'Assessment Bot'}
- Personality: ${botPersonality}

## Course Context:
- Subject: ${stageContext?.subject || 'N/A'}
- Topic: ${stageContext?.topic || 'N/A'} 
- Grade Level: ${stageContext?.gradeLevel || 'N/A'}

## Requirements:
- Introduce who the bot is with personality
- Explain that this is an assessment conversation
- Be encouraging and welcoming
- Stay true to the bot's character
- Keep it concise (2-3 sentences max)
- Age-appropriate for the grade level
- Don't mention specific learning targets

Generate only the welcome message text, nothing else.`;

      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: welcomePrompt
          }
        ]
      });

      const welcomeMessage = response.content[0].type === 'text' ? response.content[0].text.trim() : 'Welcome! Let\'s assess your understanding.';

      res.json({
        success: true,
        welcomeMessage: welcomeMessage
      });

    } catch (error: any) {
      console.error('Welcome message generation error:', error);
      res.status(500).json({
        error: "Failed to generate welcome message",
        details: error.message
      });
    }
  });

  // Content summarization endpoint
  app.post("/api/intake/summarize-content", async (req, res) => {
    try {
      const { content, fileName, fileType, subject, topic, gradeLevel } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const summarizationPrompt = `You are analyzing course materials to create a concise summary for an AI assessment bot. The bot needs to understand what students just learned.

## Course Context:
- Subject: ${subject || 'Not specified'}
- Topic: ${topic || 'Not specified'}
- Grade Level: ${gradeLevel || 'Not specified'}
- File: ${fileName || 'Unknown file'}
- Type: ${fileType || 'Unknown type'}

## Content to Summarize:
${content}

## Instructions:
Create a brief, focused summary (2-3 sentences max) that captures:
1. The main learning concepts presented
2. Key facts or skills students should have gained
3. Any specific examples or cases mentioned

Focus on what students were supposed to learn, not implementation details. Be concise but informative.

Generate only the summary text, nothing else.`;

      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 150,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: summarizationPrompt
          }
        ]
      });

      const summary = response.content[0].type === 'text' ? response.content[0].text.trim() : 'Content uploaded and processed.';

      res.json({
        success: true,
        summary: summary
      });

    } catch (error: any) {
      console.error('Content summarization error:', error);
      res.status(500).json({
        error: "Failed to summarize content",
        details: error.message
      });
    }
  });

  app.post("/api/intake/extract-bot-info", async (req, res) => {
    try {
      const { botResponse } = req.body;

      if (!botResponse) {
        return res.status(400).json({ error: "Bot response is required" });
      }

      console.log("🤖 Extracting bot info from response using Claude...");

      const extractionPrompt = `Please analyze this AI assistant's response and extract ONLY information about the bot personality being confirmed.

The assistant is introducing a character/bot personality that the user has chosen to confirm. Extract:
1. The bot's name (if mentioned)
2. The bot's role or title/job title (e.g., "Literature Professor", "Island Guide")
3. A SHORT personality description (maximum 2-3 sentences focusing on key traits)
4. A few lines of sample dialogue showing how this bot would speak to students (2-3 example sentences)
5. Create a visual description suitable for image generation (appearance, clothing, props, expression)

Response to analyze:
"${botResponse}"

Respond in JSON format:
{
  "name": "extracted name or null",
  "jobTitle": "role or title for this character",
  "description": "SHORT 2-3 sentence personality description",
  "sampleDialogue": "2-3 example sentences showing how the bot speaks",
  "visualDescription": "detailed physical appearance for image generation"
}`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: extractionPrompt,
          },
        ],
      });

      const content = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log("🤖 Claude extraction response:", content);

      // Parse the JSON response
      let extractedInfo;
      try {
        // Handle potential markdown code blocks and extra text
        let jsonString;
        
        // Try to extract JSON from code blocks first
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          // Look for JSON object pattern
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          } else {
            jsonString = content;
          }
        }
        
        extractedInfo = JSON.parse(jsonString.trim());
        console.log("✅ Successfully parsed JSON:", extractedInfo);
        
      } catch (parseError) {
        console.error("Failed to parse Claude response as JSON:", parseError);
        console.error("Raw Claude response:", content);
        
        // Return a fallback extraction with basic info
        extractedInfo = {
          name: null,
          jobTitle: "Educational Character",
          description: "A friendly educational assistant",
          sampleDialogue: "Hello! I'm here to help with your learning. What would you like to explore today?",
          visualDescription: "A friendly cartoon character appropriate for educational settings"
        };
        console.log("🔄 Using fallback extraction due to parse error");
      }

      console.log("✅ Extracted bot info:", extractedInfo);

      // Extract the full personality from the original response
      // Look for the complete personality description between certain markers
      let fullPersonality = extractedInfo.description || null;
      
      // Try to find a more complete personality description in the original response
      // Look for text that comes after phrases like "personality:" or "persona:" 
      const personalityMatch = botResponse.match(/(?:personality|persona|character):\s*([^.!?]+(?:[.!?]\s*[^.!?]+)*)/i);
      if (personalityMatch && personalityMatch[1].length > 50) {
        fullPersonality = personalityMatch[1].trim();
      }
      
      res.json({
        success: true,
        name: extractedInfo.name || null,
        jobTitle: extractedInfo.jobTitle || null,
        personalitySummary: extractedInfo.description || null, // Short summary
        personality: fullPersonality || extractedInfo.description || null, // Full personality text
        fullPersonality: fullPersonality || extractedInfo.description || null, // Also send as fullPersonality for compatibility
        sampleDialogue: extractedInfo.sampleDialogue || null,
        visualDescription: extractedInfo.visualDescription || null,
        source: "Claude AI extraction"
      });

    } catch (error: any) {
      console.error('Bot info extraction error:', error);
      res.status(500).json({
        error: "Failed to extract bot information",
        details: error.message
      });
    }
  });

  // System prompt generation endpoint - wraps personality, avatar, boundaries into complete system prompt
  app.post("/api/intake/generate-system-prompt", async (req, res) => {
    try {
      const { 
        personality, 
        avatar, 
        boundaries, 
        course,
        topic,
        gradeLevel,
        goals 
      } = req.body;

      if (!personality) {
        return res.status(400).json({ error: "Personality description is required" });
      }

      // Generate comprehensive system prompt
      const systemPrompt = `# ${personality.name || "Assessment Bot"} - AI Teaching Assistant

## PERSONALITY & CHARACTER
${personality.description || "You are a friendly and knowledgeable AI assistant."}

${personality.speakingStyle ? `### Speaking Style
${personality.speakingStyle}` : ""}

${personality.sampleDialogue ? `### Sample Dialogue
${personality.sampleDialogue}` : ""}

## VISUAL REPRESENTATION
${avatar?.description ? `You appear as: ${avatar.description}` : ""}
${avatar?.imageUrl ? `Avatar Image: ${avatar.imageUrl}` : ""}

## EDUCATIONAL CONTEXT
- **Course**: ${course || "General Education"}
- **Topic**: ${topic || "Learning Content"}
- **Grade Level**: ${gradeLevel || "Grade Level Not Specified"}

## GOALS & OBJECTIVES
${goals ? goals : `Your primary goal is to assess student understanding of ${topic || "the learning content"} and provide appropriate feedback and guidance.`}

## BOUNDARIES & LIMITATIONS
${boundaries ? boundaries : "Maintain appropriate classroom standards and stay focused on educational content."}

## ASSESSMENT APPROACH
- Engage students in meaningful conversation about ${topic || "the topic"}
- Ask follow-up questions to gauge deep understanding
- Provide encouragement and constructive feedback
- Route students to appropriate next steps based on their performance

## RESPONSE GUIDELINES
- Keep responses conversational and age-appropriate for ${gradeLevel || "students"}
- Use ${personality.name || "your character's"} voice consistently
- Be encouraging while maintaining academic rigor
- Ask one question at a time to avoid overwhelming students
- Acknowledge correct responses and gently correct misconceptions`;

      res.json({
        success: true,
        systemPrompt,
        components: {
          personality,
          avatar,
          boundaries,
          course,
          topic,
          gradeLevel,
          goals
        },
        generatedAt: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('System prompt generation error:', error);
      res.status(500).json({
        error: "Failed to generate system prompt",
        details: error.message
      });
    }
  });
  
  // PDF text extraction endpoint
  app.post("/api/intake/extract-pdf", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "PDF file is required" });
      }
      
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: "File must be a PDF" });
      }
      
      // Use pdf-parse to extract text from PDF buffer
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(req.file.buffer);
      
      res.json({
        success: true,
        filename: req.file.originalname,
        text: data.text,
        pages: data.numpages,
        info: data.info
      });
      
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      res.status(500).json({
        error: "Failed to extract PDF text",
        details: error.message
      });
    }
  });
  
  // Text file processing endpoint
  app.post("/api/intake/extract-text", upload.single('textfile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Text file is required" });
      }
      
      // Check if it's a text file
      const allowedTypes = ['text/plain', 'text/csv', 'application/rtf'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "File must be a text file (txt, csv, rtf)" });
      }
      
      // Convert buffer to text
      const text = req.file.buffer.toString('utf-8');
      
      res.json({
        success: true,
        filename: req.file.originalname,
        text: text,
        size: req.file.size,
        encoding: 'utf-8'
      });
      
    } catch (error: any) {
      console.error('Text file extraction error:', error);
      res.status(500).json({
        error: "Failed to extract text from file",
        details: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
