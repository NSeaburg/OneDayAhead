// Global type declarations

// Define global window interface for storing assessment and teaching data
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
      teachingMessages?: any[]; // For storing teaching bot conversation
      feedbackData?: {
        summary?: string;
        contentKnowledgeScore?: number;
        writingScore?: number;
        nextSteps?: string;
      };
    };
  }
}

// Basic message type used across the application
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Teaching assistance data from assessment result
interface TeachingAssistance {
  level: 'low' | 'medium' | 'high';
  systemPrompt: string;
}

// Export empty to make this a module
export {};