import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Course information schemas for N8N integration
export const courseInfoSchema = z.object({
  name: z.string().default("Gravity"),
  topic: z.string().default("Effective Learning Techniques"),
  module: z.string(),
  level: z.string().optional(),
  instructor: z.string().optional(),
  courseId: z.string().optional(),
});

export const contentInfoSchema = z.object({
  articleTitle: z.string().optional(),
  videoTitle: z.string().optional(),
  contentType: z.enum(["video", "article", "assessment", "interactive", "feedback"]),
  contentId: z.string().optional(),
  contentVersion: z.string().optional(),
});

export const technicalInfoSchema = z.object({
  platform: z.string().default("web"),
  appVersion: z.string().default("1.0.0"),
  sessionStartTime: z.string().optional(),
  sessionEndTime: z.string().optional(),
  interactionCount: z.number().optional(),
  browserInfo: z.string().optional(),
  deviceType: z.string().optional(),
});

export const n8nPayloadSchema = z.object({
  conversationData: z.array(z.any()),
  threadId: z.string(),
  course: courseInfoSchema,
  content: contentInfoSchema,
  technical: technicalInfoSchema.optional(),
  timestamp: z.string(),
  source: z.string(),
  userId: z.string().optional(),
});

export type CourseInfo = z.infer<typeof courseInfoSchema>;
export type ContentInfo = z.infer<typeof contentInfoSchema>;
export type TechnicalInfo = z.infer<typeof technicalInfoSchema>;
export type N8nPayload = z.infer<typeof n8nPayloadSchema>;
