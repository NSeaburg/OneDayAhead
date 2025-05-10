import { 
  users, sessions, conversations, feedbacks,
  type User, type InsertUser, 
  type Session, type InsertSession,
  type Conversation, type InsertConversation,
  type Feedback, type InsertFeedback
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
}

export const storage = new DatabaseStorage();
