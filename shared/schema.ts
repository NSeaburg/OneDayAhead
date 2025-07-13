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

// LTI Assignment Configuration - stores content package selection
export const ltiAssignmentConfigs = pgTable("lti_assignment_configs", {
  id: serial("id").primaryKey(),
  platformId: integer("platform_id").references(() => ltiPlatforms.id),
  contextId: text("context_id").notNull(),
  resourceLinkId: text("resource_link_id").notNull(),
  contentPackageId: text("content_package_id").notNull(),
  district: text("district").notNull(),
  course: text("course").notNull(),
  topic: text("topic").notNull(),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Usage Tracking for cost monitoring and abuse prevention
export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => sessions.sessionId, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(), // API endpoint used (e.g., "/api/claude-chat")
  estimatedTokens: integer("estimated_tokens").notNull(), // (input_chars + output_chars) / 4
  inputChars: integer("input_chars").notNull(),
  outputChars: integer("output_chars").notNull(),
  ipAddress: text("ip_address"), // For IP-based blocking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blocked IPs for abuse prevention
export const blockedIps = pgTable("blocked_ips", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull().unique(),
  reason: text("reason").notNull(),
  blockedUntil: timestamp("blocked_until").notNull(),
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
  grade: true,
  maxGrade: true,
});

// LTI Insert schemas
export const insertLtiPlatformSchema = createInsertSchema(ltiPlatforms).pick({
  issuer: true,
  name: true,
  clientId: true,
  authenticationEndpoint: true,
  accesstokenEndpoint: true,
  authConfig: true,
});

export const insertLtiDeploymentSchema = createInsertSchema(ltiDeployments).pick({
  platformId: true,
  deploymentId: true,
});

export const insertLtiRegistrationSchema = createInsertSchema(ltiRegistrations).pick({
  platformId: true,
  keySet: true,
  privateKey: true,
  publicKey: true,
});

export const insertLtiContextSchema = createInsertSchema(ltiContexts).pick({
  platformId: true,
  contextId: true,
  contextType: true,
  contextTitle: true,
  contextLabel: true,
});

export const insertLtiUserSchema = createInsertSchema(ltiUsers).pick({
  platformId: true,
  ltiUserId: true,
  name: true,
  givenName: true,
  familyName: true,
  email: true,
  roles: true,
});

export const insertTenantSchema = createInsertSchema(tenants).pick({
  name: true,
  domain: true,
  platformId: true,
  config: true,
  systemPrompt: true,
  isActive: true,
});

export const insertLtiGradeSchema = createInsertSchema(ltiGrades).pick({
  sessionId: true,
  ltiUserId: true,
  lineitemId: true,
  score: true,
  maxScore: true,
  submissionStatus: true,
});

export const insertLtiAssignmentConfigSchema = createInsertSchema(ltiAssignmentConfigs).pick({
  platformId: true,
  contextId: true,
  resourceLinkId: true,
  contentPackageId: true,
  district: true,
  course: true,
  topic: true,
  config: true,
});

export const insertAiUsageSchema = createInsertSchema(aiUsage).pick({
  sessionId: true,
  endpoint: true,
  estimatedTokens: true,
  inputChars: true,
  outputChars: true,
  ipAddress: true,
});

export const insertBlockedIpSchema = createInsertSchema(blockedIps).pick({
  ipAddress: true,
  reason: true,
  blockedUntil: true,
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

// LTI Types
export type InsertLtiPlatform = z.infer<typeof insertLtiPlatformSchema>;
export type LtiPlatform = typeof ltiPlatforms.$inferSelect;

export type InsertLtiDeployment = z.infer<typeof insertLtiDeploymentSchema>;
export type LtiDeployment = typeof ltiDeployments.$inferSelect;

export type InsertLtiRegistration = z.infer<typeof insertLtiRegistrationSchema>;
export type LtiRegistration = typeof ltiRegistrations.$inferSelect;

export type InsertLtiContext = z.infer<typeof insertLtiContextSchema>;
export type LtiContext = typeof ltiContexts.$inferSelect;

export type InsertLtiUser = z.infer<typeof insertLtiUserSchema>;
export type LtiUser = typeof ltiUsers.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertLtiGrade = z.infer<typeof insertLtiGradeSchema>;
export type LtiGrade = typeof ltiGrades.$inferSelect;

export type InsertLtiAssignmentConfig = z.infer<typeof insertLtiAssignmentConfigSchema>;
export type LtiAssignmentConfig = typeof ltiAssignmentConfigs.$inferSelect;

export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;
export type AiUsage = typeof aiUsage.$inferSelect;

export type InsertBlockedIp = z.infer<typeof insertBlockedIpSchema>;
export type BlockedIp = typeof blockedIps.$inferSelect;
