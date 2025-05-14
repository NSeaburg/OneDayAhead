import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MessageSquare, Check, AlertCircle } from 'lucide-react';

export default function ClaudeTestPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a fresh, fun, interesting learning assistant. You discussing the content of an article about the three branches of government in the United States. Provide clear, concise answers to questions about these government branches or related topics. You aim for a quick back and forth conversation, aiming to limit most responses to 3 sentences or less. You push students to deepen their thinking and you ask them engaging questions.'
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simple direct query to Claude API
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt,
          threadId: 'test-thread-' + Date.now()
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.message) {
        setResponse(data.message);
      } else {
        setError(data.error || 'Failed to get response from Claude');
      }
    } catch (error) {
      console.error('Error communicating with API:', error);
      setError('Error communicating with API');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Claude 3.7 Sonnet Test</h1>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send a message to Claude</CardTitle>
          <CardDescription>
            Test Claude 3.7 Sonnet without database connectivity
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Prompt</label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Your Message</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your message to Claude here..."
                className="min-h-20"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Getting response...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send to Claude
                </>
              )}
            </Button>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {response && !error && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Claude's Response:</h3>
              <div className="p-4 bg-slate-50 rounded-md border whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="text-xs text-gray-500">
          Using Claude 3.7 Sonnet model released February 2025
        </CardFooter>
      </Card>
    </div>
  );
}