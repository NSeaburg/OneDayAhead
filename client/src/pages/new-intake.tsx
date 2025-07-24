import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Check, Circle, Send, User, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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
  botType: string;
  stageContext: Record<string, any>;
  onComponentComplete: (componentId: string) => void;
  onCriteriaUpdate: (updater: (prev: CriteriaState) => CriteriaState) => void;
  onStageProgression: (completionMessage: string) => void;
  uploadedFiles: UploadedFile[];
  onFileUpload: (file: UploadedFile) => void;
  onFileRemove: (fileId: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  processingYoutube: boolean;
  onYoutubeExtract: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  extractedContent?: string;
  interpretation?: string;
  processingStatus: 'processing' | 'completed' | 'error';
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface CriteriaState {
  schoolDistrict: { detected: boolean; value: string | null; confidence: number; finalValue?: string | null };
  school: { detected: boolean; value: string | null; confidence: number; finalValue?: string | null };
  subject: { detected: boolean; value: string | null; confidence: number; finalValue?: string | null };
  topic: { detected: boolean; value: string | null; confidence: number; finalValue?: string | null };
  gradeLevel: { detected: boolean; value: string | null; confidence: number; finalValue?: string | null };
}

const CRITERIA_LABELS = {
  schoolDistrict: "School District",
  school: "School Name", 
  subject: "Subject Area",
  topic: "Topic/Unit",
  gradeLevel: "Grade Level"
} as const;

function IntakeChat({ stage, botType, stageContext, onComponentComplete, onCriteriaUpdate, onStageProgression, uploadedFiles, onFileUpload, onFileRemove, youtubeUrl, setYoutubeUrl, processingYoutube, onYoutubeExtract }: IntakeChatProps) {
  // Generate initial message based on bot type and context
  const getInitialMessage = (): Message => {
    if (botType === "intake-context" && stageContext) {
      return {
        id: "1",
        content: "Perfect! Now that we have the basics covered, let's dive into the context of your course and gather some content materials.\n\nI'd love to understand how this topic fits into your broader curriculum. What have your students learned before this unit, and what comes after?",
        isBot: true,
        timestamp: new Date(),
      };
    } else {
      return {
        id: "1",
        content: "Hi! I'm here to help you build an AI-powered learning experience that drops right into your existing course. It will take about 10 minutes, and we'll build the whole thing together by chatting.\n\n If you haven't watched the 30 second video above, I really recommend it.\n\n Ready to begin?",
        isBot: true,
        timestamp: new Date(),
      };
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm here to help you build an AI-powered learning experience that drops right into your existing course. It will take about 10 minutes, and we'll build the whole thing together by chatting.\n\n If you haven't watched the 30 second video above, I really recommend it.\n\n Ready to begin?",
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

  // Handle bot type changes (when switching stages) - preserve conversation
  useEffect(() => {
    if (botType === "intake-context" && stageContext) {
      // Don't reset messages - the Stage 2 bot should continue seamlessly
      // The stage progression message already indicates the transition
      console.log("Stage 2 bot activated - preserving conversation continuity");
    }
  }, [botType]);

  // Handle file uploads - delegate to parent component's file handler
  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        processingStatus: 'processing'
      };

      onFileUpload(uploadedFile);

      // Process the file based on type
      try {
        const formData = new FormData();
        formData.append('file', file);

        let endpoint = '';
        if (file.type.includes('pdf')) {
          endpoint = '/api/intake/extract-pdf';
        } else if (file.type.includes('text')) {
          endpoint = '/api/intake/extract-text';
        } else {
          // For other file types, we'll just store basic info
          onFileUpload({
            ...uploadedFile,
            processingStatus: 'completed',
            extractedContent: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            interpretation: 'File uploaded successfully. Content will be available for the teaching bot to reference.'
          });
          continue;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          onFileUpload({
            ...uploadedFile,
            processingStatus: 'completed',
            extractedContent: result.text,
            interpretation: `Extracted text from ${file.name}. This content appears to be educational material that can be referenced by the AI assistant.`
          });

          // Send file interpretation to the bot
          if (botType === "intake-context") {
            const interpretationMessage: Message = {
              id: Date.now().toString(),
              content: `I've processed your uploaded file "${file.name}". Here's what I found:\n\n**File Type:** ${file.type}\n**Content Preview:** ${result.text.substring(0, 200)}...\n\nIs this the content you intended to upload? Should I use this material when building your learning experience?`,
              isBot: true,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, interpretationMessage]);
          }
        } else {
          onFileUpload({
            ...uploadedFile,
            processingStatus: 'error',
            interpretation: 'Failed to process file content.'
          });
        }
      } catch (error) {
        onFileUpload({
          ...uploadedFile,
          processingStatus: 'error',
          interpretation: 'Error processing file.'
        });
      }
    }
  };

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
          assistantType: botType,
          stageContext: stageContext,
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
        
        // Check for stage progression
        onStageProgression(botResponse);
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

      // Check if this is a summary message using the specific trigger phrase
      const isSummary = botResponse.includes("Ok! Here's what I've got so far");

      const response = await fetch("/api/intake/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          botResponse,
          conversationHistory,
          isSummary,
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
                // Always update detected status for green checkmarks
                updated[key as keyof CriteriaState] = {
                  ...updated[key as keyof CriteriaState],
                  detected: true,
                  confidence: criterion.confidence,
                  value: criterion.value, // Keep this for internal tracking
                  // Only set finalValue if this is a summary or if we already have finalValue
                  finalValue: isSummary ? criterion.value : (updated[key as keyof CriteriaState]?.finalValue || null)
                };
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
              {message.isBot ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <div className="mb-2 last:mb-0">{children}</div>,
                      strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      br: () => <br />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              )}
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
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [currentBotType, setCurrentBotType] = useState<string>("intake-basics");
  const [stageContext, setStageContext] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [processingYoutube, setProcessingYoutube] = useState(false);
  const [criteria, setCriteria] = useState<CriteriaState>({
    schoolDistrict: { detected: false, value: null, confidence: 0, finalValue: null },
    school: { detected: false, value: null, confidence: 0, finalValue: null },
    subject: { detected: false, value: null, confidence: 0, finalValue: null },
    topic: { detected: false, value: null, confidence: 0, finalValue: null },
    gradeLevel: { detected: false, value: null, confidence: 0, finalValue: null },
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
      ],
    },
    {
      id: 2,
      title: "Context Collection",
      description: "What have your students already done in this course?",
      components: [
        {
          id: "student-resources",
          title: "Student Facing Resources",
          completed: false,
          type: "file-upload",
          note: "Drag and drop all file types",
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

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles(prev => {
      const existingIndex = prev.findIndex(f => f.id === file.id);
      if (existingIndex >= 0) {
        // Update existing file
        const updated = [...prev];
        updated[existingIndex] = file;
        return updated;
      } else {
        // Add new file
        return [...prev, file];
      }
    });
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle YouTube URL extraction
  const handleYoutubeExtract = async () => {
    if (!youtubeUrl.trim() || processingYoutube) return;

    setProcessingYoutube(true);
    
    try {
      const response = await fetch('/api/intake/extract-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const result = await response.json();
      
      if (result.success) {
        const youtubeFile: UploadedFile = {
          id: Date.now().toString(),
          name: result.title || 'YouTube Video',
          type: 'video/youtube',
          size: 0,
          processingStatus: 'completed',
          extractedContent: result.transcript,
          interpretation: `Extracted transcript from YouTube video: "${result.title}". This appears to be educational content that students will reference in their learning.`
        };

        handleFileUpload(youtubeFile);
        setYoutubeUrl("");
      } else {
        console.error('YouTube extraction failed:', result.error);
      }
    } catch (error) {
      console.error('YouTube extraction error:', error);
    }

    setProcessingYoutube(false);
  };

  const handleStageProgression = (completionMessage: string) => {
    // Check if the bot is moving to the next stage
    if (completionMessage.includes("Great! Let's move on to understanding the content of your course.")) {
      // Prepare context from Stage 1 for Stage 2
      const stage1Context = {
        schoolDistrict: criteria.schoolDistrict.finalValue || "Not specified",
        school: criteria.school.finalValue || "Not specified", 
        subject: criteria.subject.finalValue || "Not specified",
        topic: criteria.topic.finalValue || "Not specified",
        gradeLevel: criteria.gradeLevel.finalValue || "Not specified",
        completionMessage
      };
      
      // Switch to Stage 2
      setCurrentStageId(2);
      setCurrentBotType("intake-context");
      setStageContext(stage1Context);
    }
  };

  const currentStage = stages.find(stage => stage.id === currentStageId) || stages[0];

  return (
    <div className="h-screen p-2 md:p-4 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="mb-4 text-center flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Build Your AI Learning Experience
        </h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600">
          We'll build this together through conversation - it takes about 10 minutes
        </p>
      </div>

      {/* Main content area with sidebar and chat */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 min-h-0">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 overflow-y-auto">
          <div>
            <h2 className="font-semibold text-lg mb-2">Content Creator</h2>
            <p className="text-sm text-gray-600 mb-4">
              Uplevel your Course with AI
            </p>

            <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isActive = stage.id === currentStageId;
                  
                  // For completed stages (when we've moved beyond them), show them as fully completed
                  const shouldShowAsCompleted = currentStageId > stage.id;
                  
                  // Calculate completion count differently for Stage 1 (criteria-based) vs other stages
                  const completedCount = stage.id === 1 
                    ? Object.values(criteria).filter(criterion => criterion.finalValue !== null && criterion.finalValue !== undefined).length
                    : stage.components.filter((c) => c.completed).length;
                  
                  const isExpanded = isActive;

                  return (
                    <div
                      key={stage.id}
                      className={`border rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? "border-blue-200 bg-blue-50" 
                          : shouldShowAsCompleted 
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setCurrentStageId(stage.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : shouldShowAsCompleted
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {shouldShowAsCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            stage.id
                          )}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{stage.title}</h3>
                          <p className="text-xs text-gray-500">
                            {completedCount}/{stage.components.length}
                          </p>
                        </div>
                      </div>
                      {isExpanded && (
                        <p className="text-xs text-gray-600 mb-3">
                          {stage.description}
                        </p>
                      )}

                      {/* Expanded content - only show if stage is active */}
                      {isExpanded && (
                        <>
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
                                <div className="flex-1 min-w-0">
                                  <span className={cn(
                                    "text-xs transition-colors break-words",
                                    criterion.detected ? "text-green-700 font-medium" : "text-gray-700"
                                  )}>
                                    {label}
                                  </span>
                                  {criterion.detected && criterion.finalValue && (
                                    <div className="text-xs text-green-600 mt-0.5 animate-in slide-in-from-top-1 duration-300 break-words">
                                      {key === 'learningObjectives' ? (
                                        <div className="space-y-1">
                                          {criterion.finalValue.split(/\d+\./).filter(Boolean).map((objective: string, index: number) => (
                                            <div key={index} className="flex">
                                              <span className="mr-1">{index + 1}.</span>
                                              <span>{objective.trim()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        criterion.finalValue
                                      )}
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
                            <div key={component.id} className="space-y-2">
                              <div className="flex items-center gap-2">
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
                              
                              {/* Add file drop zone and YouTube URL input for Stage 2 file upload component */}
                              {stage.id === 2 && component.type === "file-upload" && (
                                <div className="ml-5 mt-2 space-y-3">
                                  <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
                                  />
                                  <label
                                    htmlFor="file-upload"
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer block"
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      const files = e.dataTransfer.files;
                                      if (files.length > 0) {
                                        handleFileUpload(files);
                                      }
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                  >
                                    <div className="text-center">
                                      <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                                      <div className="text-xs text-gray-500 mb-1">
                                        Drop files here or click to browse
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        PDF, DOC, TXT, images
                                      </div>
                                    </div>
                                  </label>
                                  
                                  {/* Show uploaded files */}
                                  {uploadedFiles.length > 0 && (
                                    <div className="space-y-1">
                                      {uploadedFiles.map((file) => (
                                        <div key={file.id} className="flex items-center gap-2 text-xs bg-gray-100 p-2 rounded">
                                          <div className="flex-1">
                                            <div className="font-medium">{file.name}</div>
                                            <div className="text-gray-500">
                                              {file.processingStatus === 'processing' && 'Processing...'}
                                              {file.processingStatus === 'completed' && '✓ Processed'}
                                              {file.processingStatus === 'error' && '⚠ Error'}
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => onFileRemove(file.id)}
                                            className="text-gray-400 hover:text-red-500"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <div className="text-xs text-gray-600 font-medium">
                                      YouTube Video URL
                                    </div>
                                    <div className="flex gap-2">
                                      <input
                                        type="url"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="Paste YouTube URL here..."
                                        className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                      <button
                                        onClick={onYoutubeExtract}
                                        disabled={!youtubeUrl.trim() || processingYoutube}
                                        className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {processingYoutube ? 'Processing...' : 'Extract'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                          {stage.hasTestButton && (
                            <Button size="sm" className="w-full mt-3">
                              {stage.testButtonText || "Test"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right column - Chat Interface */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          <IntakeChat
            stage={currentStage}
            botType={currentBotType}
            stageContext={stageContext}
            onComponentComplete={handleComponentComplete}
            onCriteriaUpdate={handleCriteriaUpdate}
            onStageProgression={handleStageProgression}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            processingYoutube={processingYoutube}
            onYoutubeExtract={handleYoutubeExtract}
          />
        </div>
      </div>
    </div>
  );
}
