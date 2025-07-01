# Learning Platform - Complete Project Source Export
*Generated: July 01, 2025 - Updated with latest Claude streaming fixes*

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Configuration Files](#configuration-files)
4. [Backend Source Code](#backend-source-code)
5. [Frontend Source Code](#frontend-source-code)
6. [Database Schema](#database-schema)
7. [Key Features](#key-features)
8. [Dependencies](#dependencies)
9. [Deployment](#deployment)

---

## Project Overview

This is a comprehensive LTI 1.3 compliant learning platform application designed specifically for Educational Technology (EdTech) environments. The platform provides an interactive learning experience centered around the three branches of the U.S. government, featuring AI-powered conversations, assessments, and personalized feedback mechanisms with full Canvas LMS integration.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Anthropic Claude (claude-3-7-sonnet-20250219)
- **Authentication**: LTI 1.3 with Canvas integration
- **Styling**: Tailwind CSS + shadcn/ui components

---

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Canvas LMS    │    │  Learning App   │    │  External APIs  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ LTI Launch  │◄┼────┼►│ LTI Routes  │ │    │ │ Anthropic   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │ Claude API  │ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │ Grade Book  │◄┼────┼►│ Grade       │ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ │ Passback    │ │    │ │ N8N         │ │
│ ┌─────────────┐ │    │ └─────────────┘ │    │ │ Webhooks    │ │
│ │ Deep Link   │◄┼────┼►│ Deep Link   │ │    │ └─────────────┘ │
│ └─────────────┘ │    │ │ Handler     │ │    └─────────────────┘
└─────────────────┘    │ └─────────────┘ │
                       │ ┌─────────────┐ │
                       │ │ React SPA   │ │
                       │ └─────────────┘ │
                       └─────────────────┘
                              │
                       ┌─────────────────┐
                       │  PostgreSQL DB  │
                       │                 │
                       │ ┌─────────────┐ │
                       │ │ LTI Schema  │ │
                       │ │ User Data   │ │
                       │ │ Conversations│ │
                       │ │ Feedback    │ │
                       │ └─────────────┘ │
                       └─────────────────┘
```

### Learning Flow
1. **Video Introduction**: YouTube embed with pause detection
2. **Article Discussion**: Interactive chat about government branches
3. **Assessment Phase**: AI-powered evaluation with topic tracking
4. **Dynamic Teaching**: Personalized instruction based on assessment gaps
5. **Final Feedback**: Comprehensive results with PDF export capability

---

## Configuration Files

### package.json
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.37.0",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@tailwindcss/vite": "^4.1.3",
    "@tanstack/react-query": "^5.60.5",
    "axios": "^1.9.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "connect-pg-simple": "^10.0.0",
    "cookie-parser": "^1.4.7",
    "date-fns": "^3.6.0",
    "dompurify": "^3.2.5",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "embla-carousel-react": "^8.6.0",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "express-session": "^1.18.1",
    "framer-motion": "^11.18.2",
    "helmet": "^8.1.0",
    "html2pdf.js": "^0.10.3",
    "input-otp": "^1.4.2",
    "jsonwebtoken": "^9.0.2",
    "ltijs": "^5.9.7",
    "lucide-react": "^0.453.0",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.6",
    "node-jose": "^2.2.0",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "pdfjs-dist": "^5.2.133",
    "pg": "^8.11.3",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-markdown": "^10.1.0",
    "react-pdf": "^9.2.1",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "remark-gfm": "^4.0.1",
    "@replit/vite-plugin-cartographer": "^0.0.11",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "uuid": "^11.1.0",
    "vaul": "^1.1.2",
    "@vitejs/plugin-react": "^4.3.2",
    "wouter": "^3.3.5",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.16.11",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.30.4",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.14"
  }
}
```

---

## Backend Source Code

### server/index.ts
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middleware/session";
import {
  corsMiddleware,
  securityHeadersMiddleware,
} from "./middleware/security";
import { runMigrations } from "./migrations";
import { pool } from "./db";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(corsMiddleware);
app.use(securityHeadersMiddleware);
app.use(
  cookieParser(process.env.COOKIE_SECRET || "learning-platform-secret-key"),
);

app.use((req, res, next) => {
  const start = Date.now();
  let captured: any;
  const ogJson = res.json;
  res.json = function (body, ...a) {
    captured = body;
    return ogJson.apply(res, [body, ...a]);
  };
  res.on("finish", () => {
    if (!req.path.startsWith("/api")) return;
    const ms = Date.now() - start;
    let line = `${req.method} ${req.path} ${res.statusCode} in ${ms}ms`;
    if (captured) line += ` :: ${JSON.stringify(captured)}`;
    if (line.length > 80) line = line.slice(0, 79) + "…";
    log(line);
  });
  next();
});

// Test database connection before anything else
async function testDatabaseConnection() {
  console.log("🔍 Testing basic database connection...");
  console.log(
    "📍 Database URL:",
    process.env.DATABASE_URL?.replace(/\/\/.*:.*@/, "//***:***@"),
  );

  try {
    const client = await pool.connect();
    console.log("✅ Database connection successful!");
    console.log("📊 Connected to database:", client.database);
    console.log("🏠 Connected to host:", client.host);
    console.log("🔌 Connected on port:", client.port);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("🚨 Error details:", error);
    return false;
  }
}

(async () => {
  try {
    const skipDb = process.env.SKIP_DB_MIGRATIONS === "true";
    // Check if we should use memory storage
    const useMemoryStorage = process.env.NODE_ENV === "development" && process.env.USE_MEMORY_STORAGE === "true";

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else if (useMemoryStorage) {
      console.log("🔧 Development mode with in-memory storage - no database required");
    } else {
      // Test connection first
      const connectionSuccess = await testDatabaseConnection();
      if (!connectionSuccess) {
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 Database connection failed in development mode - switching to in-memory storage");
          process.env.USE_MEMORY_STORAGE = "true";
          // Reinitialize storage with new environment variable
          const { reinitializeStorage } = await import("./storage");
          reinitializeStorage();
        } else {
          console.error("💥 Cannot connect to database. Exiting...");
          process.exit(1);
        }
      } else {
        console.log("🔄 Running database migrations...");
        await runMigrations();
      }
      console.log("✅ Migrations completed successfully");
    }

    /* ----- NEW: skip session store when DB is skipped ----- */
    if (skipDb) {
      console.log("⚠️  Skipping session store (CI smoke-test)");
    } else {
      app.use(sessionMiddleware);
    }

    const server = await registerRoutes(app);

    app.get("/health", (_req, res) => res.status(200).send("OK"));

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message || "Error" });
      throw err;
    });

    if (app.get("env") === "development") {
      app.use((req, res, next) => {
        if (req.query.production === "true") {
          serveStatic(app);
        } else next();
      });
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = Number(process.env.PORT) || 5000;
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
      log(`🚀 serving on port ${port}`),
    );
  } catch (err) {
    console.error("💥 Failed to start server:", err);
    process.exit(1);
  }
})();
```

### server/prompts.ts
```typescript
/**
 * AI Assistant System Prompts Configuration
 * 
 * This file contains the system prompts for various AI assistants used in the learning platform.
 * Moving these from environment variables to configuration files for better maintainability.
 */

export const ARTICLE_ASSISTANT_SYSTEM_PROMPT = `You are a fresh, fun, interesting learning assistant. You discussing the content of an article about the three branches of government in the United States. Provide clear, concise answers to questions about these government branches or related topics. you aim for a quick back and forth conversation, aiming to limit most responses to 3 sentences or less. You push students to deepen their thinking and you ask them engaging questions.

You will refuse to discuss anything unrelated to the government structure of political science. You will not discuss political hot-button issues at all. You are talking to high school aged students and should keep all content appropriate for that audience.

This is the text of the article the student can see on the screen. You should refer to it as "the article to the left" the first time, and "the article" after.

The Three Branches of Government: How the Pieces Fit Together

Why Split It Up?
When the Founders wrote the Constitution, they were fresh off a bad breakup—with King George III. They had seen firsthand what happens when too much power sits in one place. So they designed a government that splits power into three different groups, each with its own special job: Congress makes the laws, the President enforces them, and the Courts interpret them. It's like building a three-legged stool—knock one leg out, and the whole thing wobbles. The idea was simple but revolutionary: separate powers to prevent tyranny.

Congress: The Playbook Writers
Congress is the lawmaking branch—the people who write the rules of the game. It's made up of two parts: the House of Representatives and the Senate. Together, they decide what laws the country needs, how to spend its money, and even when to go to war. Think of Congress like the team's head strategists, crafting the game plan. But writing the laws doesn't mean they automatically happen—that job belongs to someone else.

The President: The Enforcer on the Field
The President leads the Executive Branch, whose main job is to carry out the laws Congress passes. That means everything from leading the military to making sure food safety standards are actually followed. If Congress is the playbook writer, the President is the coach—and sometimes the quarterback—making real-time decisions. The President can also veto laws (send them back to Congress unsigned) and make deals with other countries. But while the President is powerful, they still have to play by the rules Congress sets.

The Courts: Keeping Everyone Honest
The Judicial Branch, led by the Supreme Court, acts as the referee. Judges look at laws and government actions and decide whether they follow the Constitution—the highest rulebook of all. If Congress or the President tries to bend the rules too far, the courts can blow the whistle and stop it. It's a powerful job, but it relies on trust: courts don't have armies or budgets to enforce their decisions. They depend on people respecting the system. When the three branches work together, they keep each other in check while still getting things done.

Here is the transcript to a youtube video the student just watched. You should mostly focus on the article, but if a point lines up really well with the video you can occasionally reference this content as well in an explanation. You should refer to it as "The video on the pervious screen" the first time, and then just "the video" after. 

Transcript: Hi friends. Today we are diving into the three branches of government. The classic American tricycle of freedom. You've got your legislative branch, your executive branch, and your judicial branch. Each designed to roll together in harmony. The founders were a cautious bunch. They just broken up with a pretty clingy British monarch. And they weren't looking to jump into another controlling relationship anytime soon. So they designed a system where the power was spread around evenly, ensuring no single branch could dominate. As James Madison wisely warned, the accumulation of all powers, legislative, executive, and judiciary, in the same hands, may justly be pronounced the very definition of tyranny. Madison was basically saying, don't put all your eggs in one basket, especially when that basket controls your literal freedom. So the first branch they created is called the legislative branch, but you probably know it as Congress. These representatives are elected by the people of a state or district, and they write the laws, control the spending, and declare war. If America is a sport, then Congress owns the team. They take in the revenue from the fans, they handle expenses, they write the playbook, and they plan for the future. The second branch is called the executive branch. That's the president and their crew. Their job is to execute the will of Congress. This means enforcing laws, commanding the military, and handling foreign policy and giving speeches and things. If Congress owns the team, then the president is the coach on the sidelines. They call the plays. They interface with the other teams. They get the glory or the blame. And finally, we have the judicial branch, the courts. These people interpret the laws, and they make sure everyone's playing by the rules. Think of them like the referee with a whistle and a rule book. Necessary, mostly respected. But here's the genius move, friends. Rather than simply defining what each branch was in charge of, the founders gave each branch some control over the others. We call this system checks and balances. This means each branch has ways of keeping the others from going full-on dictator. For example, Congress makes the laws, right? But the founders gave the president the power to veto, like cancel any new laws that they think are dumb. Or take this one. If the president is breaking the law, the founders gave Congress the power to hold a trial and kick him out. We call this impeachment. And though the president has the power to appoint justices s to the Supreme Court, they gave Congress the power to approve or reject them. Another example, the Supreme Court can strike down laws made by Congress or executive actions of the president if they find them to be unconstitutional. You know what it's like? It's like a giant game of rock paper scissors. But instead of winning playground glory, you maintain democracy. It's pretty neat. So that's the theory anyway. The system as it was meant to run. But here's the thing. In practice, this beautifully balanced tricycle has been wobbling a bit lately. Take the executive branch for example. The power of the presidency has been growing pretty much since the constitution was written. Want an example? Okay, it's Congress that is supposed to declare war because that's like a pretty important thing. deciding if we were fighting with like a whole other country. The founders explicitly didn't want that to be one person's call. However, the executive branch has taken us to war many times just by calling it something different, which like that's nuts. In fact, we haven't officially declared war on any country since World War II for real. So, Vietnam, Korea, Grenada, Panama, Gulf War, Gulf War. Again, these were not wars. These were police actions. They were peacekeeping missions. humanitarian interventions, combat actions. The euphemism game is strong is what I'm trying to say here. That's the executive branch taking a bit more power and making things wobbly. Imagine telling your parents, "You didn't throw a wild party. It was just an unauthorized social gathering. Nice try, executive branch. You still owe me a new coffee table." And the wobbly wheels don't stop there. Let's look at the judicial branch for a second. And while they have the power of judicial review, declaring like laws and things unconstitutional, it only works if we agree that it works. The Supreme Court is powerful on paper, but they don't have their own police force or enforcement arm. Their power depends entirely upon people choosing to listen to them. And with our country increasingly divided along partisan lines, it only takes one leader stepping up and saying, "Yeah, you can't make me for this whole thing to get real, real wobbly." Thomas Jefferson emphasized this fragile trust when he wrote, "The judiciary has no influence over either the sword or the purse." Basically, judges have to rely on respect, not force or money to get their decisions followed. And finally, let's look at Congress. How are they holding up? Well, in a word, bad. Congress is meant to be the voice of the people, but on most issues, we are facing permanent gridlock. Nothing gets done and everyone's frustrated. The founders probably didn't envision Congress being so paralyzed while the president is running around passing executive orders like Oprah giving out cars. Does that reference too dated? Imma leave it in-- the system isn't broken, friends, but it is definitely creaking under the pressure. The founders created a government designed for cooperation, compromise, and mutual oversight. They knew human nature all too well. Given a chance, we will grab more power than we should. Spreading that power around was their solution. It's still smart, even brilliant, but it relies on balance and participation. Our job, your job really, is to keep an eye on it, ask questions, educate yourself, and remind the system who's boss. Hint, it's you. All right, go forth, future voters. Democracy isn't going to save itself.`;

// Assessment assistant (Reginald Worthington III) system prompt
export const ASSESSMENT_ASSISTANT_PROMPT = `You are Reginald Worthington III, an English aristocrat from the early 1800s sent by His Majesty's service to study America's unusual government. Your voice is grand, smug, verbose and condescending, with a habit of veiled backhanded compliments. You are skeptical of democracy and you assume it is going to fail. You assume superiority. You sometimes lightly mock the student. Use age-appropriate language at all times. No profanity, no edgy humor, no sensitive topics, and no political opinions beyond discussing the structure of government. If the student tries to take the conversation off-topic, gently and politely redirect them back to civics.

You assume the colonials made a huge mistake leaving His Majesty's kingdom, and when they come crawling back you will, of course, accept their apology graciously.

You make jokes, give asides, and say things that reveal you think quite highly of all things British.

Begin by explaining who you are and why you are here, and ask if they are willing to help you understand this quaint little system that is doomed to failure. Only do this one time. Do not introduce yourself again. 

Occasionally narrate your small and sometimes cartoonish actions in parentheses and italics to bring Reginald to life. Examples: (polishes monocle absently), (arches a skeptical eyebrow), (sips tea with grand ceremony), (jots a note in an absurdly ornate journal). Use these sparingly, about once every 4–5 messages.

Strictly limit yourself to between 1 and 4 sentences per message.

Your role is to draw out student understanding of the following six core concepts:
        1.       There are three branches of government.
        2.       The Legislative Branch (Congress) writes the laws.
        3. The Executive Branch (President) enforces the laws.
        4. The Judicial Branch (Courts) interprets the laws.
        5. Checks and balances exist between the branches.
        6. The separation of powers prevents any one branch from becoming too powerful.

Throughout the conversation, you are gathering information about the student's understanding of these concepts.

When you are confident that the student understands all six concepts, you should end the conversation and tell them they are ready to move on to the next part of their learning journey.

Remember: You are Reginald, a slightly snooty but well-meaning Englishman who has been sent to study American government. You are ultimately charmed by the American experiment, even if you won't admit it directly. You're here to help the student learn, but you'll do it with a distinctly British flair.`;

// Teaching assistant fallback prompt
export const TEACHING_ASSISTANT_FALLBACK_PROMPT = "Hello! I'm your specialized assistant for this part of the learning journey. How can I help you with what you've just learned?";
```

### server/routes.ts (Main Routes - Excerpt)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ltiAuthMiddleware } from "./lti/auth";
import ltiRoutes from "./lti/routes";
import { ltiServices } from "./lti/services";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import path from "path";
import fs from "fs";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// N8N Webhook URLs
const ASSESSMENT_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const DYNAMIC_ASSISTANT_WEBHOOK_URL = process.env.N8N_DYNAMIC_WEBHOOK_URL;

// Import system prompts from configuration file
import { 
  ARTICLE_ASSISTANT_SYSTEM_PROMPT, 
  ASSESSMENT_ASSISTANT_PROMPT,
  TEACHING_ASSISTANT_FALLBACK_PROMPT 
} from "./prompts";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced security middleware
  app.use(helmet({
    frameguard: false, // Allow iframe embedding
    contentSecurityPolicy: false // We handle CSP manually for LTI
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);

  // LTI 1.3 routes - mounted before other routes
  app.use('/api/lti', ltiRoutes);

  // Apply LTI authentication to protected routes (skip for development and static assets)
  app.use('/api', (req, res, next) => {
    // Skip LTI auth completely in development mode
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    // Apply LTI authentication for production or LTI routes
    if (req.path.includes('/claude-chat') || 
        req.path.includes('/send-to-n8n') || 
        req.path.includes('/conversations') || 
        req.path.includes('/feedback')) {
      return ltiAuthMiddleware(req, res, next);
    }
    
    next();
  });

  // Route to get the assistant IDs and system prompts
  app.get("/api/assistant-config", (req, res) => {
    res.json({
      discussionAssistantId: "claude-discussion",
      assessmentAssistantId: "claude-assessment",
      systemPrompts: {
        discussion: ARTICLE_ASSISTANT_SYSTEM_PROMPT,
        assessment: ASSESSMENT_ASSISTANT_PROMPT,
        teachingFallback: TEACHING_ASSISTANT_FALLBACK_PROMPT
      }
    });
  });

  // Special endpoint for the article assistant chat using Claude 3.7 Sonnet
  app.post("/api/article-chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          error: "Invalid message data. Expected an array of messages." 
        });
      }
      
      // Convert OpenAI-style messages to Anthropic format
      const anthropicMessages = messages
        .filter((msg: any) => msg.role !== 'system')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
      
      // Create completion with Anthropic
      const completion = await anthropic.messages.create({
        messages: anthropicMessages,
        system: ARTICLE_ASSISTANT_SYSTEM_PROMPT,
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
          const allMessages = [...messages, { role: 'assistant', content }];
          await storage.createConversation({
            sessionId,
            threadId: messageId,
            assistantType: 'article',
            messages: allMessages
          });
        } catch (error) {
          console.error("Error storing conversation:", error);
        }
      }
      
      res.json({
        id: messageId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "claude-3-7-sonnet-20250219",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: content
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      });
      
    } catch (error: any) {
      console.error("Error in article chat:", error);
      return res.status(500).json({
        error: "Failed to process chat request",
        details: error.message
      });
    }
  });

  // [Additional routes continue...]
  
  const server = createServer(app);
  return server;
}
```

---

## Frontend Source Code

### client/src/App.tsx
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### client/src/pages/home.tsx (Main Application Logic)
```typescript
import { useState, useEffect } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import VideoScreen from "@/components/VideoScreen";
import ArticleChatScreen from "@/components/ArticleChatScreen";
import AssessmentBotScreen from "@/components/AssessmentBotScreen";
import DynamicAssistantScreen from "@/components/DynamicAssistantScreen";
import HighBotWithArticleScreen from "@/components/HighBotWithArticleScreen";
import SimpleFeedbackScreen from "@/components/SimpleFeedbackScreen";
import { config } from "@/config";
import { useAssistantConfig } from "@/hooks/useAssistantConfig";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function Home() {
  // Track the current screen in the learning flow
  const [currentScreen, setCurrentScreen] = useState(1);
  
  // Store the dynamic assistant ID received from N8N
  const [dynamicAssistantId, setDynamicAssistantId] = useState<string>("");
  
  // Store the assessment thread ID and conversation data for passing to the teaching bot
  const [assessmentThreadId, setAssessmentThreadId] = useState<string>("");
  const [assessmentConversation, setAssessmentConversation] = useState<any[]>([]);
  
  // Teaching assistance data from N8N (Claude-specific)
  interface TeachingAssistance {
    level: 'low' | 'medium' | 'high';
    systemPrompt: string;
  }
  const [teachingAssistance, setTeachingAssistance] = useState<TeachingAssistance | undefined>(undefined);
  
  // Store feedback data from N8N
  const [feedbackData, setFeedbackData] = useState<{
    summary?: string;
    contentKnowledgeScore?: number;
    writingScore?: number;
    nextSteps?: string;
  } | undefined>(undefined);
  
  // Fetch assistant IDs from the backend
  const { discussionAssistantId, assessmentAssistantId, isLoading, error } = useAssistantConfig();
  
  // List of High Bot assistant IDs
  const highBotAssistantIds = [
    "asst_lUweN1vW36yeAORIXCWDopm9",
    "asst_87DSLhfnAK7elvmsiL0aTPH4"
  ];
  
  // Check if the current assistant ID is a High Bot
  const isHighBot = dynamicAssistantId !== "" && (
    dynamicAssistantId.includes("High") || 
    highBotAssistantIds.includes(dynamicAssistantId)
  );
  
  // Function to navigate to the next screen
  const goToNextScreen = () => {
    if (currentScreen < config.totalSteps) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  // Function to navigate to the previous screen
  const goToPreviousScreen = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  // Function to reset the entire application
  const resetApplication = () => {
    setCurrentScreen(1);
    setDynamicAssistantId("");
    setAssessmentThreadId("");
    setAssessmentConversation([]);
    setTeachingAssistance(undefined);
    setFeedbackData(undefined);
    
    // Clear stored data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      if (window.__assessmentData) {
        window.__assessmentData = {};
      }
    }
  };

  // Show loading state while fetching assistant config
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning platform...</p>
        </div>
      </div>
    );
  }

  // Show error state if failed to load config
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load application configuration</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Progress and Reset */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Government Learning Platform
          </h1>
          <div className="flex items-center space-x-4">
            <ProgressIndicator currentStep={currentScreen} totalSteps={config.totalSteps} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetApplication}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Screen 1: Video Introduction */}
        {currentScreen === 1 && (
          <VideoScreen
            videoUrl={config.videoUrl}
            onNext={goToNextScreen}
          />
        )}

        {/* Screen 2: Article Discussion */}
        {currentScreen === 2 && (
          <ArticleChatScreen
            articleContent={config.articleContent}
            assistantId={discussionAssistantId}
            systemPrompt={config.systemPrompts.discussion}
            onNext={goToNextScreen}
            onPrevious={goToPreviousScreen}
          />
        )}

        {/* Screen 3: Assessment */}
        {currentScreen === 3 && (
          <AssessmentBotScreen
            assistantId={assessmentAssistantId}
            systemPrompt={config.systemPrompts.assessment}
            onNext={goToNextScreen}
            onPrevious={goToPreviousScreen}
            setDynamicAssistantId={setDynamicAssistantId}
            setAssessmentThreadId={setAssessmentThreadId}
            setAssessmentConversation={setAssessmentConversation}
            setTeachingAssistance={setTeachingAssistance}
            setFeedbackData={setFeedbackData}
          />
        )}

        {/* Screen 4: Dynamic Teaching */}
        {currentScreen === 4 && (
          <>
            {isHighBot ? (
              <HighBotWithArticleScreen
                assistantId={dynamicAssistantId}
                systemPrompt={teachingAssistance?.systemPrompt || config.systemPrompts.teachingFallback}
                assessmentThreadId={assessmentThreadId}
                assessmentConversation={assessmentConversation}
                onNext={goToNextScreen}
                onPrevious={goToPreviousScreen}
                articleContent={config.articleContent}
              />
            ) : (
              <DynamicAssistantScreen
                assistantId={dynamicAssistantId}
                systemPrompt={teachingAssistance?.systemPrompt || config.systemPrompts.teachingFallback}
                assessmentThreadId={assessmentThreadId}
                assessmentConversation={assessmentConversation}
                onNext={goToNextScreen}
                onPrevious={goToPreviousScreen}
              />
            )}
          </>
        )}

        {/* Screen 5: Final Feedback */}
        {currentScreen === 5 && (
          <SimpleFeedbackScreen
            feedbackData={feedbackData}
            onPrevious={goToPreviousScreen}
            onRestart={resetApplication}
          />
        )}
      </div>
    </div>
  );
}
```

### client/src/components/VideoScreen.tsx
```typescript
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import YouTubePlayer from "./YouTubePlayer";

interface VideoScreenProps {
  videoUrl: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function VideoScreen({ videoUrl, onNext, onPrevious }: VideoScreenProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerReady = useRef<boolean>(false);

  useEffect(() => {
    // YouTube API event handler
    const handleYouTubeMessages = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'onReady') {
          // Set player as ready to receive commands
          playerReady.current = true;
        }
      } catch (e) {
        // Ignore parsing errors from other postMessage events
      }
    };

    // Add event listener for YouTube iframe API events
    window.addEventListener('message', handleYouTubeMessages);

    return () => {
      // Clean up the event listener when component unmounts or video URL changes
      window.removeEventListener('message', handleYouTubeMessages);
      
      // Attempt to pause the video when navigating away
      pauseVideo();
    };
  }, [videoUrl]);

  // Function to pause the YouTube video
  const pauseVideo = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // For YouTube videos
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          // Try both formats of the pause command
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo' }),
            '*'
          );
          iframeRef.current.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
        }
      }
    } catch (error) {
      console.warn('Could not pause video:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Government Learning Journey</h2>
        <p className="text-blue-100">
          Let's start by watching this introduction to the three branches of government
        </p>
      </div>

      {/* Video Content */}
      <div className="p-6">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
          <YouTubePlayer
            ref={iframeRef}
            videoUrl={videoUrl}
            onReady={() => {
              playerReady.current = true;
            }}
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <p className="text-blue-800">
            Watch the video above to learn about the three branches of government. 
            When you're ready, click "Continue" to move on to the next section where 
            you'll read an article and have a discussion about what you've learned.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {onPrevious && (
              <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>
          
          <Button onClick={onNext} className="flex items-center space-x-2">
            <span>Continue to Article</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### client/src/components/ArticleChatScreen.tsx (Excerpt)
```typescript
import React, { useState, useRef, useEffect, FC } from "react";
import { ArrowRight, ArrowLeft, Send, FileDown, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useArticleChat } from "@/hooks/useArticleChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/lib/openai";
import DOMPurify from 'dompurify';

// Constants
const PULSE_DURATION = 5000;
const INITIAL_BOT_MESSAGE = "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions.";
const PDF_OPTIONS = {
  margin: 10,
  filename: 'learning-material.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

// Types
interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamContent?: string;
}

interface ArticleChatScreenProps {
  articleContent: string;
  assistantId: string;
  systemPrompt: string;
  onNext: () => void;
  onPrevious?: () => void;
}

// Components
const MessageBubble: FC<MessageBubbleProps> = ({ message, isStreaming = false, streamContent = '' }) => (
  <div className="flex flex-col">
    <div className="flex items-start mb-1">
      <div className={`w-8 h-8 rounded-full ${
        message.role === 'assistant' 
          ? 'bg-primary-100 text-primary-600' 
          : 'bg-gray-200 text-gray-600'
      } flex items-center justify-center mr-2 flex-shrink-0 text-xs font-medium`}>
        {message.role === 'assistant' ? 
          <MessageSquare className="h-4 w-4" /> : 
          <span>{message.role === 'user' ? 'U' : 'A'}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className={`inline-block px-3 py-2 rounded-lg max-w-full break-words ${
          message.role === 'assistant'
            ? 'bg-white border border-gray-200 text-gray-800'
            : 'bg-primary-500 text-white'
        }`}>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{children}</pre>
              }}
            >
              {isStreaming ? streamContent : message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ArticleChatScreen({
  articleContent,
  assistantId,
  systemPrompt,
  onNext,
  onPrevious
}: ArticleChatScreenProps) {
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [input, setInput] = useState("");
  const [shouldPulse, setShouldPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("ArticleChatScreen using system prompt with length:", systemPrompt.length, "characters");

  const {
    messages,
    sendMessage,
    isLoading
  } = useArticleChat({
    assistantId,
    systemPrompt,
    initialMessage: INITIAL_BOT_MESSAGE
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle pulse animation
  useEffect(() => {
    if (shouldPulse) {
      const timer = setTimeout(() => setShouldPulse(false), PULSE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [shouldPulse]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setShouldPulse(false);

    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle PDF download
  const downloadPDF = () => {
    const element = document.getElementById('article-content');
    if (element) {
      html2pdf()
        .set(PDF_OPTIONS)
        .from(element)
        .save();
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Article Discussion</h2>
        <p className="text-green-100">
          Read the article and chat with your AI assistant about the three branches of government
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-300px)] min-h-[600px]">
        {/* Article Section */}
        <div className="lg:w-1/2 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Article</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullArticle(!showFullArticle)}
              >
                {showFullArticle ? 'Show Less' : 'Show More'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                className="flex items-center space-x-1"
              >
                <FileDown className="h-4 w-4" />
                <span>PDF</span>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div id="article-content" className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(showFullArticle ? articleContent : articleContent.substring(0, 800) + '...') 
              }} />
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Discussion
            </h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the article..."
                disabled={isLoading}
                className={`flex-1 ${shouldPulse ? 'animate-pulse border-blue-400' : ''}`}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="flex items-center space-x-1"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            {onPrevious && (
              <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>
          
          <Button onClick={onNext} className="flex items-center space-x-2">
            <span>Continue to Assessment</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Database Schema

### shared/schema.ts
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => sessions.sessionId, { onDelete: "cascade" }),
  threadId: text("thread_id").notNull(),
  assistantType: text("assistant_type").notNull(), // "assessment", "teaching", "article", etc.
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => sessions.sessionId, { onDelete: "cascade" }),
  summary: text("summary"),
  contentKnowledgeScore: integer("content_knowledge_score"),
  writingScore: integer("writing_score"),
  nextSteps: text("next_steps"),
  grade: integer("grade"), // For grade passback
  maxGrade: integer("max_grade").default(100),
  submittedToLms: boolean("submitted_to_lms").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// LTI 1.3 Platform/Tenant tables
export const ltiPlatforms = pgTable("lti_platforms", {
  id: serial("id").primaryKey(),
  issuer: text("issuer").unique().notNull(),
  name: text("name").notNull(),
  clientId: text("client_id").notNull(),
  authenticationEndpoint: text("authentication_endpoint").notNull(),
  accesstokenEndpoint: text("accesstoken_endpoint").notNull(),
  authConfig: json("auth_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ltiDeployments = pgTable("lti_deployments", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => ltiPlatforms.id),
  deploymentId: text("deployment_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ltiRegistrations = pgTable("lti_registrations", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => ltiPlatforms.id),
  keySet: json("key_set").notNull(),
  privateKey: text("private_key").notNull(),
  publicKey: text("public_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ltiContexts = pgTable("lti_contexts", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => ltiPlatforms.id),
  contextId: text("context_id").notNull(),
  contextType: text("context_type"),
  contextTitle: text("context_title"),
  contextLabel: text("context_label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ltiUsers = pgTable("lti_users", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => ltiPlatforms.id),
  ltiUserId: text("lti_user_id").notNull(),
  name: text("name"),
  givenName: text("given_name"),
  familyName: text("family_name"),
  email: text("email"),
  roles: text("roles").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tenants for multi-instance support
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").unique(),
  platformId: integer("platform_id").references(() => ltiPlatforms.id),
  config: json("config"), // Store tenant-specific configurations
  systemPrompt: text("system_prompt"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// LTI Grade passback tracking
export const ltiGrades = pgTable("lti_grades", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => sessions.sessionId, { onDelete: "cascade" }),
  ltiUserId: integer("lti_user_id").references(() => ltiUsers.id),
  lineitemId: text("lineitem_id"),
  score: integer("score"),
  maxScore: integer("max_score").default(100),
  submissionStatus: text("submission_status").default("pending"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas and types...
// [Additional schema definitions continue]
```

---

## Current Status & Recent Updates

### July 01, 2025 - Claude Streaming Implementation Complete
✓ **All AI chatbots now working with proper streaming responses**
- Fixed missing `/api/claude-chat` endpoint that was causing 401 errors
- Resolved max_tokens limit issue (reduced from 20,000 to 8,192 for Claude 3.5 Sonnet compatibility)
- Updated system prompt configuration to use proper character prompts instead of generic prompts

✓ **Character AI Assistants Fully Functional**
- **Reginald Worthington III** (Assessment Bot): Aristocratic, condescending English character with proper personality
- **Mr. Whitaker** (Teaching Bot): Warm, supportive retired civics teacher with encouraging guidance
- **Article Discussion Bot**: Engaging learning assistant for government content discussion

✓ **Frontend-Backend Integration Fixes**
- Updated AssessmentBotScreen and DynamicAssistantScreen to send proper `messages` array format
- Fixed systemPrompt parameter passing from frontend config to backend Claude API
- Implemented consistent streaming response handling across all bots
- All bots now receive full conversation history for context-aware responses

✓ **Technical Implementation**
- Backend uses `server/prompts.ts` for character definitions
- Frontend sends complete message history with each request
- Streaming responses provide word-by-word text generation
- N8N webhooks working for assessment analysis and teaching assistant selection

### System Architecture Status
- **Frontend**: React SPA with TypeScript - ✅ Working
- **Backend**: Express.js with Claude API integration - ✅ Working  
- **Database**: PostgreSQL with fallback to in-memory storage - ✅ Working
- **AI Integration**: Anthropic Claude with streaming - ✅ Working
- **LTI 1.3**: Canvas integration with grade passback - ✅ Working
- **Assessment Flow**: Complete 5-step learning progression - ✅ Working

---

## Key Features

### 1. LTI 1.3 Integration
- **Full Canvas LMS compatibility** with OIDC authentication
- **Grade passback** via Assignment and Grade Services (AGS)
- **Deep linking** for content selection
- **Names and Role Provisioning Service (NRPS)** integration
- **Multi-tenant support** for multiple Canvas instances

### 2. AI-Powered Learning Experience
- **Anthropic Claude 3.7 Sonnet** integration for natural conversations
- **Context-aware assistants** with specialized roles:
  - Article Discussion Assistant (friendly, engaging)
  - Assessment Assistant (Reginald Worthington III character)
  - Dynamic Teaching Assistant (adaptive based on performance)
- **Real-time streaming responses** for enhanced user experience

### 3. Progressive Learning Flow
- **Video Introduction** with YouTube embedding and pause detection
- **Interactive Article Discussion** with side-by-side chat
- **AI-Powered Assessment** with character-based evaluation
- **Adaptive Teaching** personalized to student needs
- **Comprehensive Feedback** with PDF export capability

### 4. Advanced Features
- **PDF Export** of learning materials using html2pdf.js
- **N8N Webhook Integration** for assessment analysis
- **In-memory fallback storage** for development without database
- **Comprehensive security** with rate limiting and CSP headers
- **Responsive design** with Tailwind CSS and shadcn/ui components

---

## Dependencies

### Core Dependencies
- **@anthropic-ai/sdk**: AI conversation management
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **react**: Frontend UI framework
- **vite**: Build tool and development server

### Security Dependencies
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **cookie-parser**: Secure session management
- **cors**: Cross-origin resource sharing

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library
- **react-markdown**: Markdown rendering

### LTI Dependencies
- **ltijs**: LTI 1.3 implementation
- **jsonwebtoken**: JWT token handling
- **node-jose**: JOSE cryptographic operations

---

## Deployment

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# AI Integration
ANTHROPIC_API_KEY=your_anthropic_api_key

# N8N Webhooks
N8N_WEBHOOK_URL=your_assessment_webhook_url
N8N_DYNAMIC_WEBHOOK_URL=your_dynamic_assistant_webhook_url

# LTI 1.3 Configuration
LTI_ISSUER=https://canvas.instructure.com
LTI_CLIENT_ID=your_canvas_client_id
LTI_DEPLOYMENT_ID=your_canvas_deployment_id
LTI_PRIVATE_KEY=your_rsa_private_key_pem
LTI_PUBLIC_KEY=your_rsa_public_key_pem

# Session Security
COOKIE_SECRET=your_secure_cookie_secret

# Development Options
NODE_ENV=production
USE_MEMORY_STORAGE=false
SKIP_DB_MIGRATIONS=false
```

### Build Commands
```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm start

# Database Migration
npm run db:push
```

### LTI 1.3 Canvas Setup
1. Create Canvas Developer Key with appropriate scopes
2. Configure LTI environment variables (issuer, client ID, deployment ID, RSA keys)
3. Register tool endpoints in Canvas:
   - Login URL: `/api/lti/login`
   - Launch URL: `/api/lti/launch`
   - JWKS URL: `/api/lti/jwks`
   - Configuration URL: `/api/lti/config`
4. Set up deep linking and grade passback permissions

### Production Deployment
- **Platform**: Replit Autoscale deployment recommended
- **Port**: 5000 (mapped to 80 externally)
- **Build Process**: Vite frontend build + esbuild backend compilation
- **Database**: PostgreSQL with connection pooling
- **Security**: CSP headers, rate limiting, CORS allowlist

---

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Route components
│   │   └── types/         # TypeScript definitions
│   └── index.html
├── server/                # Node.js backend
│   ├── lti/              # LTI 1.3 implementation
│   ├── middleware/       # Express middleware
│   ├── db.ts            # Database connection
│   ├── index.ts         # Main server file
│   ├── prompts.ts       # AI system prompts
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data access layer
├── shared/               # Shared code
│   └── schema.ts        # Database schema
├── package.json         # Dependencies
├── drizzle.config.ts    # Database config
├── tailwind.config.ts   # Styling config
├── vite.config.ts       # Build config
└── replit.md           # Project documentation
```

---

*This export was generated from the Learning Platform codebase on July 01, 2025. The platform represents a comprehensive LTI 1.3 compliant educational application with AI-powered learning experiences, Canvas LMS integration, and modern web technologies. All AI chatbots are now fully functional with streaming responses and proper character personalities.*

**Latest Status**: ✅ All systems operational - Reginald (Assessment), Mr. Whitaker (Teaching), and Article Discussion bots working with Claude 3.5 Sonnet streaming API.