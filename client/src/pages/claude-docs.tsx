import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClaudeDocsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Claude 3.7 Sonnet Integration Documentation</h1>
      
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <p>
              This application has been integrated with Anthropic's Claude 3.7 Sonnet model released in February 2025.
              The integration provides several endpoints for interacting with Claude, generating system prompts,
              and analyzing text using Claude's advanced capabilities.
            </p>
            <p>
              Claude has been integrated to support the five chatbots in the educational platform:
            </p>
            <ul>
              <li><strong>Article Discussion Bot</strong> - For discussing content from an article using a fresh, engaging persona</li>
              <li><strong>Assessment Bot (Reginald)</strong> - For evaluating student knowledge using a formal, aristocratic persona</li>
              <li><strong>Teaching Bots</strong> - Three levels of teaching assistance:
                <ul>
                  <li><strong>Low Level (Mr. Whitaker)</strong> - Learning Through Fundamentals</li>
                  <li><strong>Medium Level (Mrs. Bannerman)</strong> - Learning Through Practice</li>
                  <li><strong>High Level (Mrs. Parton)</strong> - Learning Through Exploration</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <h3>Health Check</h3>
            <pre className="bg-slate-100 p-2 rounded">{`GET /api/claude/health`}</pre>
            <p>Checks if Claude API is available and working properly.</p>
            
            <h3>Chat</h3>
            <pre className="bg-slate-100 p-2 rounded">{`POST /api/claude/chat
{
  "messages": [{ "role": "user", "content": "Hello Claude" }],
  "systemPrompt": "You are a helpful assistant...",
  "threadId": "optional-thread-id"
}`}</pre>
            <p>Send messages to Claude and get responses. Conversation is stored in the database if session and threadId are provided.</p>
            
            <h3>System Prompt Generation</h3>
            <pre className="bg-slate-100 p-2 rounded">{`POST /api/claude/generate-prompt
{
  "botType": "article" | "assessment" | "teaching-low" | "teaching-medium" | "teaching-high",
  "articleContent": "For article bot only - content of the article",
  "studentLevel": "beginner" | "intermediate" | "advanced",
  "previousContext": "Optional previous assessment conversation"
}`}</pre>
            <p>Generate tailored system prompts for different bots in the platform.</p>
            
            <h3>Text Analysis</h3>
            <pre className="bg-slate-100 p-2 rounded">{`POST /api/claude/analyze
{
  "text": "Content to analyze",
  "type": "summary" | "sentiment" | "difficulty" | "explain"
}`}</pre>
            <p>Analyze text using Claude's capabilities - summarize content, analyze sentiment, evaluate difficulty, or explain concepts.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <p>
              This application includes security middleware designed for safe embedding in Learning Management Systems
              (LMS) like Canvas and Blackboard:
            </p>
            <ul>
              <li><strong>Content Security Policy (CSP)</strong> - Configured for secure iframe embedding</li>
              <li><strong>Cross-Origin Resource Sharing (CORS)</strong> - Set up to work specifically with LMS domains</li>
              <li><strong>Secure Cookies</strong> - Configured with appropriate SameSite policy for iframe embedding</li>
              <li><strong>Session Management</strong> - Ensures data isolation between different users/sessions</li>
              <li><strong>Database Fallback</strong> - The application will continue to work even if database connectivity is lost</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Using Claude in Components</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <p>
              To use Claude in your React components, you can make fetch requests to the provided endpoints.
              Here's a basic example:
            </p>
            <pre className="bg-slate-100 p-2 rounded">{`const response = await fetch('/api/claude/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: userMessage }],
    systemPrompt: 'You are a helpful assistant...',
    threadId: 'my-conversation-thread'
  }),
});

const data = await response.json();
if (data.success && data.message) {
  // Handle Claude's response
  console.log(data.message);
}`}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}