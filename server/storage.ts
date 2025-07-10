import { 
  users, sessions, conversations, feedbacks,
  ltiPlatforms, ltiDeployments, ltiRegistrations, ltiContexts, ltiUsers, tenants, ltiGrades, ltiAssignmentConfigs,
  type User, type InsertUser, 
  type Session, type InsertSession,
  type Conversation, type InsertConversation,
  type Feedback, type InsertFeedback,
  type LtiPlatform, type InsertLtiPlatform,
  type LtiDeployment, type InsertLtiDeployment,
  type LtiRegistration, type InsertLtiRegistration,
  type LtiContext, type InsertLtiContext,
  type LtiUser, type InsertLtiUser,
  type Tenant, type InsertTenant,
  type LtiGrade, type InsertLtiGrade,
  type LtiAssignmentConfig, type InsertLtiAssignmentConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for development without database
class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private feedbacks: Map<string, Feedback> = new Map();
  private userIdCounter = 1;
  private conversationIdCounter = 1;
  private feedbackIdCounter = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: userData.username,
      password: userData.password,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async createSession(userId: number): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      userId,
      createdAt: new Date()
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async validateSession(sessionId: string): Promise<boolean> {
    return this.sessions.has(sessionId);
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.conversationIdCounter++,
      sessionId: data.sessionId || null,
      threadId: data.threadId,
      assistantType: data.assistantType,
      messages: data.messages,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(data.threadId, conversation);
    return conversation;
  }

  async getConversationByThreadId(threadId: string): Promise<Conversation | undefined> {
    return this.conversations.get(threadId);
  }

  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.sessionId === sessionId);
  }

  async updateConversation(threadId: string, messages: any[]): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(threadId);
    if (conversation) {
      conversation.messages = messages;
      conversation.updatedAt = new Date();
      this.conversations.set(threadId, conversation);
    }
    return conversation;
  }

  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      id: this.feedbackIdCounter++,
      sessionId: data.sessionId || null,
      summary: data.summary || null,
      contentKnowledgeScore: data.contentKnowledgeScore || null,
      writingScore: data.writingScore || null,
      nextSteps: data.nextSteps || null,
      grade: data.grade || null,
      maxGrade: data.maxGrade || null,
      submittedToLms: data.submittedToLms || null,
      createdAt: new Date()
    };
    this.feedbacks.set(data.sessionId || '', feedback);
    return feedback;
  }

  async getFeedbackBySession(sessionId: string): Promise<Feedback | undefined> {
    return this.feedbacks.get(sessionId);
  }

  // LTI methods - simplified for development (return minimal valid objects)
  async getLtiPlatformByIssuer(): Promise<LtiPlatform | undefined> { return undefined; }
  async createLtiPlatform(data: InsertLtiPlatform): Promise<LtiPlatform> { 
    return { 
      id: 1, 
      name: data.name,
      issuer: data.issuer,
      clientId: data.clientId,
      authenticationEndpoint: data.authenticationEndpoint,
      accesstokenEndpoint: data.accesstokenEndpoint,
      authConfig: data.authConfig,
      createdAt: new Date() 
    };
  }
  async createLtiDeployment(data: InsertLtiDeployment): Promise<LtiDeployment> {
    return { 
      id: 1,
      platformId: data.platformId,
      deploymentId: data.deploymentId,
      createdAt: new Date() 
    };
  }
  async getLtiDeployment(): Promise<LtiDeployment | undefined> { return undefined; }
  async createLtiRegistration(data: InsertLtiRegistration): Promise<LtiRegistration> {
    return { 
      id: 1,
      platformId: data.platformId,
      keySet: data.keySet,
      privateKey: data.privateKey,
      publicKey: data.publicKey,
      createdAt: new Date() 
    };
  }
  async getLtiRegistrationByPlatform(): Promise<LtiRegistration | undefined> { return undefined; }
  async getLtiContextByContextId(): Promise<LtiContext | undefined> { return undefined; }
  async createLtiContext(data: InsertLtiContext): Promise<LtiContext> {
    return { 
      id: 1,
      platformId: data.platformId,
      contextId: data.contextId,
      contextType: data.contextType,
      contextTitle: data.contextTitle,
      contextLabel: data.contextLabel,
      createdAt: new Date() 
    };
  }
  async getLtiUserByUserId(): Promise<LtiUser | undefined> { return undefined; }
  async createLtiUser(data: InsertLtiUser): Promise<LtiUser> {
    return { 
      id: 1,
      name: data.name,
      platformId: data.platformId,
      ltiUserId: data.ltiUserId,
      givenName: data.givenName,
      familyName: data.familyName,
      email: data.email,
      roles: data.roles,
      createdAt: new Date() 
    };
  }
  async getTenantByPlatform(): Promise<Tenant | undefined> { return undefined; }
  async createTenant(data: InsertTenant): Promise<Tenant> {
    return { 
      id: 1,
      name: data.name,
      platformId: data.platformId,
      domain: data.domain,
      config: data.config,
      systemPrompt: data.systemPrompt,
      isActive: data.isActive,
      createdAt: new Date() 
    };
  }
  async getTenantByDomain(): Promise<Tenant | undefined> { return undefined; }
  async createLtiGrade(data: InsertLtiGrade): Promise<LtiGrade> {
    return { 
      id: 1,
      sessionId: data.sessionId,
      ltiUserId: data.ltiUserId,
      lineitemId: data.lineitemId,
      score: data.score,
      maxScore: data.maxScore,
      submissionStatus: data.submissionStatus,
      submittedAt: data.submittedAt,
      createdAt: new Date() 
    };
  }
  async getLtiGradesByUser(): Promise<LtiGrade[]> { return []; }
  async updateLtiGradeSubmission(): Promise<LtiGrade | undefined> { return undefined; }
  
  // LTI Assignment Config methods
  async createOrUpdateLtiAssignmentConfig(data: InsertLtiAssignmentConfig): Promise<LtiAssignmentConfig> {
    return {
      id: 1,
      platformId: data.platformId,
      contextId: data.contextId,
      resourceLinkId: data.resourceLinkId,
      contentPackageId: data.contentPackageId,
      district: data.district,
      course: data.course,
      topic: data.topic,
      config: data.config,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async getLtiAssignmentConfig(): Promise<LtiAssignmentConfig | undefined> { return undefined; }
}

// Storage interface with all the methods we need
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
  
  // LTI Assignment Config methods
  createOrUpdateLtiAssignmentConfig(data: InsertLtiAssignmentConfig): Promise<LtiAssignmentConfig>;
  getLtiAssignmentConfig(platformId: number, contextId: string, resourceLinkId: string): Promise<LtiAssignmentConfig | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date()
    }).returning();
    return user;
  }
  
  // Session methods
  async createSession(userId: number): Promise<Session> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days
    
    const [session] = await db.insert(sessions).values({
      userId,
      sessionId,
      createdAt: new Date(),
      expiresAt
    }).returning();
    
    return session;
  }
  
  async getSessionById(sessionId: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId));
    return session;
  }
  
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.getSessionById(sessionId);
    if (!session) return false;
    
    const now = new Date();
    return new Date(session.expiresAt) > now;
  }
  
  // Conversation methods
  async createConversation(data: InsertConversation): Promise<Conversation> {
    const now = new Date();
    const [conversation] = await db.insert(conversations).values({
      ...data,
      createdAt: now,
      updatedAt: now
    }).returning();
    
    return conversation;
  }
  
  async getConversationByThreadId(threadId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.threadId, threadId));
    return conversation;
  }
  
  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.sessionId, sessionId));
  }
  
  async updateConversation(threadId: string, messages: any[]): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ 
        messages: messages,
        updatedAt: new Date()
      })
      .where(eq(conversations.threadId, threadId))
      .returning();
    
    return conversation;
  }
  
  // Feedback methods
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db.insert(feedbacks).values({
      ...data,
      createdAt: new Date()
    }).returning();
    
    return feedback;
  }
  
  async getFeedbackBySession(sessionId: string): Promise<Feedback | undefined> {
    const [feedback] = await db.select().from(feedbacks).where(eq(feedbacks.sessionId, sessionId));
    return feedback;
  }

  // LTI Platform methods
  async getLtiPlatformByIssuer(issuer: string): Promise<LtiPlatform | undefined> {
    const [platform] = await db.select().from(ltiPlatforms).where(eq(ltiPlatforms.issuer, issuer));
    return platform;
  }

  async createLtiPlatform(data: InsertLtiPlatform): Promise<LtiPlatform> {
    const [platform] = await db.insert(ltiPlatforms).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return platform;
  }

  // LTI Deployment methods
  async createLtiDeployment(data: InsertLtiDeployment): Promise<LtiDeployment> {
    const [deployment] = await db.insert(ltiDeployments).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return deployment;
  }

  async getLtiDeployment(platformId: number, deploymentId: string): Promise<LtiDeployment | undefined> {
    const [deployment] = await db.select().from(ltiDeployments)
      .where(and(eq(ltiDeployments.platformId, platformId), eq(ltiDeployments.deploymentId, deploymentId)));
    return deployment;
  }

  // LTI Registration methods
  async createLtiRegistration(data: InsertLtiRegistration): Promise<LtiRegistration> {
    const [registration] = await db.insert(ltiRegistrations).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return registration;
  }

  async getLtiRegistrationByPlatform(platformId: number): Promise<LtiRegistration | undefined> {
    const [registration] = await db.select().from(ltiRegistrations)
      .where(eq(ltiRegistrations.platformId, platformId));
    return registration;
  }

  // LTI Context methods
  async getLtiContextByContextId(platformId: number, contextId: string): Promise<LtiContext | undefined> {
    const [context] = await db.select().from(ltiContexts)
      .where(and(eq(ltiContexts.platformId, platformId), eq(ltiContexts.contextId, contextId)));
    return context;
  }

  async createLtiContext(data: InsertLtiContext): Promise<LtiContext> {
    const [context] = await db.insert(ltiContexts).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return context;
  }

  // LTI User methods
  async getLtiUserByUserId(platformId: number, ltiUserId: string): Promise<LtiUser | undefined> {
    const [user] = await db.select().from(ltiUsers)
      .where(and(eq(ltiUsers.platformId, platformId), eq(ltiUsers.ltiUserId, ltiUserId)));
    return user;
  }

  async createLtiUser(data: InsertLtiUser): Promise<LtiUser> {
    const [user] = await db.insert(ltiUsers).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return user;
  }

  // Tenant methods
  async getTenantByPlatform(platformId: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants)
      .where(eq(tenants.platformId, platformId));
    return tenant;
  }

  async createTenant(data: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return tenant;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants)
      .where(eq(tenants.domain, domain));
    return tenant;
  }

  // LTI Grade methods
  async createLtiGrade(data: InsertLtiGrade): Promise<LtiGrade> {
    const [grade] = await db.insert(ltiGrades).values({
      ...data,
      createdAt: new Date()
    }).returning();
    return grade;
  }

  async getLtiGradesByUser(ltiUserId: number): Promise<LtiGrade[]> {
    return await db.select().from(ltiGrades)
      .where(eq(ltiGrades.ltiUserId, ltiUserId));
  }

  async updateLtiGradeSubmission(id: number, status: string): Promise<LtiGrade | undefined> {
    const [grade] = await db.update(ltiGrades)
      .set({ 
        submissionStatus: status,
        submittedAt: new Date()
      })
      .where(eq(ltiGrades.id, id))
      .returning();
    return grade;
  }

  // LTI Assignment Config methods
  async createOrUpdateLtiAssignmentConfig(data: InsertLtiAssignmentConfig): Promise<LtiAssignmentConfig> {
    // Check if config already exists
    const existing = await this.getLtiAssignmentConfig(data.platformId, data.contextId, data.resourceLinkId);
    
    if (existing) {
      // Update existing config
      const [updated] = await db.update(ltiAssignmentConfigs)
        .set({
          contentPackageId: data.contentPackageId,
          district: data.district,
          course: data.course,
          topic: data.topic,
          config: data.config,
          updatedAt: new Date()
        })
        .where(eq(ltiAssignmentConfigs.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new config
      const [created] = await db.insert(ltiAssignmentConfigs).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return created;
    }
  }

  async getLtiAssignmentConfig(platformId: number, contextId: string, resourceLinkId: string): Promise<LtiAssignmentConfig | undefined> {
    const [config] = await db.select().from(ltiAssignmentConfigs)
      .where(and(
        eq(ltiAssignmentConfigs.platformId, platformId),
        eq(ltiAssignmentConfigs.contextId, contextId),
        eq(ltiAssignmentConfigs.resourceLinkId, resourceLinkId)
      ));
    return config;
  }
}

// Dynamic storage initialization function
function initializeStorage(): IStorage {
  const useMemoryStorage = process.env.NODE_ENV === "development" && process.env.USE_MEMORY_STORAGE === "true";
  console.log(`🗄️  Storage mode: ${useMemoryStorage ? 'In-Memory' : 'Database'}`);
  return useMemoryStorage ? new MemoryStorage() : new DatabaseStorage();
}

// Initialize storage - will be re-initialized if environment changes
export let storage: IStorage = initializeStorage();

// Function to reinitialize storage (useful when environment variables change)
export function reinitializeStorage(): void {
  storage = initializeStorage();
}
