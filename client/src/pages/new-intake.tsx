import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Check, Circle, Send, User, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { IntakeCard, CompletedIntakeCard } from "@/components/IntakeCard";
import { PersonalityTestingBot } from "@/components/PersonalityTestingBot";
import { AvatarSelection } from "@/components/AvatarSelection";
import { AvatarButtons } from "@/components/AvatarButtons";

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
  currentStageId: number;
  onAvatarGenerated?: (avatarUrl: string) => void;
  botName?: string | null;
  botVisualDescription?: string | null;
  setBotVisualDescription?: (description: string | null) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  extractedContent?: string;
  interpretation?: string;
  processingStatus: "processing" | "completed" | "error";
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  cardData?: Record<string, string>; // For completed intake cards
}

interface CriteriaState {
  schoolDistrict: {
    detected: boolean;
    value: string | null;
    confidence: number;
    finalValue?: string | null;
  };
  school: {
    detected: boolean;
    value: string | null;
    confidence: number;
    finalValue?: string | null;
  };
  subject: {
    detected: boolean;
    value: string | null;
    confidence: number;
    finalValue?: string | null;
  };
  topic: {
    detected: boolean;
    value: string | null;
    confidence: number;
    finalValue?: string | null;
  };
  gradeLevel: {
    detected: boolean;
    value: string | null;
    confidence: number;
    finalValue?: string | null;
  };
}

const CRITERIA_LABELS = {
  schoolDistrict: "School District",
  school: "School Name",
  subject: "Subject Area",
  topic: "Topic/Unit",
  gradeLevel: "Grade Level",
} as const;

function IntakeChat({
  stage,
  botType,
  stageContext,
  onComponentComplete,
  onCriteriaUpdate,
  onStageProgression,
  uploadedFiles,
  onFileUpload,
  onFileRemove,
  currentStageId,
  onAvatarGenerated,
  botName,
  botVisualDescription,
  setBotVisualDescription,
}: IntakeChatProps) {
  // Generate initial message based on bot type and context
  const getInitialMessage = (): Message => {
    if (botType === "intake-context" && stageContext) {
      // For Stage 2 bot, don't provide a static message - let the bot send its proactive welcome
      return {
        id: "initial-stage2",
        content: "",
        isBot: true,
        timestamp: new Date(),
      };
    } else {
      return {
        id: "1",
        content:
          "Hi! I'm here to help you build an AI-powered learning experience that drops right into your existing course. It will take about 10 minutes, and we'll build the whole thing together by chatting.\n\n If you haven't watched the 30 second video above, I really recommend it.\n\n Ready to begin?",
        isBot: true,
        timestamp: new Date(),
      };
    }
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const initial = getInitialMessage();
    return initial ? [initial] : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>(
    {},
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [pendingAvatarMessageId, setPendingAvatarMessageId] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarButtonMessageId, setAvatarButtonMessageId] = useState<string | null>(null);

  // Handle avatar selection
  const handleAvatarSelect = (selectedImageUrl: string) => {
    // Update the pending message with the selected avatar
    if (pendingAvatarMessageId) {
      setMessages(prev => prev.map(msg => 
        msg.id === pendingAvatarMessageId
          ? { 
              ...msg, 
              content: msg.content + `\n\n![Generated Avatar](${selectedImageUrl})\n\nThere's your bot! Looking great! 🎨`
            }
          : msg
      ));
    }
    
    // Notify parent component
    if (onAvatarGenerated) {
      onAvatarGenerated(selectedImageUrl);
    }
    
    // Close avatar selection
    setShowAvatarSelection(false);
    setAvatarPrompt("");
    setPendingAvatarMessageId(null);
    
    // Trigger stage progression to check for avatar completion
    const updatedMessage = messages.find(m => m.id === pendingAvatarMessageId)?.content || "";
    onStageProgression(updatedMessage + `\n\n![Generated Avatar](${selectedImageUrl})`);
  };

  const handleAvatarCancel = () => {
    // Add a message saying avatar generation was cancelled
    if (pendingAvatarMessageId) {
      setMessages(prev => prev.map(msg => 
        msg.id === pendingAvatarMessageId
          ? { 
              ...msg, 
              content: msg.content + "\n\nNo problem! We can continue without generating an avatar for now."
            }
          : msg
      ));
    }
    
    setShowAvatarSelection(false);
    setAvatarPrompt("");
    setPendingAvatarMessageId(null);
  };

  // Handle avatar button actions
  const handleCreateAvatar = async () => {
    if (!avatarButtonMessageId) return;

    setIsGeneratingAvatar(true);
    
    try {
      // Extract visual description from the message with the buttons
      const buttonMessage = messages.find(m => m.id === avatarButtonMessageId);
      if (!buttonMessage) return;

      // Extract visual description from current bot response
      const extractResponse = await fetch("/api/intake/extract-bot-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ botResponse: buttonMessage.content }),
      });

      let avatarPrompt = "";
      if (extractResponse.ok) {
        const extractionData = await extractResponse.json();
        avatarPrompt = extractionData.visualDescription || `${botName || "educational assessment bot"}, friendly cartoon character`;
        setBotVisualDescription && setBotVisualDescription(extractionData.visualDescription);
      } else {
        avatarPrompt = `${botName || "educational assessment bot"}, friendly cartoon character`;
      }

      // Generate single image
      const imageResponse = await fetch("/api/intake/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          prompt: avatarPrompt,
          style: "cartoon illustration"
        })
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        
        // Replace the [AVATAR_BUTTONS_HERE] marker with the generated image
        setMessages(prev => prev.map(msg => 
          msg.id === avatarButtonMessageId
            ? { 
                ...msg, 
                content: msg.content.replace('[AVATAR_BUTTONS_HERE]', `![Generated Avatar](${imageData.imageUrl})\n\n*Here's your assessment bot avatar! This visual representation captures the personality we've designed.*`)
              }
            : msg
        ));
        
        // Mark avatar component as complete
        onComponentComplete && onComponentComplete("avatar");
        
        // Clear button state
        setAvatarButtonMessageId(null);
      } else {
        // Show error message
        setMessages(prev => prev.map(msg => 
          msg.id === avatarButtonMessageId
            ? { 
                ...msg, 
                content: msg.content.replace('[AVATAR_BUTTONS_HERE]', "I had trouble generating the avatar. Let's continue with the bot design for now.")
              }
            : msg
        ));
      }
    } catch (error) {
      console.error("Avatar generation error:", error);
      // Show error message
      setMessages(prev => prev.map(msg => 
        msg.id === avatarButtonMessageId
          ? { 
              ...msg, 
              content: msg.content.replace('[AVATAR_BUTTONS_HERE]', "I had trouble generating the avatar. Let's continue with the bot design for now.")
            }
          : msg
      ));
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleReviseDescription = () => {
    // Replace the buttons with a message asking for revision
    setMessages(prev => prev.map(msg => 
      msg.id === avatarButtonMessageId
        ? { 
            ...msg, 
            content: msg.content.replace('[AVATAR_BUTTONS_HERE]', "\n*What would you like me to change about this description? Please let me know and I'll revise it.*")
          }
        : msg
    ));
    
    setAvatarButtonMessageId(null);
  };

  // Helper function to detect if a message contains an INTAKE_CARD
  const detectIntakeCard = (content: string): { hasCard: boolean; cardContent: string; beforeCard: string; afterCard: string } => {
    const cardStartIndex = content.indexOf('INTAKE_CARD');
    if (cardStartIndex === -1) {
      return { hasCard: false, cardContent: '', beforeCard: content, afterCard: '' };
    }

    // Find the end of the card (look for next non-field line)
    const lines = content.split('\n');
    let cardLines: string[] = [];
    let cardStartLine = -1;
    let cardEndLine = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('INTAKE_CARD')) {
        cardStartLine = i;
        continue;
      }
      
      if (cardStartLine !== -1) {
        const line = lines[i].trim();
        // Check if this line is a field (contains : and _____)
        if (line.includes(':') && line.includes('_____')) {
          cardLines.push(lines[i]);
        } else if (line === '' || line.startsWith('```')) {
          // Empty line or code block end - continue
          if (line.startsWith('```')) {
            cardEndLine = i;
            break;
          }
        } else if (cardLines.length > 0) {
          // Non-field line after we've collected fields - end of card
          cardEndLine = i - 1;
          break;
        }
      }
    }

    if (cardStartLine === -1 || cardLines.length === 0) {
      return { hasCard: false, cardContent: '', beforeCard: content, afterCard: '' };
    }

    if (cardEndLine === -1) cardEndLine = lines.length - 1;

    const beforeCard = lines.slice(0, cardStartLine).join('\n').trim();
    const afterCard = lines.slice(cardEndLine + 1).join('\n').trim();
    const cardContent = cardLines.join('\n');

    return { hasCard: true, cardContent, beforeCard, afterCard };
  };

  // Handle card form submission
  const handleCardSubmit = async (cardData: Record<string, string>) => {
    // Format the submission as a user message
    const formattedResponse = Object.entries(cardData)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Here are the details:\n\n${formattedResponse}`,
      isBot: false,
      timestamp: new Date(),
      cardData: cardData, // Store the structured data for card rendering
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Continue conversation with the form data
    try {
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
          uploadedFiles: uploadedFiles,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let botResponse = "";
      let streamingMessageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      setMessages(prev => [...prev, {
        id: streamingMessageId,
        content: "",
        isBot: true,
        timestamp: new Date(),
      }]);

      let hasStartedStreaming = false;

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
                if (!hasStartedStreaming) {
                  setIsLoading(false);
                  hasStartedStreaming = true;
                }
                
                botResponse += parsed.content;

                setMessages(prev => prev.map(msg => 
                  msg.id === streamingMessageId 
                    ? { ...msg, content: botResponse }
                    : msg
                ));
              }
            } catch (e) {
              console.error("Error parsing streaming data:", e);
            }
          }
        }
      }

      // Replace streaming message with final message
      const finalMessageId = Date.now().toString();
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? { ...msg, id: finalMessageId, content: botResponse }
          : msg
      ));

      // Run background analysis
      await analyzeConversation(botResponse);

      // Check for avatar button marker in Stage 3
      if (currentStageId === 3 && botType === "intake-assessment-bot" && botResponse.includes('[AVATAR_BUTTONS_HERE]')) {
        console.log("🎨 Avatar buttons detected in bot response");
        setAvatarButtonMessageId(finalMessageId);
      }

      // Check for stage progression
      onStageProgression(botResponse);
    } catch (error) {
      console.error("Error in card submission:", error);
      setMessages(prev => prev.filter(msg => msg.id !== `streaming-${Date.now()}`));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bot type changes (when switching stages) - Stage 2 waits for user input
  useEffect(() => {
    if (botType === "intake-context" && stageContext) {
      console.log("Stage 2 bot activated - waiting for user message before responding");
      // Stage 2 bot will respond naturally when user sends their next message
      // No proactive welcome message to avoid back-to-back bot messages
    }
  }, [botType, stageContext]);

  // Handle file uploads - delegate to parent component's file handler
  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        processingStatus: "processing",
      };

      onFileUpload(uploadedFile);

      // Process the file based on type
      try {
        const formData = new FormData();
        formData.append("file", file);

        let endpoint = "";
        if (file.type.includes("pdf")) {
          endpoint = "/api/intake/extract-pdf";
        } else if (file.type.includes("text")) {
          endpoint = "/api/intake/extract-text";
        } else {
          // For other file types, we'll just store basic info
          onFileUpload({
            ...uploadedFile,
            processingStatus: "completed",
            extractedContent: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            interpretation:
              "File uploaded successfully. Content will be available for the teaching bot to reference.",
          });
          continue;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onFileUpload({
            ...uploadedFile,
            processingStatus: "completed",
            extractedContent: result.text,
            interpretation: `Extracted text from ${file.name}. This content appears to be educational material that can be referenced by the AI assistant.`,
          });

          // Send file interpretation to the bot
          if (botType === "intake-context") {
            const interpretationMessage: Message = {
              id: Date.now().toString(),
              content: `I've processed your uploaded file "${file.name}". Here's what I found:\n\n**File Type:** ${file.type}\n**Content Preview:** ${result.text.substring(0, 200)}...\n\nIs this the content you intended to upload? Should I use this material when building your learning experience?`,
              isBot: true,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, interpretationMessage]);
          }
        } else {
          onFileUpload({
            ...uploadedFile,
            processingStatus: "error",
            interpretation: "Failed to process file content.",
          });
        }
      } catch (error) {
        onFileUpload({
          ...uploadedFile,
          processingStatus: "error",
          interpretation: "Error processing file.",
        });
      }
    }
  };

  // Auto-scroll to bottom when messages change (same as successful bots)
  useEffect(() => {
    const messageContainer =
      messagesEndRef.current?.closest(".overflow-y-auto");
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

    // 🔍 DEBUG: Log what files we're sending to the bot
    console.log("🔍 FRONTEND DEBUG - Sending uploadedFiles to Stage 2 bot:", uploadedFiles);
    console.log("🔍 FRONTEND DEBUG - Number of uploaded files:", uploadedFiles.length);
    uploadedFiles.forEach((file, index) => {
      console.log(`🔍 FRONTEND DEBUG - File ${index + 1}:`, {
        id: file.id,
        name: file.name,
        type: file.type,
        processingStatus: file.processingStatus,
        hasExtractedContent: !!file.extractedContent,
        contentLength: file.extractedContent?.length || 0,
        interpretation: file.interpretation
      });
    });

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
          uploadedFiles: uploadedFiles, // Include uploaded files for Stage 2 bot
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let botResponse = "";
      let streamingMessageId = `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add initial streaming message 
      setMessages(prev => [...prev, {
        id: streamingMessageId,
        content: "",
        isBot: true,
        timestamp: new Date(),
      }]);

      let hasStartedStreaming = false;

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
                // Set loading to false when we start receiving content
                if (!hasStartedStreaming) {
                  setIsLoading(false);
                  hasStartedStreaming = true;
                }
                
                botResponse += parsed.content;

                // Update the specific streaming message in real time
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === streamingMessageId 
                      ? { ...msg, content: botResponse }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore JSON parsing errors for streaming
            }
          }
        }
      }

      // Replace streaming message with final message with permanent ID
      if (botResponse) {
        const finalMessageId = `final-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === streamingMessageId 
              ? { ...msg, id: finalMessageId }
              : msg
          )
        );

        // Trigger background analysis after bot response is complete
        analyzeConversation(botResponse);

        // Check for avatar button marker in Stage 3
        if (currentStageId === 3 && botType === "intake-assessment-bot" && botResponse.includes('[AVATAR_BUTTONS_HERE]')) {
          console.log("🎨 Avatar buttons detected in streaming response");
          setAvatarButtonMessageId(finalMessageId);
        }

        // Check for stage progression
        onStageProgression(botResponse);
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Remove any streaming messages and add error message
      setMessages((prev) => {
        const withoutStreaming = prev.filter((msg) => !msg.id.startsWith("streaming"));
        const errorMessageId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return [
          ...withoutStreaming,
          {
            id: errorMessageId,
            content:
              "I'm sorry, I'm having trouble processing your response. Could you try again?",
            isBot: true,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      // Ensure loading is false even if there's an error
      setIsLoading(false);
    }

    // Re-focus the input field after sending message (UX improvement)
    setTimeout(() => {
      const textareaElement = document.querySelector(
        'textarea[placeholder*="Type your response"]',
      ) as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
      }
    }, 100);
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
                  finalValue: isSummary
                    ? criterion.value
                    : updated[key as keyof CriteriaState]?.finalValue || null,
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
            <h3 className="font-medium text-gray-900">Intake Assistant</h3>
            <p className="text-sm text-gray-600">
              Let's gather your course information
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area - Uses same structure as successful Reggie bot */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
        {/* Show avatar selection if active */}
        {showAvatarSelection && (
          <AvatarSelection
            prompt={avatarPrompt}
            onSelect={handleAvatarSelect}
            onCancel={handleAvatarCancel}
          />
        )}
        
        {messages.filter(message => message.content.trim() !== "").map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-start mb-1">
              {message.isBot ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
              <span className="text-xs text-gray-500 mt-1">
                {message.isBot ? "Intake Assistant" : "You"}
              </span>
            </div>
            <div
              className={`ml-10 ${
                message.isBot
                  ? "bg-blue-50 border border-blue-200 text-gray-900"
                  : "bg-gray-100 text-gray-900 border border-gray-300"
              } rounded-lg p-3 text-gray-700`}
            >
              {message.isBot ? (
                (() => {
                  const cardDetection = detectIntakeCard(message.content);
                  
                  if (cardDetection.hasCard) {
                    return (
                      <div className="space-y-3">
                        {/* Render text before card */}
                        {cardDetection.beforeCard && (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <div className="mb-2 last:mb-0">{children}</div>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">{children}</em>
                                ),
                                br: () => <br />,
                                code: () => null, // Hide inline code completely
                                pre: () => null, // Hide code blocks completely
                              }}
                            >
                              {cardDetection.beforeCard}
                            </ReactMarkdown>
                          </div>
                        )}
                        
                        {/* Render the interactive card */}
                        <IntakeCard 
                          cardContent={cardDetection.cardContent}
                          onSubmit={handleCardSubmit}
                        />
                        
                        {/* Render text after card */}
                        {cardDetection.afterCard && (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <div className="mb-2 last:mb-0">{children}</div>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">{children}</em>
                                ),
                                br: () => <br />,
                                code: () => null, // Hide inline code completely
                                pre: () => null, // Hide code blocks completely
                              }}
                            >
                              {cardDetection.afterCard}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Regular message without card - check for avatar buttons
                    const hasAvatarButtons = message.content.includes('[AVATAR_BUTTONS_HERE]');
                    
                    if (hasAvatarButtons && avatarButtonMessageId === message.id) {
                      // Split content around the marker
                      const [beforeButtons, afterButtons] = message.content.split('[AVATAR_BUTTONS_HERE]');
                      
                      return (
                        <div className="prose prose-sm max-w-none">
                          {/* Content before buttons */}
                          {beforeButtons && (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <div className="mb-2 last:mb-0">{children}</div>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">{children}</em>
                                ),
                                br: () => <br />,
                                code: () => null,
                                pre: () => null,
                              }}
                            >
                              {beforeButtons}
                            </ReactMarkdown>
                          )}
                          
                          {/* Avatar buttons */}
                          <AvatarButtons
                            onCreateAvatar={handleCreateAvatar}
                            onReviseDescription={handleReviseDescription}
                            isGenerating={isGeneratingAvatar}
                          />
                          
                          {/* Content after buttons */}
                          {afterButtons && (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <div className="mb-2 last:mb-0">{children}</div>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">{children}</em>
                                ),
                                br: () => <br />,
                                code: () => null,
                                pre: () => null,
                              }}
                            >
                              {afterButtons}
                            </ReactMarkdown>
                          )}
                        </div>
                      );
                    } else {
                      // Regular message without avatar buttons
                      return (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <div className="mb-2 last:mb-0">{children}</div>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-gray-900">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              br: () => <br />,
                              code: () => null, // Hide inline code completely
                              pre: () => null, // Hide code blocks completely
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                  }
                })()
              ) : (
                // Check if this user message has card data to render as completed card
                message.cardData ? (
                  <CompletedIntakeCard data={message.cardData} />
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )
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
            <div className="ml-10 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Reference for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Avatar Selection Component */}
      {showAvatarSelection && avatarPrompt && (
        <div className="p-4 border-t border-gray-200">
          <AvatarSelection
            prompt={avatarPrompt}
            onSelect={handleAvatarSelect}
            onCancel={handleAvatarCancel}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            rows={1}
            className="flex-grow bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden min-h-[40px] max-h-[120px]"
            style={{
              resize: 'none',
              height: 'auto',
            }}
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
          >
            <Send className="w-4 h-4" />
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
  
  // New state for personality testing bot feature
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [personalitySummary, setPersonalitySummary] = useState<string | null>(null);
  const [fullBotPersonality, setFullBotPersonality] = useState<string | null>(null);
  const [botName, setBotName] = useState<string | null>(null);
  const [botJobTitle, setBotJobTitle] = useState<string | null>(null);
  const [botWelcomeMessage, setBotWelcomeMessage] = useState<string | null>(null);
  const [botVisualDescription, setBotVisualDescription] = useState<string | null>(null);
  const [showPersonalityTester, setShowPersonalityTester] = useState(false);
  const [personalityTesterExpanded, setPersonalityTesterExpanded] = useState(false);
  const [criteria, setCriteria] = useState<CriteriaState>({
    schoolDistrict: {
      detected: false,
      value: null,
      confidence: 0,
      finalValue: null,
    },
    school: { detected: false, value: null, confidence: 0, finalValue: null },
    subject: { detected: false, value: null, confidence: 0, finalValue: null },
    topic: { detected: false, value: null, confidence: 0, finalValue: null },
    gradeLevel: {
      detected: false,
      value: null,
      confidence: 0,
      finalValue: null,
    },
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
    {
      id: 3,
      title: "Assessment Bot",
      description: "Design the AI that will evaluate your students",
      components: [
        {
          id: "personality",
          title: "Personality",
          completed: false,
          type: "bot-assisted",
          note: "Character and teaching style",
        },
        {
          id: "boundaries",
          title: "Boundaries",
          completed: false,
          type: "bot-assisted",
          note: "Rules and limitations",
        },
        {
          id: "avatar",
          title: "Avatar",
          completed: false,
          type: "bot-assisted", 
          note: "Visual appearance",
        },
      ],
      hasTestButton: false,
    },
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

  const handleCriteriaUpdate = (
    updater: (prev: CriteriaState) => CriteriaState,
  ) => {
    setCriteria(updater);
  };

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles((prev) => {
      const existingIndex = prev.findIndex((f) => f.id === file.id);
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

  // Handle native file uploads from input/drag-drop
  const handleNativeFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        processingStatus: "processing",
      };

      handleFileUpload(uploadedFile);

      // Process the file based on type
      try {
        let endpoint = "";
        let formDataKey = "file";
        
        if (file.type.includes("pdf")) {
          endpoint = "/api/intake/extract-pdf";
          formDataKey = "pdf";
        } else if (file.type.includes("text")) {
          endpoint = "/api/intake/extract-text";
          formDataKey = "textfile";
        } else if (file.name.toLowerCase().endsWith('.imscc') || file.name.toLowerCase().endsWith('.zip')) {
          endpoint = "/api/intake/upload-imscc";
          formDataKey = "imscc";
        } else {
          // For other file types, just store basic info
          handleFileUpload({
            ...uploadedFile,
            processingStatus: "completed",
            extractedContent: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
            interpretation:
              "✅ File uploaded successfully. Content will be available for the teaching bot to reference.",
          });
          continue;
        }

        const formData = new FormData();
        formData.append(formDataKey, file);

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (response.status === 429) {
          // Rate limited
          handleFileUpload({
            ...uploadedFile,
            processingStatus: "error",
            interpretation:
              "⏱️ Too many requests - please wait a moment and try again.",
          });
          continue;
        }

        const result = await response.json();

        if (result.success) {
          let extractedContent = "";
          let interpretation = "";
          
          if (endpoint === "/api/intake/upload-imscc") {
            // Handle Canvas .imscc files
            extractedContent = result.summary;
            interpretation = `✅ Parsed Canvas course "${result.courseName}". Found ${result.fullData.moduleCount} modules, ${result.fullData.pagesCount} pages, and ${result.fullData.quizzesCount} quizzes. This course structure is now available for the AI assistant to reference.`;
          } else {
            // Handle PDF and text files
            extractedContent = result.text;
            interpretation = `✅ Extracted text from ${file.name}. This content is now available for the AI assistant to reference.`;
          }
          
          handleFileUpload({
            ...uploadedFile,
            processingStatus: "completed",
            extractedContent,
            interpretation,
          });
        } else {
          handleFileUpload({
            ...uploadedFile,
            processingStatus: "error",
            interpretation: `❌ Failed to process file: ${result.error || "Unknown error"}`,
          });
        }
      } catch (error) {
        handleFileUpload({
          ...uploadedFile,
          processingStatus: "error",
          interpretation: "🌐 Error processing file.",
        });
      }
    }
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Handle YouTube URL extraction
  const handleYoutubeExtract = async () => {
    if (!youtubeUrl.trim() || processingYoutube) return;

    setProcessingYoutube(true);

    try {
      const response = await fetch("/api/intake/extract-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (response.status === 429) {
        // Rate limited - show user-friendly message
        const rateLimitFile: UploadedFile = {
          id: Date.now().toString(),
          name: "Rate Limit Error",
          type: "error",
          size: 0,
          processingStatus: "error",
          extractedContent: "",
          interpretation:
            "⏱️ Too many requests - please wait a moment and try again. The system is temporarily rate limited.",
        };
        handleFileUpload(rateLimitFile);
        return;
      }

      const result = await response.json();

      console.log("🔍 FRONTEND YOUTUBE DEBUG - Received result:", result);
      console.log("🔍 FRONTEND YOUTUBE DEBUG - result.success:", result.success);
      console.log("🔍 FRONTEND YOUTUBE DEBUG - result.transcript:", result.transcript);
      console.log("🔍 FRONTEND YOUTUBE DEBUG - result.transcript length:", result.transcript?.length || 0);
      console.log("🔍 FRONTEND YOUTUBE DEBUG - result.title:", result.title);

      if (result.success) {
        // Check if transcript extraction failed or is empty
        if (result.transcriptError || !result.transcript || result.transcript.trim().length === 0) {
          const errorFile: UploadedFile = {
            id: Date.now().toString(),
            name: result.title || "YouTube Video",
            type: "error",
            size: 0,
            processingStatus: "error",
            extractedContent: "",
            interpretation: `⚠️ YouTube transcript extraction unavailable: "${result.title}". ${result.transcriptError || "Transcript access is currently limited"}. 

**Alternative:** Try uploading a PDF or text file with the content instead. Many YouTube videos provide transcripts or lesson materials as downloadable files.`,
          };
          handleFileUpload(errorFile);
        } else {
          const youtubeFile: UploadedFile = {
            id: Date.now().toString(),
            name: result.title || "YouTube Video",
            type: "video/youtube",
            size: 0,
            processingStatus: "completed",
            extractedContent: result.transcript,
            interpretation: `✅ Extracted transcript from YouTube video: "${result.title}". This content is now available for the AI assistant to reference.`,
          };

          console.log("🔍 FRONTEND YOUTUBE DEBUG - Created file object:", {
            id: youtubeFile.id,
            name: youtubeFile.name,
            extractedContent: youtubeFile.extractedContent,
            contentLength: youtubeFile.extractedContent?.length || 0
          });

          handleFileUpload(youtubeFile);
        }
        setYoutubeUrl("");
      } else {
        const errorFile: UploadedFile = {
          id: Date.now().toString(),
          name: "YouTube Error",
          type: "error",
          size: 0,
          processingStatus: "error",
          extractedContent: "",
          interpretation: `❌ Could not extract transcript from YouTube video. Please check the URL and try again.`,
        };
        handleFileUpload(errorFile);
      }
    } catch (error) {
      console.error("YouTube extraction error:", error);
      const errorFile: UploadedFile = {
        id: Date.now().toString(),
        name: "Connection Error",
        type: "error",
        size: 0,
        processingStatus: "error",
        extractedContent: "",
        interpretation:
          "🌐 Connection error occurred. Please check your internet connection and try again.",
      };
      handleFileUpload(errorFile);
    }

    setProcessingYoutube(false);
  };

  const handleStageProgression = async (completionMessage: string) => {
    console.log(
      "🔍 Checking stage progression for message:",
      completionMessage.substring(0, 100) + "...",
    );

    // Check for Stage 1 to Stage 2 transition - use a more reliable unique phrase
    const stage2TransitionPhrase = "Tell me when you have it.";
    
    // Check for Stage 2 to Stage 3 transition  
    const stage3TransitionPhrase = "Great! Let's talk about the personality of your assessment bot. Do you have a persona in mind or would you like me to suggest some options?";

    // Check for Stage 3 component completions
    if (currentStageId === 3) {
      // Personality completion - when bot suggests or confirms a personality
      if (completionMessage.includes("Fitzgerald") || completionMessage.includes("personality for your assessment bot") || completionMessage.includes("Does this feel like a good fit") || completionMessage.includes("Professor Conch")) {
        console.log("🎭 Stage 3 Personality component completed");
        handleComponentComplete("personality");
        
        // Extract bot name and description using AI
        console.log("🤖 Using AI to extract bot name and description...");
        
        try {
          const extractionResponse = await fetch('/api/intake/extract-bot-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ botResponse: completionMessage })
          });

          if (extractionResponse.ok) {
            const extractionData = await extractionResponse.json();
            console.log("🤖 AI extraction result:", extractionData);

            if (extractionData.name) {
              console.log("🏷️ AI extracted bot name:", extractionData.name);
              setBotName(extractionData.name);
            }

            if (extractionData.jobTitle) {
              console.log("💼 AI extracted job title:", extractionData.jobTitle);
              setBotJobTitle(extractionData.jobTitle);
            }

            if (extractionData.description) {
              console.log("📝 AI extracted description:", extractionData.description);
              setPersonalitySummary(extractionData.description);
            } else {
              // Fallback description
              const fallbackDesc = extractionData.name 
                ? `Your ${extractionData.name} assessment bot is ready to engage with students about ${criteria.topic.finalValue || "the subject"}.`
                : "Your custom assessment bot personality is ready to test!";
              setPersonalitySummary(fallbackDesc);
            }

            if (extractionData.welcomeMessage) {
              console.log("👋 AI extracted welcome message:", extractionData.welcomeMessage);
              setBotWelcomeMessage(extractionData.welcomeMessage);
            }

            if (extractionData.fullPersonality) {
              console.log("🧠 AI extracted full personality:", extractionData.fullPersonality);
              setFullBotPersonality(extractionData.fullPersonality);
            }

            if (extractionData.visualDescription) {
              console.log("🎨 AI extracted visual description:", extractionData.visualDescription);
              setBotVisualDescription && setBotVisualDescription(extractionData.visualDescription);
            }
          } else {
            console.warn("⚠️ AI extraction failed, using fallback");
            setPersonalitySummary("Your custom assessment bot personality is ready to test!");
          }
        } catch (error) {
          console.error("❌ Error during AI extraction:", error);
          setPersonalitySummary("Your custom assessment bot personality is ready to test!");
        }
        
        // Store full personality description for testing bot
        setFullBotPersonality(completionMessage);
      }
      
      // Avatar completion - when image is generated or shown
      if (completionMessage.includes("![Image") || completionMessage.includes("I'll create that avatar") || completionMessage.includes("avatar for you")) {
        console.log("🖼️ Stage 3 Avatar component completed");
        handleComponentComplete("avatar");
        
        // Look for generated image URL in the message
        const imageMatch = completionMessage.match(/!\[.*?\]\((\/api\/.*?)\)/);
        if (imageMatch) {
          setGeneratedAvatar(imageMatch[1]);
        }
      }
      
      // Boundaries completion - when boundaries discussion happens
      if (completionMessage.includes("criteria it will use to route") || completionMessage.includes("boundaries") || completionMessage.includes("avoid talking about")) {
        console.log("🚧 Stage 3 Boundaries component completed");
        handleComponentComplete("boundaries");
      }
    }

    if (completionMessage.includes(stage2TransitionPhrase)) {
      console.log("✅ Stage 1->2 transition detected! Moving to Stage 2");

      // Mark Stage 1 as complete by updating all its components
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === 1
            ? {
                ...stage,
                components: stage.components.map((comp) => ({
                  ...comp,
                  completed: true,
                })),
              }
            : stage,
        ),
      );

      // Prepare context from Stage 1 for Stage 2
      const stage1Context = {
        schoolDistrict: criteria.schoolDistrict.finalValue || "Not specified",
        school: criteria.school.finalValue || "Not specified",
        subject: criteria.subject.finalValue || "Not specified",
        topic: criteria.topic.finalValue || "Not specified",
        gradeLevel: criteria.gradeLevel.finalValue || "Not specified",
        completionMessage,
      };

      // Switch to Stage 2
      setCurrentStageId(2);
      setCurrentBotType("intake-context");
      setStageContext(stage1Context);
    } else if (completionMessage.includes(stage3TransitionPhrase)) {
      console.log("✅ Stage 2->3 transition detected! Moving to Stage 3");

      // Mark Stage 2 as complete by updating all its components
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === 2
            ? {
                ...stage,
                components: stage.components.map((comp) => ({
                  ...comp,
                  completed: true,
                })),
              }
            : stage,
        ),
      );

      // Prepare context from previous stages for Stage 3
      const allStagesContext = {
        schoolDistrict: criteria.schoolDistrict.finalValue || "Not specified",
        school: criteria.school.finalValue || "Not specified", 
        subject: criteria.subject.finalValue || "Not specified",
        topic: criteria.topic.finalValue || "Not specified",
        gradeLevel: criteria.gradeLevel.finalValue || "Not specified",
        completionMessage,
        uploadedFiles: uploadedFiles, // Include files from Stage 2
      };

      // Switch to Stage 3
      setCurrentStageId(3);
      setCurrentBotType("intake-assessment-bot");
      setStageContext(allStagesContext);
    }
  };

  const currentStage =
    stages.find((stage) => stage.id === currentStageId) || stages[0];

  return (
    <div className="h-screen p-4 md:p-6 flex flex-col bg-gray-50">


      {/* Main content area with sidebar and chat */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 min-h-0">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-lg border border-gray-200 p-6 overflow-y-auto">
          <div>
            <h2 className="font-semibold text-lg mb-2 text-gray-900">Content Creator</h2>
            <p className="text-sm text-gray-600 mb-4">
              Uplevel your Course with AI
            </p>

            <div className="space-y-4">
              {stages.map((stage, index) => {
                const isActive = stage.id === currentStageId;

                // For completed stages (when we've moved beyond them), show them as fully completed
                const shouldShowAsCompleted = currentStageId > stage.id;

                // Calculate completion count differently for Stage 1 (criteria-based) vs other stages
                const completedCount =
                  stage.id === 1
                    ? Object.values(criteria).filter(
                        (criterion) =>
                          criterion.finalValue !== null &&
                          criterion.finalValue !== undefined,
                      ).length
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
                        <h3 className="font-medium text-sm text-gray-900">{stage.title}</h3>
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
                            {Object.entries(CRITERIA_LABELS).map(
                              ([key, label]) => {
                                const criterion =
                                  criteria[key as keyof CriteriaState];
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center gap-2"
                                  >
                                    <div
                                      className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                                        criterion.detected
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-300 text-gray-500",
                                      )}
                                    >
                                      {criterion.detected ? (
                                        <Check className="w-3 h-3 animate-in zoom-in duration-300" />
                                      ) : (
                                        <Circle className="w-2 h-2" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span
                                        className={cn(
                                          "text-xs transition-colors break-words",
                                          criterion.detected
                                            ? "text-green-700 font-medium"
                                            : "text-gray-700",
                                        )}
                                      >
                                        {label}
                                      </span>
                                      {criterion.detected &&
                                        criterion.finalValue && (
                                          <div className="text-xs text-green-600 mt-0.5 animate-in slide-in-from-top-1 duration-300 break-words">
                                            {key === "learningObjectives" ? (
                                              <div className="space-y-1">
                                                {criterion.finalValue
                                                  .split(/\d+\./)
                                                  .filter(Boolean)
                                                  .map(
                                                    (
                                                      objective: string,
                                                      index: number,
                                                    ) => (
                                                      <div
                                                        key={index}
                                                        className="flex"
                                                      >
                                                        <span className="mr-1">
                                                          {index + 1}.
                                                        </span>
                                                        <span>
                                                          {objective.trim()}
                                                        </span>
                                                      </div>
                                                    ),
                                                  )}
                                              </div>
                                            ) : (
                                              criterion.finalValue
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
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
                                {stage.id === 2 &&
                                  component.type === "file-upload" && (
                                    <div className="ml-5 mt-2 space-y-3">
                                      <input
                                        type="file"
                                        id="file-upload"
                                        multiple
                                        className="hidden"
                                        onChange={(e) =>
                                          e.target.files &&
                                          handleNativeFileUpload(e.target.files)
                                        }
                                        accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
                                      />
                                      <label
                                        htmlFor="file-upload"
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer block"
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          const files = e.dataTransfer.files;
                                          if (files.length > 0) {
                                            handleNativeFileUpload(files);
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
                                            <div
                                              key={file.id}
                                              className="flex items-center gap-2 text-xs bg-gray-100 p-2 rounded"
                                            >
                                              <div className="flex-1">
                                                <div className="font-medium">
                                                  {file.name}
                                                </div>
                                                <div className="text-gray-500">
                                                  {file.processingStatus ===
                                                    "processing" &&
                                                    "Processing..."}
                                                  {file.processingStatus ===
                                                    "completed" &&
                                                    "✓ Processed"}
                                                  {file.processingStatus ===
                                                    "error" && "⚠ Error"}
                                                </div>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  handleFileRemove(file.id)
                                                }
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
                                            onChange={(e) =>
                                              setYoutubeUrl(e.target.value)
                                            }
                                            placeholder="Paste YouTube URL here..."
                                            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                          <button
                                            onClick={handleYoutubeExtract}
                                            disabled={
                                              !youtubeUrl.trim() ||
                                              processingYoutube
                                            }
                                            className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {processingYoutube
                                              ? "Processing..."
                                              : "Extract"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Show bot preview and test button for completed Stage 3 */}
                        {stage.id === 3 && stage.components.every(comp => comp.completed) && (
                          <div className="mt-4 border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-3 mb-3">
                              {generatedAvatar ? (
                                <img 
                                  src={generatedAvatar} 
                                  alt="Bot Avatar" 
                                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                                  <Bot className="w-5 h-5 text-blue-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {botName || "Assessment Bot"}
                                </div>
                                {botJobTitle && (
                                  <div className="text-xs font-medium text-blue-600 mb-1">
                                    {botJobTitle}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 leading-relaxed">
                                  {personalitySummary || "Your newly designed assessment bot"}
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => setPersonalityTesterExpanded(true)}
                            >
                              Test Your Bot
                            </Button>
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
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col min-h-0">
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
            currentStageId={currentStageId}
            onAvatarGenerated={setGeneratedAvatar}
            botName={botName}
            botVisualDescription={botVisualDescription}
            setBotVisualDescription={setBotVisualDescription}
          />
        </div>
        
        {/* Personality Testing Bot Modal - Full screen overlay */}
        {personalityTesterExpanded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
              <PersonalityTestingBot
                avatar={generatedAvatar}
                personalitySummary={personalitySummary}
                botPersonality={fullBotPersonality || personalitySummary || "A helpful and friendly assistant"} // Use full personality description
                onClose={() => setPersonalityTesterExpanded(false)}
                botName={botName}
                botJobTitle={botJobTitle}
                botWelcomeMessage={botWelcomeMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
