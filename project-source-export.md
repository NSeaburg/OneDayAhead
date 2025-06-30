# Learning Platform - Complete Source Code Export

Generated: 2025-12-30

## Project Overview

This is an LTI 1.3 compliant learning platform with AI-powered conversations and Canvas integration. The platform provides interactive learning experiences about U.S. government branches with assessment and grade passback capabilities.

**Tech Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: AWS RDS PostgreSQL with Drizzle ORM
- AI: Anthropic Claude API
- LTI 1.3: Full Canvas integration with grade passback
- Deployment: Docker-ready with AWS infrastructure

---

## Database Schema (shared/schema.ts)

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
```

---

## AWS RDS Database Connection (server/db.ts)

```typescript
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool for AWS RDS PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // AWS RDS requires SSL
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Initialize Drizzle with node-postgres adapter
export const db = drizzle(pool, { schema });
```

---

## Storage Interface (server/storage.ts)

```typescript
import { db } from "./db.ts";
import { users, sessions, conversations, feedbacks, ltiPlatforms, ltiDeployments, ltiRegistrations, ltiContexts, ltiUsers, tenants, ltiGrades } from "../shared/schema.ts";
import type { User, InsertUser, Session, InsertSession, Conversation, InsertConversation, Feedback, InsertFeedback, LtiPlatform, InsertLtiPlatform, LtiDeployment, InsertLtiDeployment, LtiRegistration, InsertLtiRegistration, LtiContext, InsertLtiContext, LtiUser, InsertLtiUser, Tenant, InsertTenant, LtiGrade, InsertLtiGrade } from "../shared/schema.ts";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session methods
  createSession(userId: number): Promise<Session>;
  getSessionById(sessionId: string): Promise<Session | undefined>;
  validateSession(sessionId: string): Promise<boolean>;
  
  // Conversation methods
  createConversation(data: InsertConversation): Promise<Conversation>;
  getConversationByThreadId(threadId: string): Promise<Conversation | undefined>;
  getConversationsBySession(sessionId: string): Promise<Conversation[]>;
  updateConversation(threadId: string, messages: any[]): Promise<Conversation | undefined>;
  
  // Feedback methods
  createFeedback(data: InsertFeedback): Promise<Feedback>;
  getFeedbackBySession(sessionId: string): Promise<Feedback | undefined>;

  // LTI Platform methods
  getLtiPlatformByIssuer(issuer: string): Promise<LtiPlatform | undefined>;
  createLtiPlatform(data: InsertLtiPlatform): Promise<LtiPlatform>;
  
  // LTI Deployment methods
  createLtiDeployment(data: InsertLtiDeployment): Promise<LtiDeployment>;
  getLtiDeployment(platformId: number, deploymentId: string): Promise<LtiDeployment | undefined>;
  
  // LTI Registration methods
  createLtiRegistration(data: InsertLtiRegistration): Promise<LtiRegistration>;
  getLtiRegistrationByPlatform(platformId: number): Promise<LtiRegistration | undefined>;
  
  // LTI Context methods
  getLtiContextByContextId(platformId: number, contextId: string): Promise<LtiContext | undefined>;
  createLtiContext(data: InsertLtiContext): Promise<LtiContext>;
  
  // LTI User methods
  getLtiUserByUserId(platformId: number, ltiUserId: string): Promise<LtiUser | undefined>;
  createLtiUser(data: InsertLtiUser): Promise<LtiUser>;
  
  // Tenant methods
  getTenantByPlatform(platformId: number): Promise<Tenant | undefined>;
  createTenant(data: InsertTenant): Promise<Tenant>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  
  // LTI Grade methods
  createLtiGrade(data: InsertLtiGrade): Promise<LtiGrade>;
  getLtiGradesByUser(ltiUserId: number): Promise<LtiGrade[]>;
  updateLtiGradeSubmission(id: number, status: string): Promise<LtiGrade | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Session methods
  async createSession(userId: number): Promise<Session> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const result = await db.insert(sessions).values({
      userId,
      sessionId,
      expiresAt,
    }).returning();
    
    return result[0];
  }

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
    return result[0];
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.getSessionById(sessionId);
    return session ? session.expiresAt > new Date() : false;
  }

  // Conversation methods
  async createConversation(data: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(data).returning();
    return result[0];
  }

  async getConversationByThreadId(threadId: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.threadId, threadId)).limit(1);
    return result[0];
  }

  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.sessionId, sessionId));
  }

  async updateConversation(threadId: string, messages: any[]): Promise<Conversation | undefined> {
    const result = await db.update(conversations)
      .set({ messages, updatedAt: new Date() })
      .where(eq(conversations.threadId, threadId))
      .returning();
    return result[0];
  }

  // Feedback methods
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const result = await db.insert(feedbacks).values(data).returning();
    return result[0];
  }

  async getFeedbackBySession(sessionId: string): Promise<Feedback | undefined> {
    const result = await db.select().from(feedbacks).where(eq(feedbacks.sessionId, sessionId)).limit(1);
    return result[0];
  }

  // LTI Platform methods
  async getLtiPlatformByIssuer(issuer: string): Promise<LtiPlatform | undefined> {
    const result = await db.select().from(ltiPlatforms).where(eq(ltiPlatforms.issuer, issuer)).limit(1);
    return result[0];
  }

  async createLtiPlatform(data: InsertLtiPlatform): Promise<LtiPlatform> {
    const result = await db.insert(ltiPlatforms).values(data).returning();
    return result[0];
  }

  // Additional LTI methods (truncated for brevity)
  // ... all other LTI CRUD operations follow similar patterns
}

export const storage = new DatabaseStorage();
```

---

## LTI 1.3 Configuration (server/lti/config.ts)

```typescript
import { generateKeyPair } from 'crypto';
import { promisify } from 'util';
import * as jose from 'node-jose';

const generateKeyPairAsync = promisify(generateKeyPair);

export interface LtiConfig {
  issuer: string;
  clientId: string;
  deploymentId: string;
  privateKey: string;
  publicKey: string;
  keySetUrl: string;
  loginUrl: string;
  launchUrl: string;
  jwksUrl: string;
  deepLinkingUrl: string;
}

export class LtiKeyManager {
  private static instance: LtiKeyManager;
  private keyStore: jose.JWK.KeyStore;
  private initialized = false;

  private constructor() {
    this.keyStore = jose.JWK.createKeyStore();
  }

  static getInstance(): LtiKeyManager {
    if (!LtiKeyManager.instance) {
      LtiKeyManager.instance = new LtiKeyManager();
    }
    return LtiKeyManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Generate or load existing key pair
    const { publicKey, privateKey } = await this.generateOrLoadKeyPair();
    
    // Add key to store
    await this.keyStore.add(privateKey, 'pem');
    this.initialized = true;
  }

  private async generateOrLoadKeyPair() {
    // In production, load from environment variables or secure storage
    const existingPrivateKey = process.env.LTI_PRIVATE_KEY;
    const existingPublicKey = process.env.LTI_PUBLIC_KEY;

    if (existingPrivateKey && existingPublicKey) {
      return {
        privateKey: existingPrivateKey,
        publicKey: existingPublicKey
      };
    }

    // Generate new key pair if none exists
    const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    console.log('Generated new RSA key pair for LTI 1.3');
    return { publicKey, privateKey };
  }

  async getPublicKeySet(): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.keyStore.toJSON();
  }

  async getPrivateKey(): Promise<jose.JWK.Key> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.keyStore.all()[0];
  }
}

export function getLtiConfig(): LtiConfig {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : 'http://localhost:5000';

  return {
    issuer: process.env.LTI_ISSUER || 'https://canvas.instructure.com',
    clientId: process.env.LTI_CLIENT_ID || '',
    deploymentId: process.env.LTI_DEPLOYMENT_ID || '',
    privateKey: process.env.LTI_PRIVATE_KEY || '',
    publicKey: process.env.LTI_PUBLIC_KEY || '',
    keySetUrl: `${baseUrl}/api/lti/jwks`,
    loginUrl: `${baseUrl}/api/lti/login`,
    launchUrl: `${baseUrl}/api/lti/launch`,
    jwksUrl: `${baseUrl}/api/lti/jwks`,
    deepLinkingUrl: `${baseUrl}/api/lti/deep-linking`,
  };
}

export function validateLtiConfig(): boolean {
  const config = getLtiConfig();
  const required = ['issuer', 'clientId'];
  
  return required.every(key => config[key as keyof LtiConfig]);
}
```

---

## Main Server (server/index.ts)

```typescript
import express from "express";
import { setupVite, serveStatic, log } from "./vite.ts";
import { registerRoutes } from "./routes.ts";
import { runMigrations } from "./migrations.ts";
import { pool } from "./db.ts";

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test database connection with detailed logging
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

// Main application startup with enhanced error handling
(async () => {
  try {
    const skipDb = process.env.SKIP_DB_MIGRATIONS === "true";

    if (skipDb) {
      console.log("⚠️  Skipping DB migrations (CI smoke-test)");
    } else {
      // Test connection first
      const connectionSuccess = await testDatabaseConnection();
      if (!connectionSuccess) {
        console.error("💥 Cannot connect to database. Exiting...");
        process.exit(1);
      }

      console.log("🔄 Running database migrations...");
      await runMigrations();
      console.log("✅ Migrations completed successfully");
    }

    // Skip session store when DB is skipped
    if (skipDb) {
      console.log("⚠️  Skipping session store (CI smoke-test)");
    } else {
      app.use(sessionMiddleware);
    }

    const server = await registerRoutes(app);

    // Health check endpoint
    app.get("/health", (_req, res) => res.status(200).send("OK"));

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message || "Error" });
      throw err;
    });

    // Development vs production serving
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

---

## Frontend App (client/src/App.tsx)

```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import LearningModulePage from "@/pages/LearningModulePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LearningModulePage} />
      <Route path="/dev" component={LearningModulePage} />
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
```

---

## AWS Infrastructure Configuration

### Database Infrastructure
- **Type**: Amazon RDS PostgreSQL
- **Instance**: oda-prod.c364ukis8hf2.us-east-2.rds.amazonaws.com:5432
- **Network**: Multi-AZ VPC deployment (us-east-2a, 2b, 2c)
- **Security**: SSL required, private VPC access only
- **Connection**: Standard PostgreSQL with connection pooling

### Environment Variables Required

```bash
# AWS RDS Database
DATABASE_URL=postgresql://postgres:PASSWORD@oda-prod.c364ukis8hf2.us-east-2.rds.amazonaws.com:5432/postgres?sslmode=require

# AI Integration
ANTHROPIC_API_KEY=your_anthropic_api_key

# LTI 1.3 Canvas Integration
LTI_ISSUER=https://yourschool.instructure.com
LTI_CLIENT_ID=your_canvas_client_id
LTI_DEPLOYMENT_ID=your_deployment_id
LTI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----"
LTI_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----"

# Webhooks (optional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/Assessment-Finish
N8N_DYNAMIC_WEBHOOK_URL=https://your-n8n-instance.com/webhook/Feedback-Flow
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

---

## Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build
RUN npm ci --only=production && npm cache clean --force
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

---

## Drizzle Configuration

```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

---

## Key Features

1. **LTI 1.3 Integration**: Full Canvas LMS support with authentication, grade passback, and deep linking
2. **AI Assistants**: Multiple Claude-powered assistants for different learning phases
3. **AWS RDS Integration**: Production-ready PostgreSQL with SSL and connection pooling
4. **Multi-Tenant**: Support for multiple Canvas instances with separate configurations
5. **Session Management**: Secure session-based user tracking with automatic cleanup
6. **Grade Passback**: Automatic submission of assessment scores to Canvas gradebook
7. **Real-time Conversations**: Streaming AI responses for interactive learning
8. **Assessment System**: Comprehensive feedback with content and writing scores
9. **Docker Ready**: Containerized deployment for AWS ECS/Fargate
10. **Production Optimized**: SSL connections, connection pooling, error handling
11. **Enhanced Database Testing**: Connection validation with detailed logging and graceful failure handling
12. **CI/CD Support**: SKIP_DB_MIGRATIONS flag for smoke testing and deployment verification
13. **Health Check Endpoint**: /health endpoint for load balancer and monitoring integration

## Data Export Capabilities

- **PDF Export**: Users can download learning results with transcripts and scores
- **Database Storage**: All learning data stored in AWS RDS PostgreSQL
- **Grade Passback**: Automatic Canvas gradebook integration
- **No Google Sheets Integration**: Currently not configured for spreadsheet export

## Deployment Architecture

The application is designed for AWS deployment with:
- **Frontend**: React SPA served via CDN or static hosting
- **Backend**: Node.js API deployed on ECS/Fargate or Lambda
- **Database**: AWS RDS PostgreSQL in private VPC
- **Security**: VPC networking with security groups (ODA-SG, ODA-RDS)
- **SSL**: Required connections throughout the infrastructure

This platform provides a complete LTI 1.3 compliant learning experience with AI-powered interactions, AWS-grade infrastructure, and seamless Canvas integration.