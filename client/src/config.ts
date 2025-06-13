// App configuration
export const config = {
  // Video screen configuration
  videoUrl: "https://www.youtube.com/embed/0lrjvIfJeKo?nocache=" + new Date().getTime(), // Direct YouTube URL with cache-busting

  // Article content
  articleContent: `
    <h1 class="text-3xl font-bold mb-6 text-blue-800">The Three Branches of Government: How the Pieces Fit Together</h1>

    <h2 class="text-2xl font-bold mb-4 mt-6 text-blue-700">Why Split It Up?</h2>
    <p class="mb-4">
      When the Founders wrote the Constitution, they were fresh off a bad breakup—with King George III. They had seen firsthand what happens when too much power sits in one place. So they designed a government that splits power into three different groups, each with its own special job: Congress makes the laws, the President enforces them, and the Courts interpret them. It's like building a three-legged stool—knock one leg out, and the whole thing wobbles. The idea was simple but revolutionary: separate powers to prevent tyranny.
    </p>

    <h2 class="text-2xl font-bold mb-4 mt-6 text-blue-700">Congress: The Playbook Writers</h2>
    <p class="mb-4">
      Congress is the lawmaking branch—the people who write the rules of the game. It's made up of two parts: the House of Representatives and the Senate. Together, they decide what laws the country needs, how to spend its money, and even when to go to war. Think of Congress like the team's head strategists, crafting the game plan. But writing the laws doesn't mean they automatically happen—that job belongs to someone else.
    </p>

    <h2 class="text-2xl font-bold mb-4 mt-6 text-blue-700">The President: The Enforcer on the Field</h2>
    <p class="mb-4">
      The President leads the Executive Branch, whose main job is to carry out the laws Congress passes. That means everything from leading the military to making sure food safety standards are actually followed. If Congress is the playbook writer, the President is the coach—and sometimes the quarterback—making real-time decisions. The President can also veto laws (send them back to Congress unsigned) and make deals with other countries. But while the President is powerful, they still have to play by the rules Congress sets.
    </p>

    <h2 class="text-2xl font-bold mb-4 mt-6 text-blue-700">The Courts: Keeping Everyone Honest</h2>
    <p class="mb-4">
      The Judicial Branch, led by the Supreme Court, acts as the referee. Judges look at laws and government actions and decide whether they follow the Constitution—the highest rulebook of all. If Congress or the President tries to bend the rules too far, the courts can blow the whistle and stop it. It's a powerful job, but it relies on trust: courts don't have armies or budgets to enforce their decisions. They depend on people respecting the system. When the three branches work together, they keep each other in check while still getting things done.
    </p>
  `,

  // AI API configuration (using Claude/Anthropic)
  ai: {
    // Discussion assistant uses Claude for article conversations
    discussionAssistantId: "claude-discussion",
    // Assessment uses Claude with Reginald character
    assessmentAssistantId: "claude-assessment", 
    // Teaching assistant determined by N8N based on assessment
    teachingAssistantId: "claude-teaching",
  },

  // System prompts for each assistant
  systemPrompts: {
    discussion: "You are a fresh, fun, interesting learning assistant. You discussing the content of an article about the three branches of government in the United States. Provide clear, concise answers to questions about these government branches or related topics. you aim for a quick back and forth conversation, aiming to limit most responses to 3 sentences or less. You push students to deepen their thinking and you ask them engaging questions.\n\nYou will refuse to discuss anything unrelated to the government structure of political science. You will not discuss political hot-button issues at all.\n\nThis is the text of the article:\n\nThe Three Branches of Government: How the Pieces Fit Together\n\nWhy Split It Up?\nWhen the Founders wrote the Constitution, they were fresh off a bad breakup—with King George III. They had seen firsthand what happens when too much power sits in one place. So they designed a government that splits power into three different groups, each with its own special job: Congress makes the laws, the President enforces them, and the Courts interpret them. It's like building a three-legged stool—knock one leg out, and the whole thing wobbles. The idea was simple but revolutionary: separate powers to prevent tyranny.\n\nCongress: The Playbook Writers\nCongress is the lawmaking branch—the people who write the rules of the game. It's made up of two parts: the House of Representatives and the Senate. Together, they decide what laws the country needs, how to spend its money, and even when to go to war. Think of Congress like the team's head strategists, crafting the game plan. But writing the laws doesn't mean they automatically happen—that job belongs to someone else.\n\nThe President: The Enforcer on the Field\nThe President leads the Executive Branch, whose main job is to carry out the laws Congress passes. That means everything from leading the military to making sure food safety standards are actually followed. If Congress is the playbook writer, the President is the coach—and sometimes the quarterback—making real-time decisions. The President can also veto laws (send them back to Congress unsigned) and make deals with other countries. But while the President is powerful, they still have to play by the rules Congress sets.\n\nThe Courts: Keeping Everyone Honest\nThe Judicial Branch, led by the Supreme Court, acts as the referee. Judges look at laws and government actions and decide whether they follow the Constitution—the highest rulebook of all. If Congress or the President tries to bend the rules too far, the courts can blow the whistle and stop it. It's a powerful job, but it relies on trust: courts don't have armies or budgets to enforce their decisions. They depend on people respecting the system. When the three branches work together, they keep each other in check while still getting things done.",
    assessment: "You are an assessment assistant evaluating the user's understanding of the three branches of government. Ask thoughtful questions about key concepts presented in the article (separation of powers, Congress's role in lawmaking, the President's executive powers, and the judicial branch's function). Provide constructive feedback on their responses. Be encouraging but thorough in your assessment.",
    dynamic: "You are a specialized assistant that has been dynamically selected based on the user's assessment responses. You will receive specific information about the user's knowledge gaps or areas of interest. Help them deepen their understanding of the U.S. government structure with tailored explanations and examples. Be supportive and adapt your guidance to their specific needs.",
    feedback: "You are a feedback assistant providing personalized guidance based on the user's assessment of the three branches of government. Offer tailored recommendations and resources to help them apply this knowledge of government structure and functions in their civic engagement and understanding of current events. Be supportive and motivational."
  },

  // Total number of screens in the application
  totalSteps: 5
};
