import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Sparkles, Check, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  threadId?: string;
  model?: string;
}

export default function ClaudeHelper() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful educational assistant.');
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [apiStatus, setApiStatus] = useState('');
  const [threadId, setThreadId] = useState(`thread-${Date.now()}`);
  const [activeTab, setActiveTab] = useState('chat');
  const [currentModel, setCurrentModel] = useState('claude-3-7-sonnet-20250219');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [promptType, setPromptType] = useState('article');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [articleContent, setArticleContent] = useState(
    'The Three Branches of Government: How the Pieces Fit Together. When the Founders wrote the Constitution, they wanted to make sure no one person or group had too much power. Their solution was to create three branches of government, each with different powers: Legislative (makes laws), Executive (carries out laws), and Judicial (interprets laws).'
  );

  // Check API availability on component mount
  useEffect(() => {
    async function checkApiHealth() {
      try {
        const response = await fetch('/api/claude/health');
        const data = await response.json();
        setApiStatus(data.response);
        setApiAvailable(data.status === 'available');
        if (data.model) {
          setCurrentModel(data.model);
        }
      } catch (error) {
        console.error('Error checking API health:', error);
        setApiAvailable(false);
        setApiStatus('Error connecting to Claude API');
      }
    }
    
    checkApiHealth();
  }, []);
  
  // Function to generate a system prompt
  async function generateSystemPrompt() {
    if (!promptType) return;
    
    setGeneratingPrompt(true);
    
    try {
      const response = await fetch('/api/claude/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botType: promptType,
          articleContent: articleContent,
          studentLevel: 'intermediate',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.systemPrompt) {
        setSystemPrompt(data.systemPrompt);
        setApiResponse({
          success: true,
          length: data.length,
          botType: data.botType,
        });
      } else {
        setApiResponse({
          success: false,
          error: data.error || 'Failed to generate system prompt',
        });
      }
    } catch (error) {
      setApiResponse({
        success: false,
        error: 'Error connecting to API',
      });
    } finally {
      setGeneratingPrompt(false);
    }
  }
  
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!prompt.trim() || loading) return;
    
    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);
    
    try {
      const allMessages = [...messages, userMessage];
      
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages,
          systemPrompt,
          threadId,
          model: currentModel
        }),
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.message) {
        // Ensure we handle the message as a string
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.message || 'No response content' 
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.threadId && data.threadId !== threadId) {
          setThreadId(data.threadId);
        }
        
        setApiResponse({
          success: true,
          length: data.message.length,
          model: data.model,
        });
      } else {
        setApiResponse({
          success: false,
          error: data.error || 'Failed to get response',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setApiResponse({
        success: false,
        error: 'Error connecting to API',
      });
    } finally {
      setLoading(false);
    }
  }
  
  function resetConversation() {
    setMessages([]);
    setThreadId(`thread-${Date.now()}`);
    setApiResponse(null);
  }
  
  // Render markdown content with basic formatting
  function renderMarkdown(content: string) {
    // This is extremely basic, for a real app consider using react-markdown
    return (
      <div className="whitespace-pre-wrap">
        {content
          .split('\n')
          .map((line, i) => {
            if (line.startsWith('# ')) {
              return <h1 key={i} className="text-xl font-bold mt-2 mb-1">{line.substring(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-lg font-bold mt-2 mb-1">{line.substring(3)}</h2>;
            }
            if (line.startsWith('* ')) {
              return <li key={i} className="ml-4">{line.substring(2)}</li>;
            }
            return <p key={i} className={line.trim() === '' ? 'my-2' : ''}>{line}</p>;
          })}
      </div>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Claude 3.7 Sonnet Helper</CardTitle>
        <CardDescription>
          Interact with Claude 3.7 Sonnet for educational content generation
        </CardDescription>
        
        {apiAvailable === true && (
          <Alert variant="default" className="bg-green-50 border-green-300">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Claude API Connected</AlertTitle>
            <AlertDescription>
              {apiStatus || "Model is ready to use"}
            </AlertDescription>
          </Alert>
        )}
        
        {apiAvailable === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Unavailable</AlertTitle>
            <AlertDescription>
              {apiStatus || "Cannot connect to Claude API"}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto">
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Prompts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">System Prompt:</h3>
              <Button variant="ghost" size="sm" onClick={resetConversation}>
                New Chat
              </Button>
            </div>
            <Textarea
              placeholder="System instructions for Claude..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-20"
            />
          </div>
          
          <div className="chat-messages space-y-4 max-h-96 overflow-y-auto mb-4 p-2 border rounded-md">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Send a message to start a conversation with Claude
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {msg.role === 'user' ? 'You' : 'Claude'}
                  </p>
                  {renderMarkdown(msg.content)}
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading || !apiAvailable}
            />
            <Button type="submit" disabled={loading || !apiAvailable}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="prompts" className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bot Type</label>
              <Select value={promptType} onValueChange={setPromptType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article Discussion Bot</SelectItem>
                  <SelectItem value="assessment">Assessment Bot (Reginald)</SelectItem>
                  <SelectItem value="teaching-low">Teaching Bot - Low (Mr. Whitaker)</SelectItem>
                  <SelectItem value="teaching-medium">Teaching Bot - Medium (Mrs. Bannerman)</SelectItem>
                  <SelectItem value="teaching-high">Teaching Bot - High (Mrs. Parton)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {promptType === 'article' && (
              <div>
                <label className="block text-sm font-medium mb-1">Article Content</label>
                <Textarea
                  placeholder="Paste article content here..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="min-h-20"
                />
              </div>
            )}
            
            <Button
              onClick={generateSystemPrompt}
              disabled={generatingPrompt || !apiAvailable}
              className="w-full"
            >
              {generatingPrompt ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating System Prompt...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate System Prompt
                </>
              )}
            </Button>
            
            {apiResponse && (
              <div className={`p-3 rounded-lg ${
                apiResponse.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {apiResponse.success ? (
                  <div>
                    <h3 className="font-medium">System Prompt Generated!</h3>
                    <p>Length: {apiResponse.length} characters</p>
                    <p>Bot Type: {apiResponse.botType}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-red-700">Error</h3>
                    <p>{apiResponse.error}</p>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Generated System Prompt</label>
              <Textarea
                value={systemPrompt}
                readOnly
                className="min-h-40"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="text-sm text-gray-500 flex justify-between border-t p-4 mt-2">
        <div>
          Using model: {currentModel}
        </div>
        <div>
          Thread ID: {threadId}
        </div>
      </CardFooter>
    </Card>
  );
}