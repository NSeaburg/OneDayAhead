import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract text from message content
function extractTextFromMessage(content: Anthropic.ContentBlockParam[]): string {
  if (!content || content.length === 0) {
    return "";
  }
  
  const textContent = content.find(block => 
    typeof block === 'object' && 'type' in block && block.type === 'text'
  );
  
  if (textContent && typeof textContent === 'object' && 'text' in textContent) {
    return textContent.text;
  }
  
  return "";
}

// Basic text analysis example
export async function summarizeArticle(text: string): Promise<string> {
  const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

  try {
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-7-sonnet-20250219',
    });

    return extractTextFromMessage(message.content);
  } catch (error) {
    console.error('Error summarizing article:', error);
    throw new Error('Failed to summarize article');
  }
}

// Sentiment analysis function for feedback
export async function analyzeSentiment(text: string): Promise<{ sentiment: string, confidence: number }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: `You're a Customer Insights AI. Analyze this feedback and output in JSON format with keys: "sentiment" (positive/negative/neutral) and "confidence" (number, 0 through 1).`,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: text }
      ],
    });

    const responseText = extractTextFromMessage(response.content);
    const result = JSON.parse(responseText);
    return {
      sentiment: result.sentiment,
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { sentiment: 'neutral', confidence: 0.5 };
  }
}

// Analyze educational content for difficulty level
export async function analyzeDifficulty(content: string): Promise<{ level: 'beginner' | 'intermediate' | 'advanced', explanation: string }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: 'You are an educational content analyst. Assess the provided content and determine its difficulty level. Output in JSON format with keys: "level" (beginner/intermediate/advanced) and "explanation" (brief reason for classification).',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: content }
      ],
    });

    const responseText = extractTextFromMessage(response.content);
    const result = JSON.parse(responseText);
    return {
      level: result.level as 'beginner' | 'intermediate' | 'advanced',
      explanation: result.explanation
    };
  } catch (error) {
    console.error('Error analyzing content difficulty:', error);
    return { level: 'intermediate', explanation: 'Unable to analyze content.' };
  }
}

// Evaluate student responses for assessment
export async function evaluateResponse(question: string, studentResponse: string, rubric: string): Promise<{ score: number, feedback: string }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: `You're an educational assessment AI. Evaluate the student's response based on the provided rubric. Output in JSON format with keys: "score" (number, 0-100) and "feedback" (constructive feedback for improvement).`,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nRubric: ${rubric}\n\nStudent Response: ${studentResponse}`
        }
      ],
    });

    const responseText = extractTextFromMessage(response.content);
    const result = JSON.parse(responseText);
    return {
      score: result.score,
      feedback: result.feedback
    };
  } catch (error) {
    console.error('Error evaluating student response:', error);
    return { score: 0, feedback: 'Unable to evaluate response.' };
  }
}

// Generate personalized learning recommendations
export async function generateRecommendations(studentData: any): Promise<string[]> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: 'You are a personalized learning recommendation system. Based on the student data provided, suggest 3-5 specific resources or activities that would help them improve.',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(studentData)
        }
      ],
    });

    const responseText = extractTextFromMessage(response.content);
    try {
      // Try to parse as JSON first
      return JSON.parse(responseText);
    } catch {
      // If parsing fails, split by newlines and filter empty lines
      return responseText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.length > 0);
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return ["Unable to generate recommendations."];
  }
}

// Generate an explanation of a concept
export async function explainConcept(concept: string, level: 'simple' | 'intermediate' | 'advanced'): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: `You are an educational AI that explains concepts at different levels. The user has requested a ${level} explanation.`,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Please explain this concept: ${concept}`
        }
      ],
    });

    return extractTextFromMessage(response.content);
  } catch (error) {
    console.error('Error explaining concept:', error);
    return "Unable to generate explanation.";
  }
}

// Generate system prompts for different bot personas
export async function generateSystemPrompt(options: {
  botType: 'article' | 'assessment' | 'teaching-low' | 'teaching-medium' | 'teaching-high';
  articleContent?: string;
  previousContext?: string;
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
}): Promise<string> {
  const { botType, articleContent, previousContext, studentLevel } = options;
  
  let systemPrompt = '';
  let userPrompt = '';
  
  switch (botType) {
    case 'article':
      systemPrompt = `You are a system prompt designer for an educational AI assistant. Create a system prompt for a learning assistant that will discuss an article with students. The assistant should be fresh, fun, and interesting while maintaining educational value.`;
      userPrompt = `Please design a system prompt for an AI assistant that will discuss the following article content with students. The assistant should be aware of the article's content and geography, maintain a fresh and fun persona, and ask engaging questions to deepen student thinking. Keep responses concise (mostly 3 sentences or less). The assistant should refuse to discuss unrelated topics.\n\nArticle content: ${articleContent || "Content about the three branches of US government"}`;
      break;
      
    case 'assessment':
      systemPrompt = `You are a system prompt designer for an educational AI assistant. Create a system prompt for Reginald Worthington III, an English aristocrat from the early 1800s who serves as an assessment bot for educational content.`;
      userPrompt = `Please design a system prompt for Reginald Worthington III, an English aristocrat character from the early 1800s who serves as an assessment bot. He should maintain a formal, slightly pompous persona while effectively evaluating student understanding of topics. He should gather information to assess content knowledge and writing skills, providing scores from 0-100 for each.`;
      break;
      
    case 'teaching-low':
      systemPrompt = `You are a system prompt designer for an educational AI assistant. Create a system prompt for an entry-level teaching assistant named Mr. Whitaker who provides basic support to struggling students.`;
      userPrompt = `Please design a system prompt for Mr. Whitaker, a teaching assistant who provides structured, basic support through "Learning Through Fundamentals" for students who need significant help. He should offer clear, simple explanations, frequent comprehension checks, and explicit guidance on essential concepts. His responses should be appropriate for ${studentLevel || "beginner"} level students who need extra support.${previousContext ? `\n\nThe assistant should be aware of this previous assessment conversation: ${previousContext}` : ''}`;
      break;
      
    case 'teaching-medium':
      systemPrompt = `You are a system prompt designer for an educational AI assistant. Create a system prompt for a mid-level teaching assistant named Mrs. Bannerman who provides guided support to students.`;
      userPrompt = `Please design a system prompt for Mrs. Bannerman, a teaching assistant who provides balanced guidance through "Learning Through Practice" for students who need moderate support. She should blend direct instruction with guided discovery, use real-world examples, and encourage students to make connections. Her responses should be appropriate for ${studentLevel || "intermediate"} level students.${previousContext ? `\n\nThe assistant should be aware of this previous assessment conversation: ${previousContext}` : ''}`;
      break;
      
    case 'teaching-high':
      systemPrompt = `You are a system prompt designer for an educational AI assistant. Create a system prompt for an advanced teaching assistant named Mrs. Parton who challenges high-performing students.`;
      userPrompt = `Please design a system prompt for Mrs. Parton, a teaching assistant who provides advanced guidance through "Learning Through Exploration" for high-performing students. She should use Socratic questioning, encourage independent thinking, introduce complex concepts, and challenge students to develop their own frameworks. Her responses should be appropriate for ${studentLevel || "advanced"} level students.${previousContext ? `\n\nThe assistant should be aware of this previous assessment conversation: ${previousContext}` : ''}`;
      break;
      
    default:
      systemPrompt = `You are a system prompt designer for an educational AI assistant. Create a general educational assistant system prompt.`;
      userPrompt = `Please design a system prompt for a general educational AI assistant that will help students learn effectively.`;
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
    });

    return extractTextFromMessage(response.content);
  } catch (error) {
    console.error(`Error generating ${botType} system prompt:`, error);
    return "Unable to generate system prompt.";
  }
}

export default anthropic;