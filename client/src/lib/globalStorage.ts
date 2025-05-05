/**
 * Global storage utility to manage shared data between components
 * This module provides a way to store and retrieve data without relying on window.__assessmentData
 * which has been unreliable for score data.
 */

// Define the storage types
interface FeedbackData {
  summary: string;
  contentKnowledgeScore: number;
  writingScore: number;
  nextSteps: string;
}

interface GlobalStorage {
  assessmentThreadId?: string;
  assessmentMessages: any[];
  teachingMessages: any[];
  feedbackData?: FeedbackData;
}

// Initialize the global storage
const storage: GlobalStorage = {
  assessmentMessages: [],
  teachingMessages: []
};

/**
 * Set feedback data values directly
 */
export function setFeedbackData(data: FeedbackData) {
  console.log("🔴 GLOBAL STORAGE - Setting feedback data:", data);
  
  // Create a copy to avoid reference issues
  storage.feedbackData = {
    summary: data.summary || "No feedback summary available.",
    contentKnowledgeScore: Number(data.contentKnowledgeScore) || 0,
    writingScore: Number(data.writingScore) || 0,
    nextSteps: data.nextSteps || "No next steps available."
  };
  
  // Also update window.__assessmentData for backward compatibility
  if (typeof window !== 'undefined') {
    if (!window.__assessmentData) {
      window.__assessmentData = { 
        feedbackData: { ...storage.feedbackData },
        messages: [...storage.assessmentMessages],
        teachingMessages: [...storage.teachingMessages]
      };
    } else {
      window.__assessmentData.feedbackData = { ...storage.feedbackData };
    }
  }
  
  console.log("🔴 GLOBAL STORAGE - Feedback data set successfully. Current data:", storage.feedbackData);
}

/**
 * Get feedback data values directly
 */
export function getFeedbackData(): FeedbackData {
  console.log("🔴 GLOBAL STORAGE - Getting feedback data:", storage.feedbackData);
  
  // If no data is available, return default values
  if (!storage.feedbackData) {
    return {
      summary: "No feedback data was received.",
      contentKnowledgeScore: 0,
      writingScore: 0,
      nextSteps: "Try again to receive personalized feedback."
    };
  }
  
  return { ...storage.feedbackData };
}

/**
 * Set assessment messages
 */
export function setAssessmentMessages(messages: any[]) {
  storage.assessmentMessages = [...messages];
  
  // Also update window.__assessmentData for backward compatibility
  if (typeof window !== 'undefined') {
    if (!window.__assessmentData) {
      window.__assessmentData = { messages: [...messages] };
    } else {
      window.__assessmentData.messages = [...messages];
    }
  }
}

/**
 * Get assessment messages
 */
export function getAssessmentMessages(): any[] {
  return [...storage.assessmentMessages];
}

/**
 * Set teaching messages
 */
export function setTeachingMessages(messages: any[]) {
  console.log("🔴 GLOBAL STORAGE - setTeachingMessages called with", messages.length, "messages");
  
  if (!messages || !Array.isArray(messages)) {
    console.error("🔴 GLOBAL STORAGE - Invalid messages format:", messages);
    return;
  }
  
  // Create a deep copy
  storage.teachingMessages = JSON.parse(JSON.stringify(messages));
  
  // Also update window.__assessmentData for backward compatibility
  if (typeof window !== 'undefined') {
    if (!window.__assessmentData) {
      window.__assessmentData = { teachingMessages: JSON.parse(JSON.stringify(messages)) };
    } else {
      window.__assessmentData.teachingMessages = JSON.parse(JSON.stringify(messages));
    }
    
    console.log("🔴 GLOBAL STORAGE - window.__assessmentData updated with teaching messages:", 
                window.__assessmentData.teachingMessages?.length || 0, "messages");
  }
  
  // Log the content of the first and last message for debugging
  if (messages.length > 0) {
    console.log("🔴 GLOBAL STORAGE - First teaching message:", messages[0].role, messages[0].content.substring(0, 50) + "...");
    if (messages.length > 1) {
      console.log("🔴 GLOBAL STORAGE - Last teaching message:", 
                 messages[messages.length-1].role, 
                 messages[messages.length-1].content.substring(0, 50) + "...");
    }
  }
}

/**
 * Get teaching messages
 */
export function getTeachingMessages(): any[] {
  const result = storage.teachingMessages || [];
  console.log("🔴 GLOBAL STORAGE - getTeachingMessages returning", result.length, "messages");
  
  if (result.length === 0) {
    // Try to get them from window.__assessmentData as a fallback
    const windowMessages = window.__assessmentData?.teachingMessages || [];
    console.log("🔴 GLOBAL STORAGE - Fallback: getting", windowMessages.length, 
                "teaching messages from window.__assessmentData");
    return [...windowMessages];
  }
  
  return [...result];
}

/**
 * Set assessment thread ID
 */
export function setAssessmentThreadId(threadId: string) {
  storage.assessmentThreadId = threadId;
  
  // Also update window.__assessmentData for backward compatibility
  if (typeof window !== 'undefined') {
    if (!window.__assessmentData) {
      window.__assessmentData = { threadId };
    } else {
      window.__assessmentData.threadId = threadId;
    }
  }
}

/**
 * Get assessment thread ID
 */
export function getAssessmentThreadId(): string | undefined {
  return storage.assessmentThreadId;
}

// Export the utility
export default {
  setFeedbackData,
  getFeedbackData,
  setAssessmentMessages,
  getAssessmentMessages,
  setTeachingMessages,
  getTeachingMessages,
  setAssessmentThreadId,
  getAssessmentThreadId
};