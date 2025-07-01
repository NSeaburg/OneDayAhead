import { 
  users, sessions, conversations, feedbacks,
  ltiPlatforms, ltiDeployments, ltiRegistrations, ltiContexts, ltiUsers, tenants, ltiGrades,
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
  type LtiGrade, type InsertLtiGrade
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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
}

// In-memory storage fallback for when database is not available
export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private feedbacks: Map<string, Feedback> = new Map();
  private ltiPlatforms: Map<string, LtiPlatform> = new Map();
  private ltiDeployments: Map<string, LtiDeployment> = new Map();
  private ltiRegistrations: Map<number, LtiRegistration> = new Map();
  private ltiContexts: Map<string, LtiContext> = new Map();
  private ltiUsers: Map<string, LtiUser> = new Map();
  private tenants: Map<number, Tenant> = new Map();
  private ltiGrades: Map<number, LtiGrade> = new Map();
  private nextId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...insertUser,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  // Session methods
  async createSession(userId: number): Promise<Session> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt,
      createdAt: new Date()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    return session ? session.expiresAt > new Date() : false;
  }

  // Conversation methods
  async createConversation(data: InsertConversation): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.nextId++,
      ...data,
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

  // Feedback methods
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      id: this.nextId++,
      ...data,
      createdAt: new Date()
    };
    this.feedbacks.set(data.sessionId, feedback);
    return feedback;
  }

  async getFeedbackBySession(sessionId: string): Promise<Feedback | undefined> {
    return this.feedbacks.get(sessionId);
  }

  // LTI Platform methods (simplified for offline mode)
  async getLtiPlatformByIssuer(issuer: string): Promise<LtiPlatform | undefined> {
    return this.ltiPlatforms.get(issuer);
  }

  async createLtiPlatform(data: InsertLtiPlatform): Promise<LtiPlatform> {
    const platform: LtiPlatform = {
      id: this.nextId++,
      ...data,
      createdAt: new Date()
    };
    this.ltiPlatforms.set(data.issuer, platform);
    return platform;
  }

  // Simplified implementations for other LTI methods
  async createLtiDeployment(data: InsertLtiDeployment): Promise<LtiDeployment> {
    const deployment: LtiDeployment = { id: this.nextId++, ...data, createdAt: new Date() };
    this.ltiDeployments.set(`${data.platformId}-${data.deploymentId}`, deployment);
    return deployment;
  }

  async getLtiDeployment(platformId: number, deploymentId: string): Promise<LtiDeployment | undefined> {
    return this.ltiDeployments.get(`${platformId}-${deploymentId}`);
  }

  async createLtiRegistration(data: InsertLtiRegistration): Promise<LtiRegistration> {
    const registration: LtiRegistration = { id: this.nextId++, ...data, createdAt: new Date() };
    this.ltiRegistrations.set(data.platformId, registration);
    return registration;
  }

  async getLtiRegistrationByPlatform(platformId: number): Promise<LtiRegistration | undefined> {
    return this.ltiRegistrations.get(platformId);
  }

  async getLtiContextByContextId(platformId: number, contextId: string): Promise<LtiContext | undefined> {
    return this.ltiContexts.get(`${platformId}-${contextId}`);
  }

  async createLtiContext(data: InsertLtiContext): Promise<LtiContext> {
    const context: LtiContext = { id: this.nextId++, ...data, createdAt: new Date() };
    this.ltiContexts.set(`${data.platformId}-${data.contextId}`, context);
    return context;
  }

  async getLtiUserByUserId(platformId: number, ltiUserId: string): Promise<LtiUser | undefined> {
    return this.ltiUsers.get(`${platformId}-${ltiUserId}`);
  }

  async createLtiUser(data: InsertLtiUser): Promise<LtiUser> {
    const ltiUser: LtiUser = { id: this.nextId++, ...data, createdAt: new Date() };
    this.ltiUsers.set(`${data.platformId}-${data.ltiUserId}`, ltiUser);
    return ltiUser;
  }

  async getTenantByPlatform(platformId: number): Promise<Tenant | undefined> {
    return this.tenants.get(platformId);
  }

  async createTenant(data: InsertTenant): Promise<Tenant> {
    const tenant: Tenant = { id: this.nextId++, ...data, createdAt: new Date() };
    this.tenants.set(data.platformId, tenant);
    return tenant;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    for (const tenant of this.tenants.values()) {
      if (tenant.domain === domain) return tenant;
    }
    return undefined;
  }

  async createLtiGrade(data: InsertLtiGrade): Promise<LtiGrade> {
    const grade: LtiGrade = { id: this.nextId++, ...data, createdAt: new Date() };
    this.ltiGrades.set(grade.id, grade);
    return grade;
  }

  async getLtiGradesByUser(ltiUserId: number): Promise<LtiGrade[]> {
    return Array.from(this.ltiGrades.values()).filter(g => g.ltiUserId === ltiUserId);
  }

  async updateLtiGradeSubmission(id: number, status: string): Promise<LtiGrade | undefined> {
    const grade = this.ltiGrades.get(id);
    if (grade) {
      grade.submissionStatus = status;
      this.ltiGrades.set(id, grade);
    }
    return grade;
  }
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
}

// Global storage instance that will be set based on database availability
export let storage: IStorage = new DatabaseStorage();

// Function to switch to memory storage when database is not available
export function useMemoryStorage() {
  console.log("🔄 Switching to in-memory storage (database unavailable)");
  storage = new MemoryStorage();
}
