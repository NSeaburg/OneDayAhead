import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Check, Circle, Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  type: "explicit" | "implicit" | "bot-assisted" | "file-upload";
  note?: string;
}

interface IntakeChatProps {
  stage: Stage;
  onComponentComplete: (componentId: string) => void;
  onCriteriaUpdate: (updater: (prev: CriteriaState) => CriteriaState) => void;
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface CriteriaState {
  schoolDistrict: { detected: boolean; value: string | null; confidence: number };
  school: { detected: boolean; value: string | null; confidence: number };
  subject: { detected: boolean; value: string | null; confidence: number };
  topic: { detected: boolean; value: string | null; confidence: number };
  gradeLevel: { detected: boolean; value: string | null; confidence: number };
  learningObjectives: { detected: boolean; value: string | null; confidence: number };
}

const CRITERIA_LABELS = {
  schoolDistrict: "School District",
  school: "School Name", 
  subject: "Subject Area",
  topic: "Topic/Unit",
  gradeLevel: "Grade Level",
  learningObjectives: "Learning Objectives"
} as const;

function IntakeChat({ stage, onComponentComplete, onCriteriaUpdate }: IntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm here to help you build an AI-powered learning experience that drops right into your existing course. It will take about 10 minutes, and we'll build the whole thing together by chatting.\n\n If you haven't watched the 30 second video above, I really recommend it.\n\n Ready to begin?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>(
    {},
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change (same as successful bots)
  useEffect(() => {
    const messageContainer = messagesEndRef.current?.closest('.overflow-y-auto');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send to chat endpoint for processing
      const response = await fetch("/api/claude/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.isBot ? "assistant" : "user",
              content: msg.content,
            })),
            { role: "user", content: userMessage.content },
          ],
          assistantType: "intake-basics",
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let botResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                botResponse += parsed.content;

                // Update bot message in real time
                setMessages((prev) => {
                  const withoutLastBot = prev.filter(
                    (msg) => !(msg.isBot && msg.id === "streaming"),
                  );
                  return [
                    ...withoutLastBot,
                    {
                      id: "streaming",
                      content: botResponse,
                      isBot: true,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            } catch (e) {
              // Ignore JSON parsing errors for streaming
            }
          }
        }
      }

      // Replace streaming message with final message with permanent ID
      if (botResponse) {
        setMessages((prev) => {
          const withoutStreaming = prev.filter((msg) => msg.id !== "streaming");
          return [
            ...withoutStreaming,
            {
              id: Date.now().toString(),
              content: botResponse,
              isBot: true,
              timestamp: new Date(),
            },
          ];
        });

        // Trigger background analysis after bot response is complete
        analyzeConversation(botResponse);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const withoutStreaming = prev.filter((msg) => msg.id !== "streaming");
        return [
          ...withoutStreaming,
          {
            id: Date.now().toString(),
            content:
              "I'm sorry, I'm having trouble processing your response. Could you try again?",
            isBot: true,
            timestamp: new Date(),
          },
        ];
      });
    }

    setIsLoading(false);
  };

  // Background analysis function
  const analyzeConversation = async (botResponse: string) => {
    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.content,
      }));

      const response = await fetch("/api/intake/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          botResponse,
          conversationHistory,
        }),
      });

      if (response.ok) {
        const analysisResult = await response.json();
        
        // Update criteria state with analysis results
        if (analysisResult.criteria) {
          onCriteriaUpdate((prev: CriteriaState) => {
            const updated = { ...prev };
            Object.keys(analysisResult.criteria).forEach((key) => {
              const criterion = analysisResult.criteria[key];
              if (criterion.detected && criterion.confidence > 0.7) {
                updated[key as keyof CriteriaState] = criterion;
              }
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      // Fail silently - analysis is not critical to conversation flow
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 min-h-0">
      {/* Chat Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Intake Assistant
            </h3>
            <p className="text-sm text-gray-500">
              Let's gather your course information
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area - Uses same structure as successful Reggie bot */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-start mb-1">
              {message.isBot ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
              <span className="text-xs text-gray-500 mt-1">
                {message.isBot ? 'Intake Assistant' : 'You'}
              </span>
            </div>
            <div className={`ml-10 ${
              message.isBot 
                ? 'bg-gray-100 border border-gray-200' 
                : 'bg-blue-600 text-white border border-blue-600'
            } rounded-lg p-3 text-gray-700 ${message.isBot ? '' : 'text-white'} inline-block w-fit min-w-[60px]`}>
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col">
            <div className="flex items-start mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 mt-1">
                Intake Assistant
              </span>
            </div>
            <div className="ml-10 bg-gray-100 border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reference for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewIntake() {
  const [criteria, setCriteria] = useState<CriteriaState>({
    schoolDistrict: { detected: false, value: null, confidence: 0 },
    school: { detected: false, value: null, confidence: 0 },
    subject: { detected: false, value: null, confidence: 0 },
    topic: { detected: false, value: null, confidence: 0 },
    gradeLevel: { detected: false, value: null, confidence: 0 },
    learningObjectives: { detected: false, value: null, confidence: 0 },
  });
  
  const [stages, setStages] = useState<Stage[]>([
    {
      id: 1,
      title: "The Basics",
      description: "Let's get to know each other",
      components: [
        {
          id: "district",
          title: "School District",
          completed: false,
          type: "explicit",
          note: "or N/A",
        },
        { id: "school", title: "School", completed: false, type: "explicit" },
        { id: "subject", title: "Subject", completed: false, type: "explicit" },
        { id: "topic", title: "Topic", completed: false, type: "explicit" },
        {
          id: "grade",
          title: "Grade Level",
          completed: false,
          type: "explicit",
        },
        {
          id: "objectives",
          title: "Learning Objectives",
          completed: false,
          type: "bot-assisted",
        },
      ],
    },
    {
      id: 2,
      title: "Context Collection",
      description: "What have your students already done in this course?",
      components: [
        {
          id: "existing-resources",
          title: "Existing Resources",
          completed: false,
          type: "file-upload",
          note: "PDFs, videos, articles",
        },
        {
          id: "student-work",
          title: "Student Work Samples",
          completed: false,
          type: "file-upload",
          note: "optional",
        },
      ],
      hasTestButton: false,
    },
    // ... other stages would go here
  ]);

  const handleComponentComplete = (componentId: string) => {
    setStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        components: stage.components.map((comp) =>
          comp.id === componentId ? { ...comp, completed: true } : comp,
        ),
      })),
    );
  };

  const handleCriteriaUpdate = (updater: (prev: CriteriaState) => CriteriaState) => {
    setCriteria(updater);
  };

  const currentStage = stages[0]; // For now, just show Stage 1

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="flex gap-8 flex-1">
          {/* Left Sidebar */}
          <div className="w-80 space-y-4">
            <Card className="p-4 bg-white">
              <h2 className="font-semibold text-lg mb-2">Content Creator</h2>
              <p className="text-sm text-gray-600 mb-4">
                Uplevel your Course with AI
              </p>

              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isActive = index === 0; // For now, only first stage is active
                  const completedCount = stage.components.filter(
                    (c) => c.completed,
                  ).length;

                  return (
                    <div
                      key={stage.id}
                      className={`border rounded-lg p-3 ${isActive ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {stage.id}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{stage.title}</h3>
                          <p className="text-xs text-gray-500">
                            {completedCount}/{stage.components.length}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        {stage.description}
                      </p>

                      {/* For Stage 1, show dynamic progress criteria */}
                      {stage.id === 1 ? (
                        <div className="space-y-2">
                          {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                            const criterion = criteria[key as keyof CriteriaState];
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <div className={cn(
                                  "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                                  criterion.detected 
                                    ? "bg-green-500 text-white" 
                                    : "bg-gray-300 text-gray-500"
                                )}>
                                  {criterion.detected ? (
                                    <Check className="w-3 h-3 animate-in zoom-in duration-300" />
                                  ) : (
                                    <Circle className="w-2 h-2" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className={cn(
                                    "text-xs transition-colors",
                                    criterion.detected ? "text-green-700 font-medium" : "text-gray-700"
                                  )}>
                                    {label}
                                  </span>
                                  {criterion.detected && criterion.value && (
                                    <div className="text-xs text-green-600 mt-0.5 animate-in slide-in-from-top-1 duration-300 truncate">
                                      {criterion.value}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {stage.components.map((component) => (
                            <div
                              key={component.id}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  component.completed
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              />
                              <div className="flex-1">
                                <span className="text-xs text-gray-700">
                                  {component.title}
                                </span>
                                {component.note && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({component.note})
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {stage.hasTestButton && (
                        <Button size="sm" className="w-full mt-3">
                          {stage.testButtonText || "Test"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Card className="p-6 bg-white mb-6 flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Stage {currentStage.id}: {currentStage.title}
              </h1>
              <p className="text-gray-600">{currentStage.description}</p>
            </Card>

            <div className="flex-1 min-h-0">
              <IntakeChat
                stage={currentStage}
                onComponentComplete={handleComponentComplete}
                onCriteriaUpdate={handleCriteriaUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
