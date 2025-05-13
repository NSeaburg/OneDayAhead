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

export default anthropic;