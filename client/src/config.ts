// App configuration - content will be loaded dynamically
export const config = {
  // Video screen configuration - will be loaded from content packages
  videoUrl: "", // Will be populated dynamically

  // Article content - will be loaded from content packages
  articleContent: "", // Will be populated dynamically

  // AI API configuration (using Claude/Anthropic)
  ai: {
    // Discussion assistant uses Claude for article conversations
    discussionAssistantId: "claude-discussion",
    // Assessment uses Claude with Reginald character
    assessmentAssistantId: "claude-assessment", 
    // Teaching assistant determined by N8N based on assessment
    teachingAssistantId: "claude-teaching",
  },

  // System prompts for each assistant - will be loaded dynamically
  systemPrompts: {
    discussion: "", // Will be loaded from content packages
    assessment: "", // Will be loaded from content packages
    dynamic: "", // Will be loaded from content packages
    feedback: "" // Will be loaded from content packages
  },

  // Total number of screens in the application
  totalSteps: 5
};
