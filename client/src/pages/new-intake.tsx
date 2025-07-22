import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Check, Circle } from "lucide-react";
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

function IntakeChat({ stage, onComponentComplete }: IntakeChatProps) {
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
  const [criteria, setCriteria] = useState<CriteriaState>({
    schoolDistrict: { detected: false, value: null, confidence: 0 },
    school: { detected: false, value: null, confidence: 0 },
    subject: { detected: false, value: null, confidence: 0 },
    topic: { detected: false, value: null, confidence: 0 },
    gradeLevel: { detected: false, value: null, confidence: 0 },
    learningObjectives: { detected: false, value: null, confidence: 0 },
  });

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

      // Trigger background analysis after bot response is complete
      if (botResponse) {
        analyzeConversation(botResponse);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content:
            "I'm sorry, I'm having trouble processing your response. Could you try again?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
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
          setCriteria(prev => {
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
    <div className="h-full flex gap-4">
      {/* Criteria Sidebar */}
      <Card className="w-80 flex-shrink-0">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">Progress</h3>
          <p className="text-sm text-gray-500">Information collected</p>
        </div>
        <div className="p-4 space-y-3">
          {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
            const criterion = criteria[key as keyof CriteriaState];
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                  criterion.detected 
                    ? "bg-green-100 text-green-600" 
                    : "bg-gray-100 text-gray-400"
                )}>
                  {criterion.detected ? (
                    <Check className="w-4 h-4 animate-in zoom-in duration-300" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    criterion.detected ? "text-green-700" : "text-gray-700"
                  )}>
                    {label}
                  </p>
                  {criterion.detected && criterion.value && (
                    <p className="text-xs text-green-600 mt-1 animate-in slide-in-from-top-1 duration-300">
                      {criterion.value}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isBot ? "" : "flex-row-reverse"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isBot
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {message.isBot ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">U</span>
                )}
              </div>
              <div
                className={`max-w-[80%] ${message.isBot ? "" : "text-right"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.isBot
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
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
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
      </Card>
    </div>
  );
}

export default function NewIntake() {
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

  const currentStage = stages[0]; // For now, just show Stage 1

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
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
          <div className="flex-1">
            <Card className="p-6 bg-white mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Stage {currentStage.id}: {currentStage.title}
              </h1>
              <p className="text-gray-600">{currentStage.description}</p>
            </Card>

            <div className="h-[600px]">
              <IntakeChat
                stage={currentStage}
                onComponentComplete={handleComponentComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
