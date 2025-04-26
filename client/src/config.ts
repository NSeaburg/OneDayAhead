// App configuration
import { CourseInfo, ContentInfo, TechnicalInfo } from '@shared/schema';

// N8N Integration Config
export const n8nConfig = {
  course: {
    name: "Gravity",
    topic: "Effective Learning Techniques",
    module: "Learning Methods Assessment",
    level: "Beginner",
    instructor: "Learning Expert Team"
  } as CourseInfo,
  
  content: {
    articleTitle: "Effective Learning Techniques",
    videoTitle: "Introduction to Learning Methods",
    contentType: "assessment" as const,
    contentId: "learning-methods-101",
    contentVersion: "v1.0.0"
  } as ContentInfo,
  
  technical: {
    platform: "web",
    appVersion: "1.0.0",
    deviceType: "browser"
  } as TechnicalInfo
};

export const config = {
  // Video screen configuration
  videoUrl: "https://www.youtube.com/embed/ybxSgIBbBh8", // Updated video URL

  // Article content
  articleContent: `
    <h2 class="text-2xl font-bold mb-4 text-blue-800">The Science of Effective Learning</h2>
    
    <p class="mb-4">
      Learning effectively is a skill that can be developed and refined. Modern research in cognitive science and psychology has revealed several powerful techniques that can dramatically improve how we learn and retain information.
    </p>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Spaced Repetition</h3>
    <p class="mb-4">
      Rather than cramming all your studying into one marathon session, research shows that spacing out your learning over time leads to much better long-term retention. This is known as the <strong>spacing effect</strong>.
    </p>
    <p class="mb-4">
      When you encounter information repeatedly over time, your brain recognizes it as important and strengthens the neural pathways associated with that knowledge. A good approach is to review material:
    </p>
    <ul class="list-disc pl-6 mb-4">
      <li class="mb-2">A few hours after first learning it</li>
      <li class="mb-2">A day later</li>
      <li class="mb-2">A week later</li>
      <li class="mb-2">A month later</li>
    </ul>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Retrieval Practice</h3>
    <p class="mb-4">
      Simply re-reading material creates a false sense of familiarity that can be mistaken for actual learning. Instead, actively testing yourself on the material forces your brain to retrieve information from memory, which strengthens those neural pathways.
    </p>
    <p class="mb-4">
      Effective retrieval practice methods include:
    </p>
    <ul class="list-disc pl-6 mb-4">
      <li class="mb-2">Flashcards</li>
      <li class="mb-2">Practice tests</li>
      <li class="mb-2">Explaining concepts to someone else</li>
      <li class="mb-2">Writing summaries from memory</li>
    </ul>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Interleaving</h3>
    <p class="mb-4">
      While it might seem logical to focus on one topic at a time (blocked practice), research shows that mixing different topics or types of problems (interleaving) leads to better long-term learning and skill development.
    </p>
    <p class="mb-4">
      Interleaving forces your brain to continuously retrieve different strategies and solutions, which builds stronger neural connections. For example, when studying mathematics, rather than doing 20 problems of the same type, you might mix different types of problems together.
    </p>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Elaboration</h3>
    <p class="mb-4">
      Elaboration involves connecting new information to existing knowledge. When you encounter new material, ask yourself:
    </p>
    <ul class="list-disc pl-6 mb-4">
      <li class="mb-2">How does this relate to what I already know?</li>
      <li class="mb-2">How can I explain this in my own words?</li>
      <li class="mb-2">What examples can I think of that illustrate this concept?</li>
      <li class="mb-2">Why does this information matter?</li>
    </ul>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Dual Coding</h3>
    <p class="mb-4">
      Our brains have separate channels for processing visual and verbal information. By combining both types of input, you can strengthen your understanding and memory of the material.
    </p>
    <p class="mb-4">
      Effective dual coding strategies include:
    </p>
    <ul class="list-disc pl-6 mb-4">
      <li class="mb-2">Creating diagrams or sketches to represent concepts</li>
      <li class="mb-2">Using mind maps that combine words and visual elements</li>
      <li class="mb-2">Visualizing information while reading or listening to it</li>
    </ul>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Concrete Examples</h3>
    <p class="mb-4">
      Abstract concepts become much easier to understand and remember when connected to concrete examples. When learning new material, try to generate specific examples that illustrate the concept.
    </p>
    <p class="mb-4">
      For instance, when learning about confirmation bias, you might think about a time when you Googled evidence to support your existing belief rather than seeking out contrary evidence.
    </p>

    <h3 class="text-xl font-bold mb-3 mt-6 text-blue-700">Conclusion</h3>
    <p class="mb-4">
      By incorporating these evidence-based learning techniques into your study routine, you can dramatically improve your ability to learn and retain information. Remember that effective learning is not about how much time you spend studying, but rather how you use that time.
    </p>
  `,

  // OpenAI API configuration
  openai: {
    // Using the OpenAI Assistant IDs - the actual ID is injected from the server
    discussionAssistantId: "assistant-id", // This will be replaced with the OPENAI_ASSISTANT_ID from the server
    assessmentAssistantId: "assistant-id", // This will be replaced with the OPENAI_ASSISTANT_ID from the server
    // The final bot ID will be determined externally (via N8N)
    finalBotIdPlaceholder: "assistant-id", // This will be replaced with the OPENAI_ASSISTANT_ID from the server
  },

  // System prompts for each assistant
  systemPrompts: {
    discussion: "You are a helpful learning assistant discussing the content of an article about effective learning techniques. The article covers: spaced repetition, retrieval practice, interleaving, elaboration, dual coding, and using concrete examples. Provide clear, concise answers to questions about these learning techniques or related topics. Be supportive and encouraging.",
    assessment: "You are an assessment assistant evaluating the user's understanding of effective learning techniques. Ask thoughtful questions about key concepts presented in the article (spaced repetition, retrieval practice, interleaving, elaboration, dual coding, concrete examples). Provide constructive feedback on their responses. Be encouraging but thorough in your assessment.",
    dynamic: "You are a specialized assistant that has been dynamically selected based on the user's assessment responses. You will receive specific information about the user's knowledge gaps or areas of interest. Help them deepen their understanding of effective learning techniques with tailored explanations and examples. Be supportive and adapt your guidance to their specific needs.",
    feedback: "You are a feedback assistant providing personalized guidance based on the user's assessment of effective learning techniques. Offer tailored recommendations and resources to help them apply these techniques (spaced repetition, retrieval practice, interleaving, elaboration, dual coding, concrete examples) in their own studies. Be supportive and motivational."
  },

  // Total number of screens in the application
  totalSteps: 5
};
