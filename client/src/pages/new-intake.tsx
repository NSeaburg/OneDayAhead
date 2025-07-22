import { useState } from "react";
import { Check, ChevronDown, ChevronRight, TestTube, ExternalLink, Settings, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Stage {
  id: number;
  title: string;
  description: string;
  components: Component[];
  hasTestButton?: boolean;
  testButtonText?: string;
}

interface Component {
  id: string;
  title: string;
  completed: boolean;
  type: 'explicit' | 'implicit' | 'bot-assisted' | 'file-upload';
  note?: string;
}

interface IntakeChatProps {
  stage: Stage;
  onComponentComplete: (componentId: string) => void;
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

function IntakeChat({ stage, onComponentComplete }: IntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! Before we begin building, let's get some basics down. Tell me a little about your teaching situation. What subject are we working with?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send to chat endpoint for processing
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            stage: 'intake-basics',
            collectedData,
            completedComponents: stage.components.filter(c => c.completed).map(c => c.id)
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let botResponse = '';
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                botResponse += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessage.id 
                    ? { ...msg, content: botResponse }
                    : msg
                ));
              }
            } catch (e) {
              // Ignore JSON parsing errors for streaming
            }
          }
        }
      }

      // TODO: Parse response for component completion signals
      // For now, simulate completion after getting answers
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: "I'm sorry, I'm having trouble processing your response. Could you try again?",
        isBot: true,
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Content Creation Assistant</h3>
            <p className="text-sm text-gray-500">Let's design your learning experience together</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.isBot ? '' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isBot 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.isBot ? <Bot className="w-4 h-4" /> : <span className="text-sm font-medium">U</span>}
              </div>
              <div className={`max-w-[80%] ${message.isBot ? '' : 'text-right'}`}>
                <div className={`rounded-lg px-4 py-2 ${
                  message.isBot 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

const stages: Stage[] = [
  {
    id: 1,
    title: "The Basics",
    description: "Let's get to know each other",
    components: [
      { id: "school-district", title: "School District", completed: false, type: 'explicit', note: "or N/A" },
      { id: "school", title: "School", completed: false, type: 'explicit' },
      { id: "subject", title: "Subject", completed: false, type: 'explicit' },
      { id: "topic", title: "Topic", completed: false, type: 'explicit' },
      { id: "grade-level", title: "Grade Level", completed: false, type: 'explicit' },
      { id: "learning-objectives", title: "Learning Objectives", completed: false, type: 'explicit' },
    ]
  },
  {
    id: 2,
    title: "Context Collection",
    description: "What have your students already done in this course?",
    components: [
      { id: "course-context", title: "Course Context", completed: false, type: 'bot-assisted', note: "bot-filled text" },
      { id: "immediate-prep", title: "Immediate Preparation", completed: false, type: 'bot-assisted', note: "what they just did" },
      { id: "file-uploads", title: "Content Files", completed: false, type: 'file-upload', note: "YouTube, PDFs, text" },
    ],
    hasTestButton: true,
    testButtonText: "Test File Processing"
  },
  {
    id: 3,
    title: "Assessment Bot",
    description: "Design the evaluation character and criteria",
    components: [
      { id: "assessment-character", title: "Assessment Character", completed: false, type: 'explicit' },
      { id: "evaluation-criteria", title: "Evaluation Criteria", completed: false, type: 'explicit' },
      { id: "question-types", title: "Question Types", completed: false, type: 'implicit' },
      { id: "scoring-rubric", title: "Scoring Rubric", completed: false, type: 'implicit' },
    ],
    hasTestButton: true,
    testButtonText: "Test Assessment Bot"
  },
  {
    id: 4,
    title: "Teaching Assistants",
    description: "Create differentiated teaching bots",
    components: [
      { id: "routing-logic", title: "Routing Logic", completed: false, type: 'explicit' },
      { id: "high-level-bot", title: "High-Level Teaching Bot", completed: false, type: 'explicit' },
      { id: "medium-level-bot", title: "Medium-Level Teaching Bot", completed: false, type: 'explicit' },
      { id: "low-level-bot", title: "Low-Level Teaching Bot", completed: false, type: 'explicit' },
      { id: "teaching-strategies", title: "Teaching Strategies", completed: false, type: 'implicit' },
    ],
    hasTestButton: true,
    testButtonText: "Test Routing Logic"
  },
  {
    id: 5,
    title: "Final Configuration",
    description: "Polish and prepare for launch",
    components: [
      { id: "ui-customization", title: "UI Customization", completed: false, type: 'implicit' },
      { id: "feedback-system", title: "Feedback System", completed: false, type: 'implicit' },
      { id: "final-review", title: "Final Review", completed: false, type: 'explicit' },
    ],
    hasTestButton: true,
    testButtonText: "Test Full Experience"
  }
];

export default function NewIntake() {
  const [currentStage, setCurrentStage] = useState(1);
  const [expandedStages, setExpandedStages] = useState<number[]>([1]);
  const [stageData, setStageData] = useState(stages);

  const toggleStageExpanded = (stageId: number) => {
    setExpandedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const canNavigateToStage = (stageId: number) => {
    // Can always go backwards or to current stage
    if (stageId <= currentStage) return true;
    
    // Can only go forward if previous stage is complete
    const previousStage = stageData.find(s => s.id === stageId - 1);
    if (!previousStage) return false;
    
    const explicitComponents = previousStage.components.filter(c => c.type === 'explicit');
    
    // If no explicit components, stage is always navigable
    if (explicitComponents.length === 0) return true;
    
    return explicitComponents.every(c => c.completed);
  };

  const getStageProgress = (stage: Stage) => {
    const explicitComponents = stage.components.filter(c => c.type === 'explicit');
    const completedExplicit = explicitComponents.filter(c => c.completed).length;
    
    // If there are no explicit components, the stage is never "complete" by default
    const hasExplicitComponents = explicitComponents.length > 0;
    
    return {
      completed: completedExplicit,
      total: explicitComponents.length,
      isComplete: hasExplicitComponents && completedExplicit === explicitComponents.length
    };
  };

  const handleStageNavigation = (stageId: number) => {
    if (canNavigateToStage(stageId)) {
      setCurrentStage(stageId);
      if (!expandedStages.includes(stageId)) {
        setExpandedStages(prev => [...prev, stageId]);
      }
    }
  };

  const handleTestStage = (stageId: number) => {
    // TODO: Implement test functionality
    console.log(`Testing stage ${stageId}`);
  };

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Content Creator</h1>
          <p className="text-sm text-gray-600 mt-1">Uplevel your Course with AI</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {stageData.map((stage) => {
            const progress = getStageProgress(stage);
            const isExpanded = expandedStages.includes(stage.id);
            const canNavigate = canNavigateToStage(stage.id);
            const isCurrentStage = stage.id === currentStage;
            
            return (
              <div key={stage.id} className="space-y-1">
                {/* Stage Header */}
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isCurrentStage 
                      ? 'bg-blue-50 border border-blue-200' 
                      : canNavigate 
                        ? 'hover:bg-gray-50' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleStageNavigation(stage.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStageExpanded(stage.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? 
                      <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    }
                  </button>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      progress.isComplete 
                        ? 'bg-green-100 text-green-700' 
                        : isCurrentStage
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {progress.isComplete ? <Check className="w-3 h-3" /> : stage.id}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          canNavigate ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {stage.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          progress.isComplete 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        canNavigate ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Stage Components */}
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    {stage.components.map((component) => (
                      <div 
                        key={component.id}
                        className={`flex items-center gap-3 p-2 rounded text-sm cursor-pointer transition-colors ${
                          component.completed 
                            ? 'text-green-700 hover:bg-green-50' 
                            : component.type === 'explicit'
                              ? 'text-gray-700 hover:bg-gray-50'
                              : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          component.completed 
                            ? 'bg-green-100 text-green-700' 
                            : component.type === 'explicit'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {component.completed ? <Check className="w-2.5 h-2.5" /> : '•'}
                        </div>
                        <span>{component.title}</span>
                        {component.note && (
                          <span className="text-xs text-gray-400 ml-auto">{component.note}</span>
                        )}
                      </div>
                    ))}
                    
                    {/* Test Button */}
                    {stage.hasTestButton && (
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-center gap-2"
                          onClick={() => handleTestStage(stage.id)}
                          disabled={!progress.isComplete}
                        >
                          <TestTube className="w-3 h-3" />
                          {stage.testButtonText}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Stage {currentStage}: {stageData.find(s => s.id === currentStage)?.title}
          </h2>
          <p className="text-gray-600 mt-1">
            {stageData.find(s => s.id === currentStage)?.description}
          </p>
        </div>
        
        <div className="flex-1 p-6">
          {currentStage === 1 ? (
            <IntakeChat 
              stage={stageData.find(s => s.id === 1)!}
              onComponentComplete={(componentId: string) => {
                setStageData(prev => prev.map(stage => 
                  stage.id === 1 
                    ? {
                        ...stage,
                        components: stage.components.map(comp =>
                          comp.id === componentId ? { ...comp, completed: true } : comp
                        )
                      }
                    : stage
                ));
              }}
            />
          ) : (
            <Card className="h-full p-6">
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Stage {currentStage} Content</h3>
                  <p>Stage {currentStage} interface will be implemented later</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      {/* Quick Navigation */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          onClick={() => window.open('/admin/dashboard', '_blank')}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin Dashboard
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
        <Button
          onClick={() => window.open('/', '_blank')}
          variant="outline"
          className="shadow-lg bg-white"
          size="sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Student Experience
        </Button>
      </div>
    </div>
  );
}