// Global types for the application

// Types for server responses
export interface FeedbackData {
  summary?: string;
  contentKnowledgeScore?: number;
  writingScore?: number;
  nextSteps?: string;
}

export interface TeachingResponseData {
  success?: boolean;
  message?: string;
  feedbackData?: FeedbackData;
}

// Types for teaching assistance
export type TeachingAssistanceLevel = 'low' | 'medium' | 'high';

export interface TeachingAssistance {
  level: TeachingAssistanceLevel;
  systemPrompt: string;
}