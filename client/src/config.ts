// App configuration
export const config = {
  // Video screen configuration
  videoUrl: "https://www.youtube.com/embed/ybxSgIBbBh8", // Updated video URL

  // Article content
  articleContent: `
    <h3 class="text-xl font-bold mb-4">Understanding Key Concepts</h3>
    <p class="mb-4">
      Learning is the process of acquiring new understanding, knowledge, behaviors, skills, values, attitudes, and preferences. The ability to learn is possessed by humans, animals, and some machines; there is also evidence for some kind of learning in certain plants.
    </p>
    <p class="mb-4">
      Some learning is immediate, induced by a single event (e.g. being burned by a hot stove), but much skill and knowledge accumulates from repeated experiences. The changes induced by learning often last a lifetime, and it is hard to distinguish learned material that seems to be "lost" from that which cannot be retrieved.
    </p>
    <h3 class="text-xl font-bold mb-4 mt-6">The Learning Process</h3>
    <p class="mb-4">
      Human learning starts at birth (it might even start before in terms of an embryo's need for both stimulation and a stimulation-free environment while in the womb) and continues until death as a consequence of ongoing interactions between people and their environment.
    </p>
    <p class="mb-4">
      The nature and processes involved in learning are studied in many fields, including educational psychology, neuropsychology, experimental psychology, and pedagogy. Research in such fields has led to the identification of various sorts of learning.
    </p>
    <h3 class="text-xl font-bold mb-4 mt-6">Learning Methods</h3>
    <p class="mb-4">
      There are many different types of learning methods, and each person may find certain methods work better for them than others. Some common learning methods include:
    </p>
    <ul class="list-disc pl-6 mb-4">
      <li class="mb-2">Visual learning</li>
      <li class="mb-2">Auditory learning</li>
      <li class="mb-2">Kinesthetic learning</li>
      <li class="mb-2">Reading/writing learning</li>
    </ul>
    <p>
      Understanding your preferred learning style can help you tailor your study habits and comprehend information more effectively.
    </p>
  `,

  // OpenAI API configuration
  openai: {
    // Use assistant IDs for each chatbot
    // These would be replaced with real assistant IDs in production
    discussionAssistantId: "discussion-assistant",
    assessmentAssistantId: "assessment-assistant",
    // The final bot ID will be determined externally (via N8N)
    finalBotIdPlaceholder: "feedback-assistant",
  },

  // System prompts for each assistant
  systemPrompts: {
    discussion: "You are a helpful learning assistant discussing the content of an article about learning methods. Provide clear, concise answers to questions about the article content or related topics. Be supportive and encouraging.",
    assessment: "You are an assessment assistant evaluating the user's understanding of learning concepts. Ask thoughtful questions about the key concepts presented in the article, and provide constructive feedback on their responses. Be encouraging but thorough in your assessment.",
    feedback: "You are a feedback assistant providing personalized guidance based on the user's assessment. Offer tailored recommendations and resources to help them improve their understanding. Be supportive and motivational."
  },

  // Total number of screens in the application
  totalSteps: 4
};
