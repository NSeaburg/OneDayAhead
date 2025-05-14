import { 
  users, sessions, conversations, feedbacks,
  type User, type InsertUser, 
  type Session, type InsertSession,
  type Conversation, type InsertConversation,
  type Feedback, type InsertFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
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

// Fallback memory storage for when database is unavailable
export class MemStorage implements IStorage {
  private users: User[] = [];
  private sessions: Session[] = [];
  private conversations: Conversation[] = [];
  private feedbacks: Feedback[] = [];
  private nextId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }
  
  // Session methods
  async createSession(userId: number): Promise<Session> {
    const id = this.nextId++;
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const session: Session = {
      id,
      userId,
      sessionId,
      createdAt: now,
      expiresAt
    };
    
    this.sessions.push(session);
    return session;
  }
  
  async getSessionById(sessionId: string): Promise<Session | undefined> {
    return this.sessions.find(session => session.sessionId === sessionId);
  }
  
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.getSessionById(sessionId);
    if (!session) return false;
    
    const now = new Date();
    return session.expiresAt > now;
  }
  
  // Conversation methods
  async createConversation(data: InsertConversation): Promise<Conversation> {
    const id = this.nextId++;
    const now = new Date();
    
    const conversation: Conversation = {
      id,
      sessionId: data.sessionId,
      threadId: data.threadId,
      assistantType: data.assistantType,
      messages: data.messages,
      createdAt: now,
      updatedAt: now
    };
    
    this.conversations.push(conversation);
    return conversation;
  }
  
  async getConversationByThreadId(threadId: string): Promise<Conversation | undefined> {
    return this.conversations.find(conv => conv.threadId === threadId);
  }
  
  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.sessionId === sessionId);
  }
  
  async updateConversation(threadId: string, messages: any[]): Promise<Conversation | undefined> {
    const conversation = await this.getConversationByThreadId(threadId);
    if (!conversation) return undefined;
    
    conversation.messages = messages;
    conversation.updatedAt = new Date();
    
    return conversation;
  }
  
  // Feedback methods
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    const id = this.nextId++;
    const now = new Date();
    
    const feedback: Feedback = {
      id,
      sessionId: data.sessionId,
      summary: data.summary || null,
      contentKnowledgeScore: data.contentKnowledgeScore || null,
      writingScore: data.writingScore || null,
      nextSteps: data.nextSteps || null,
      createdAt: now
    };
    
    this.feedbacks.push(feedback);
    return feedback;
  }
  
  async getFeedbackBySession(sessionId: string): Promise<Feedback | undefined> {
    return this.feedbacks.find(feedback => feedback.sessionId === sessionId);
  }
}

// Create database storage instance
const dbStorage = new DatabaseStorage();

// Create memory storage instance as fallback
const memStorage = new MemStorage();

// Try to check if database is available
let isDatabaseAvailable = false;
try {
  // Simple database check - just do a quick query without making changes
  (async () => {
    try {
      await db.select({ count: sql`count(*)` }).from(users).limit(1);
      isDatabaseAvailable = true;
    } catch (e) {
      console.warn("Database is not available, using memory storage as fallback");
      isDatabaseAvailable = false;
    }
  })();
} catch (e) {
  isDatabaseAvailable = false;
}

// Export the appropriate storage based on database availability
export const storage: IStorage = isDatabaseAvailable ? dbStorage : memStorage;
