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

export const storage = new DatabaseStorage();
