import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  sessionId: true,
  expiresAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  sessionId: true,
  threadId: true,
  assistantType: true,
  messages: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).pick({
  sessionId: true,
  summary: true,
  contentKnowledgeScore: true,
  writingScore: true,
  nextSteps: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacks.$inferSelect;
