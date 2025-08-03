import { useState, useEffect, useRef, useCallback } from "react";
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
  onInjectMessage?: (injectFunction: (message: string) => void) => void;
  stages?: Stage[];
  onTestBotClick?: () => void;
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
  onInjectMessage,
  stages,
  onTestBotClick,
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
  
  // New state for Persona Confirmation Buttons
  const [personaConfirmationMessageId, setPersonaConfirmationMessageId] = useState<string | null>(null);
  
  // New state for Intake Card Confirmation
  const [intakeConfirmationMessageId, setIntakeConfirmationMessageId] = useState<string | null>(null);
  
  // New state for Boundaries Buttons
  const [boundariesButtonMessageId, setBoundariesButtonMessageId] = useState<string | null>(null);
  const [boundariesConfirmationMessageId, setBoundariesConfirmationMessageId] = useState<string | null>(null);
  
  // New state for Assessment Targets Confirmation Buttons
  const [assessmentTargetsConfirmationMessageId, setAssessmentTargetsConfirmationMessageId] = useState<string | null>(null);
  
  // State for extracted boundaries
  const [extractedBoundaries, setExtractedBoundaries] = useState<string>("");
  
  // State for Test Your Bot button
  const [testBotButtonMessageId, setTestBotButtonMessageId] = useState<string | null>(null);
  const [hasInjectedTestButton, setHasInjectedTestButton] = useState(false);

  // Helper function to send button click messages
  // Fallback check system - DISABLED because it interferes with current message detection
  const checkAndFixMissingButtons = () => {
    console.log('🔧 FALLBACK CHECK: Disabled - using immediate detection instead');
    // Disabled: This was scanning all conversation history and finding old JSON blocks
    // which overrode the correct detection of current message JSON
  };

  // JSON Button Detection System - LEGACY (replaced by immediate detection)
  const handleJsonButtonDetection = (botResponse: string, messageId: string) => {
    console.log('🔍 LEGACY JSON DETECTION - Disabled to prevent interference');
    // This function is disabled because it was scanning conversation history
    // and finding old JSON blocks which interfered with current message detection
  };

  const sendButtonMessage = async (messageText: string, buttonMessageId?: string) => {
    const buttonMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, buttonMessage]);
    setIsLoading(true);

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
            { role: "user", content: messageText },
          ],
          assistantType: currentStageId === 2 ? "intake-context" : "intake-assessment-bot",
          stageContext: stageContext,
          uploadedFiles: uploadedFiles || []
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      let botResponse = "";
      const streamingMessageId = `streaming-${Date.now()}`;
      
      setMessages(prev => [...prev, {
        id: streamingMessageId,
        content: "",
        isBot: true,
        timestamp: new Date(),
      }]);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                botResponse += parsed.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === streamingMessageId 
                    ? { ...msg, content: botResponse }
                    : msg
                ));
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }

      // Replace streaming message with final message
      const finalMessageId = `message-${Date.now()}`;
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? { ...msg, id: finalMessageId }
          : msg
      ));

      console.log('🔍 BUTTON MESSAGE COMPLETION - About to run immediate JSON detection');
      console.log('🔍 BUTTON MESSAGE COMPLETION - botResponse length:', botResponse.length);
      console.log('🔍 BUTTON MESSAGE COMPLETION - finalMessageId:', finalMessageId);

      // IMMEDIATE JSON DETECTION for button messages - Process JSON buttons ONLY in the current bot response
      console.log('🔍 BUTTON MESSAGE JSON DETECTION - Processing response for JSON blocks');
      console.log('🔍 BUTTON MESSAGE JSON DETECTION - Response contains JSON marker:', botResponse.includes('```json'));
      console.log('🔍 BUTTON MESSAGE JSON DETECTION - Response contains confirm_persona:', botResponse.includes('confirm_persona'));
      
      try {
        // Look for JSON blocks in the current bot response - flexible regex for different newline formats
        const jsonBlockRegex = /```json\s*[\r\n]+([\s\S]*?)[\r\n]+```/g;
        let match;
        
        while ((match = jsonBlockRegex.exec(botResponse)) !== null) {
          try {
            const jsonStr = match[1];
            console.log('🔍 BUTTON MESSAGE JSON DETECTION - Extracted JSON string:', jsonStr);
            const jsonData = JSON.parse(jsonStr);
            console.log('🔍 BUTTON MESSAGE JSON DETECTION - Found valid JSON:', jsonData);
            
            if (jsonData.action) {
              console.log('🔍 BUTTON MESSAGE JSON DETECTION - Processing action:', jsonData.action);
              
              switch (jsonData.action) {
                case "confirm_learning_targets":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting assessment targets confirmation buttons immediately');
                  setAssessmentTargetsConfirmationMessageId(finalMessageId);
                  break;
                case "confirm_basics":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting intake confirmation buttons immediately');
                  setIntakeConfirmationMessageId(finalMessageId);
                  break;
                case "confirm_persona":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting persona confirmation buttons immediately');
                  setPersonaConfirmationMessageId(finalMessageId);
                  break;
                case "set_boundaries":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting boundaries buttons immediately');
                  setBoundariesButtonMessageId(finalMessageId);
                  break;
                case "confirm_boundaries":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting boundaries confirmation buttons immediately');
                  setBoundariesConfirmationMessageId(finalMessageId);
                  break;
                case "generate_avatar":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting avatar buttons immediately');
                  setAvatarButtonMessageId(finalMessageId);
                  
                  // Auto-trigger avatar generation
                  console.log('🎨 AUTO-GENERATION - Triggering automatic avatar generation from button message JSON');
                  setTimeout(() => {
                    if (finalMessageId) {
                      console.log('🎨 AUTO-GENERATION - Calling handleCreateAvatar automatically');
                      handleCreateAvatar();
                    }
                  }, 500);
                  break;
                case "test_bot":
                  console.log('🔍 BUTTON MESSAGE JSON DETECTION - Setting test bot button immediately');
                  setTestBotButtonMessageId(finalMessageId);
                  break;
              }
            }
          } catch (parseError) {
            console.log('🔍 BUTTON MESSAGE JSON DETECTION - Failed to parse JSON block:', parseError);
          }
        }
      } catch (error) {
        console.log('🔍 BUTTON MESSAGE JSON DETECTION - Error processing JSON:', error);
      }

      onStageProgression(botResponse);
    } catch (error) {
      console.error('Error sending button message:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // Add loading message to user
    setMessages(prev => prev.map(msg => 
      msg.id === avatarButtonMessageId
        ? { 
            ...msg, 
            content: msg.content + "\n\n*Generating your avatar... this may take a moment.*"
          }
        : msg
    ));
    
    try {
      // Extract visual description from the message with the buttons
      const buttonMessage = messages.find(m => m.id === avatarButtonMessageId);
      if (!buttonMessage) return;

      // Use the already confirmed visual description instead of re-extracting
      console.log("🎨 Using confirmed visual description for avatar generation");
      const avatarPrompt = botVisualDescription || `${botName || "educational assessment bot"}, friendly cartoon character`;

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
        
        // Replace the loading message or [AVATAR_BUTTONS_HERE] marker with the generated image
        console.log("🖼️ AVATAR DEBUG - About to update message with avatar");
        console.log("🖼️ AVATAR DEBUG - avatarButtonMessageId:", avatarButtonMessageId);
        console.log("🖼️ AVATAR DEBUG - imageData.imageUrl:", imageData.imageUrl);
        
        setMessages(prev => {
          const updatedMessages = prev.map(msg => {
            if (msg.id === avatarButtonMessageId) {
              const originalContent = msg.content;
              // Remove the loading message and append the avatar image
              let newContent = msg.content.replace('*Generating your avatar... this may take a moment.*', '');
              // Trim any trailing whitespace
              newContent = newContent.trimEnd();
              // Add the avatar image
              newContent += `\n\n![Generated Avatar](${imageData.imageUrl})\n\n*Here's your assessment bot avatar! This visual representation captures the personality we've designed.*`;
              
              console.log("🖼️ AVATAR DEBUG - Message found, ID:", msg.id);
              console.log("🖼️ AVATAR DEBUG - Original content:", originalContent);
              console.log("🖼️ AVATAR DEBUG - New content:", newContent);
              console.log("🖼️ AVATAR DEBUG - Content changed:", originalContent !== newContent);
              
              return { ...msg, content: newContent };
            }
            return msg;
          });
          
          console.log("🖼️ AVATAR DEBUG - Updated messages count:", updatedMessages.length);
          return updatedMessages;
        });
        
        console.log("🖼️ Avatar image URL set in chat:", imageData.imageUrl);
        
        // Mark avatar component as complete
        onComponentComplete && onComponentComplete("avatar");
        
        // Notify parent component with avatar URL for program bar and PersonalityTestingBot
        onAvatarGenerated && onAvatarGenerated(imageData.imageUrl);
        
        console.log("🖼️ Avatar stored for program bar:", imageData.imageUrl);
        
        // Clear button state
        setAvatarButtonMessageId(null);
      } else {
        console.error("Avatar generation failed with status:", imageResponse.status);
        // Show error message
        setMessages(prev => prev.map(msg => 
          msg.id === avatarButtonMessageId
            ? { 
                ...msg, 
                content: msg.content
                  .replace('*Generating your avatar... this may take a moment.*', '')
                  .trimEnd() + "\n\nI had trouble generating the avatar. Let's continue with the bot design for now."
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
              content: msg.content
                .replace('*Generating your avatar... this may take a moment.*', '')
                .trimEnd() + "\n\nI had trouble generating the avatar. Let's continue with the bot design for now."
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
            content: msg.content + "\n\n*What would you like me to change about this description? Please let me know and I'll revise it.*"
          }
        : msg
    ));
    
    setAvatarButtonMessageId(null);
  };

  // Handle persona confirmation actions
  const handleConfirmPersona = async () => {
    if (!personaConfirmationMessageId) return;

    // Extract bot information from the message with the buttons
    const buttonMessage = messages.find(m => m.id === personaConfirmationMessageId);
    if (!buttonMessage) return;

    // Replace the buttons with acceptance message
    setMessages(prev => prev.map(msg => 
      msg.id === personaConfirmationMessageId
        ? { 
            ...msg, 
            content: msg.content.replace('[PERSONA_CONFIRMATION_BUTTONS]', "\n*Great choice! This persona is confirmed. Now let's talk about any specific boundaries or guidelines for your bot.*")
          }
        : msg
    ));

    setPersonaConfirmationMessageId(null);

    // Extract and store bot information for later use (in background, non-blocking)
    const extractBotInfoAsync = async () => {
      try {
        const extractResponse = await fetch("/api/intake/extract-bot-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ botResponse: buttonMessage.content }),
        });

        if (extractResponse.ok) {
          const extractionData = await extractResponse.json();
          console.log("✅ CONFIRMED PERSONA DATA (background):", extractionData);
          
          // Store visual description for avatar generation
          if (extractionData.visualDescription) {
            setBotVisualDescription && setBotVisualDescription(extractionData.visualDescription);
            console.log("🎨 Set confirmed visual description (background):", extractionData.visualDescription);
          }
          
          // Generate welcome message silently in background
          if (extractionData.name && extractionData.personality) {
            try {
              const welcomeResponse = await fetch("/api/intake/generate-welcome-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  botName: extractionData.name,
                  botJobTitle: extractionData.jobTitle,
                  botPersonality: extractionData.personality,
                  stageContext: stageContext,
                }),
              });

              if (welcomeResponse.ok) {
                const welcomeData = await welcomeResponse.json();
                console.log("🎯 Generated welcome message (background):", welcomeData.welcomeMessage);
                
                // Add welcome message to extraction data
                extractionData.welcomeMessage = welcomeData.welcomeMessage;
                console.log("🎯 Welcome message added to extractionData:", extractionData.welcomeMessage);
              } else {
                console.error("🎯 Welcome message generation failed:", welcomeResponse.status, welcomeResponse.statusText);
              }
            } catch (error) {
              console.error("Error generating welcome message:", error);
            }
          }
          
          // Store the confirmed persona data in parent component state
          if (onComponentComplete) {
            console.log("🎯 About to call onComponentComplete with extractionData:", extractionData);
            console.log("🎯 extractionData.welcomeMessage:", extractionData.welcomeMessage);
            onComponentComplete(extractionData);
          }
        }
      } catch (error) {
        console.error("Error extracting confirmed persona (background):", error);
      }
    };

    // Start extraction in background (non-blocking)
    extractBotInfoAsync();

    // Send a user message to continue the conversation
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      content: "Perfect! I confirm this persona choice.",
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, confirmationMessage]);
    setIsLoading(true);

    // Send to bot to continue conversation
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
            { role: "user", content: confirmationMessage.content },
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
                if (!hasStartedStreaming) {
                  setIsLoading(false);
                  hasStartedStreaming = true;
                }
                
                botResponse += parsed.content;

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

      // Replace streaming message with final message
      if (botResponse) {
        const finalMessageId = `final-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === streamingMessageId 
              ? { ...msg, id: finalMessageId }
              : msg
          )
        );

        // Add immediate JSON detection for persona confirmation
        console.log('🔍 PERSONA CONFIRMATION - Processing JSON detection');
        try {
          const jsonBlockRegex = /```json\s*[\r\n]+([\s\S]*?)[\r\n]+```/g;
          let match;
          while ((match = jsonBlockRegex.exec(botResponse)) !== null) {
            try {
              const jsonData = JSON.parse(match[1]);
              if (jsonData.action) {
                switch (jsonData.action) {
                  case "confirm_learning_targets":
                    setAssessmentTargetsConfirmationMessageId(finalMessageId);
                    break;
                  case "set_boundaries":
                    setBoundariesButtonMessageId(finalMessageId);
                    break;
                  case "confirm_boundaries":
                    setBoundariesConfirmationMessageId(finalMessageId);
                    break;
                  case "generate_avatar":
                    setAvatarButtonMessageId(finalMessageId);
                    break;
                  case "test_bot":
                    setTestBotButtonMessageId(finalMessageId);
                    break;
                }
              }
            } catch (parseError) {
              console.log('🔍 PERSONA CONFIRMATION - JSON parse error:', parseError);
            }
          }
        } catch (error) {
          console.log('🔍 PERSONA CONFIRMATION - JSON detection error:', error);
        }

        onStageProgression(botResponse);
      }
    } catch (error) {
      console.error("Chat error after persona confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle intake confirmation 
  const handleConfirmIntake = async () => {
    if (!intakeConfirmationMessageId) return;

    // Find the summary message to extract criteria data
    const summaryMessage = messages.find(msg => msg.id === intakeConfirmationMessageId);
    if (summaryMessage) {
      // Extract criteria from the summary content
      const content = summaryMessage.content;
      const criteriaData: { [key: string]: string } = {};
      
      // Parse the summary format to extract values
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('School District:')) {
          criteriaData.schoolDistrict = line.split('School District:')[1]?.trim() || '';
        }
        if (line.includes('School Name:')) {
          criteriaData.school = line.split('School Name:')[1]?.trim() || '';
        }
        if (line.includes('Subject Area:')) {
          criteriaData.subject = line.split('Subject Area:')[1]?.trim() || '';
        }
        if (line.includes('Topic/Unit:') || line.includes('Specific Topic:')) {
          const topicValue = line.split('Topic/Unit:')[1]?.trim() || line.split('Specific Topic:')[1]?.trim();
          criteriaData.topic = topicValue || '';
        }
        if (line.includes('Grade Level:')) {
          criteriaData.gradeLevel = line.split('Grade Level:')[1]?.trim() || '';
        }
      }

      console.log("📋 Extracted criteria data:", criteriaData);

      // Update the parent component with the extracted criteria using onCriteriaUpdate
      if (onCriteriaUpdate) {
        onCriteriaUpdate((prev) => ({
          ...prev,
          schoolDistrict: {
            ...prev.schoolDistrict,
            finalValue: criteriaData.schoolDistrict,
            detected: true,
            confidence: 1.0
          },
          school: {
            ...prev.school,
            finalValue: criteriaData.school,
            detected: true,
            confidence: 1.0
          },
          subject: {
            ...prev.subject,
            finalValue: criteriaData.subject,
            detected: true,
            confidence: 1.0
          },
          topic: {
            ...prev.topic,
            finalValue: criteriaData.topic,
            detected: true,
            confidence: 1.0
          },
          gradeLevel: {
            ...prev.gradeLevel,
            finalValue: criteriaData.gradeLevel,
            detected: true,
            confidence: 1.0
          }
        }));
      }

      // Mark stage 1 as complete
      if (onComponentComplete) {
        onComponentComplete("stage1-criteria");
      }
    }

    // Replace the buttons with user's confirmation message
    const confirmationUserMessage: Message = {
      id: Date.now().toString(),
      content: "Looks good!",
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [
      ...prev.map(msg => 
        msg.id === intakeConfirmationMessageId
          ? { 
              ...msg, 
              content: msg.content.replace('[INTAKE_CONFIRMATION_BUTTONS]', '')
            }
          : msg
      ),
      confirmationUserMessage
    ]);

    setIntakeConfirmationMessageId(null);
    setIsLoading(true);

    // Send to bot to get the stage transition response
    try {
      const response = await fetch("/api/claude/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.isBot ? "assistant" : "user",
              content: msg.content.replace('[INTAKE_CONFIRMATION_BUTTONS]', ''),
            })),
            { role: "user", content: "Looks good!" },
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
                if (!hasStartedStreaming) {
                  setIsLoading(false);
                  hasStartedStreaming = true;
                }
                
                botResponse += parsed.content;

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

      // Replace streaming message with final message
      const finalMessageId = `final-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === streamingMessageId 
            ? { ...msg, id: finalMessageId }
            : msg
        )
      );

      // Check for stage progression
      onStageProgression(botResponse);
    } catch (error) {
      console.error("Error confirming intake:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIntake = () => {
    if (!intakeConfirmationMessageId) return;

    // Replace the buttons with revision message and clear the confirmation
    setMessages(prev => prev.map(msg => 
      msg.id === intakeConfirmationMessageId
        ? { 
            ...msg, 
            content: msg.content.replace('[INTAKE_CONFIRMATION_BUTTONS]', "\n*No problem! What would you like to update? Just tell me what needs to be different.*")
          }
        : msg
    ));

    setIntakeConfirmationMessageId(null);
    // Conversation will continue naturally with user input
  };

  const handleRevisePersona = () => {
    // Replace the buttons with a message asking for revision
    setMessages(prev => prev.map(msg => 
      msg.id === personaConfirmationMessageId
        ? { 
            ...msg, 
            content: msg.content.replace('[PERSONA_CONFIRMATION_BUTTONS]', "\n*What would you like me to change about this persona? Please let me know and I'll revise it.*")
          }
        : msg
    ));
    
    setPersonaConfirmationMessageId(null);
  };

  // Message injection function for external components (like PersonalityTestingBot)
  const injectMessage = useCallback((messageContent: string) => {
    console.log("🟢 injectMessage called with:", messageContent);
    console.log("🟢 messageContent type:", typeof messageContent);
    console.log("🟢 messageContent length:", messageContent?.length);
    
    if (!messageContent || !messageContent.trim()) {
      console.error("🟢 Cannot inject empty message");
      return;
    }

    console.log("🟢 Creating injected message object");
    const injectedMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isBot: false,
      timestamp: new Date(),
    };

    console.log("🟢 Adding injected message to messages array");
    setMessages((prev) => [...prev, injectedMessage]);
    setIsLoading(true);

    console.log("🟢 Starting to process injected message through Claude API");

    // Process the injected message through the bot
    const processInjectedMessage = async () => {
      try {
        // Get current messages state at time of injection
        const currentMessages = messages.filter(msg => msg.content && msg.content.trim() !== "");
        
        const response = await fetch("/api/claude/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: [
              ...currentMessages.map((msg) => ({
                role: msg.isBot ? "assistant" : "user",
                content: msg.content,
              })),
              { role: "user", content: messageContent },
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

        // Trigger stage progression check
        onStageProgression(botResponse);

      } catch (error) {
        console.error("Chat error during message injection:", error);
        setMessages(prev => prev.filter(msg => !msg.id.startsWith("streaming")));
      } finally {
        setIsLoading(false);
      }
    };

    processInjectedMessage();
  }, [messages, botType, stageContext, uploadedFiles, onStageProgression]);

  // Expose the injection function to parent component
  // Periodic fallback check to ensure buttons appear (runs every 2 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const hasButtonMarkers = messages.some(msg => 
        msg.content.includes('[AVATAR_BUTTONS_HERE]') ||
        msg.content.includes('[BOUNDARIES_BUTTONS]') ||
        msg.content.includes('[BOUNDARIES_CONFIRMATION_BUTTONS]') ||
        msg.content.includes('[PERSONA_CONFIRMATION_BUTTONS]') ||
        msg.content.includes('[INTAKE_CONFIRMATION_BUTTONS]') ||
        msg.content.includes('[ASSESSMENT_TARGETS_CONFIRMATION_BUTTONS]') ||
        msg.content.includes('[TEST_YOUR_BOT]')
      );
      
      if (hasButtonMarkers) {
        console.log("🔧 PERIODIC CHECK: Button markers found, running fallback check");
        checkAndFixMissingButtons();
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [messages, avatarButtonMessageId, boundariesButtonMessageId, boundariesConfirmationMessageId, 
      personaConfirmationMessageId, intakeConfirmationMessageId, assessmentTargetsConfirmationMessageId, testBotButtonMessageId]);

  useEffect(() => {
    if (onInjectMessage) {
      onInjectMessage(injectMessage);
    }
  }, [onInjectMessage]);
  
  // Add useEffect to inject "Test Your Bot" message when Stage 3 is complete
  useEffect(() => {
    if (currentStageId === 3 && stages && !hasInjectedTestButton) {
      const stage3 = stages.find(s => s.id === 3);
      const allStage3ComponentsComplete = stage3?.components.every(comp => comp.completed) || false;
      
      if (allStage3ComponentsComplete) {
        console.log("🟢 Stage 3 complete, injecting Test Your Bot message");
        const testMessage = "[TEST_YOUR_BOT]";
        
        const testBotMessage: Message = {
          id: `test-bot-${Date.now()}`,
          content: testMessage,
          isBot: true,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, testBotMessage]);
        setTestBotButtonMessageId(testBotMessage.id);
        setHasInjectedTestButton(true);
      }
    }
  }, [currentStageId, stages, hasInjectedTestButton]);

  // Listen for custom inject-message events (for PersonalityTestingBot return trigger)
  useEffect(() => {
    const handleInjectMessage = (event: any) => {
      console.log("🟢 Custom event received:", event.detail);
      if (event.detail && event.detail.message && event.detail.stageId === currentStageId) {
        console.log("🟢 Processing custom event message:", event.detail.message);
        injectMessage(event.detail.message);
      }
    };

    window.addEventListener('inject-message', handleInjectMessage);
    
    return () => {
      window.removeEventListener('inject-message', handleInjectMessage);
    };
  }, [injectMessage, currentStageId]);

  // Helper function to detect if a message contains an INTAKE_CARD
  const detectIntakeCard = (content: string): { hasCard: boolean; cardContent: string; beforeCard: string; afterCard: string } => {
    console.log('🎯 CARD DETECTION - Checking content for INTAKE_CARD:', content.includes('INTAKE_CARD'));
    console.log('🎯 CARD DETECTION - Content preview:', content.substring(0, 200) + '...');
    
    const cardStartIndex = content.indexOf('INTAKE_CARD');
    if (cardStartIndex === -1) {
      console.log('🎯 CARD DETECTION - No INTAKE_CARD found in content');
      return { hasCard: false, cardContent: '', beforeCard: content, afterCard: '' };
    }
    
    console.log('🎯 CARD DETECTION - INTAKE_CARD found at index:', cardStartIndex);

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
        console.log('🎯 CARD PARSING - Line', i + ':', JSON.stringify(line));
        // Check if this line is a field (contains : and looks like a form field)
        if (line.includes(':') && line.match(/^[^:]+:\s*(.+|_____)\s*$/)) {
          console.log('🎯 CARD PARSING - Found field line:', line);
          cardLines.push(lines[i]);
        } else if (line === '' || line.startsWith('```')) {
          // Empty line or code block end - continue
          console.log('🎯 CARD PARSING - Found end marker or empty line:', line);
          if (line.startsWith('```')) {
            cardEndLine = i;
            break;
          }
        } else if (cardLines.length > 0) {
          // Non-field line after we've collected fields - end of card
          console.log('🎯 CARD PARSING - Non-field line after fields, ending card');
          cardEndLine = i - 1;
          break;
        } else {
          console.log('🎯 CARD PARSING - Skipping line before fields found');
        }
      }
    }

    if (cardStartLine === -1 || cardLines.length === 0) {
      console.log('🎯 CARD DETECTION - No valid card structure found. cardStartLine:', cardStartLine, 'cardLines.length:', cardLines.length);
      return { hasCard: false, cardContent: '', beforeCard: content, afterCard: '' };
    }
    
    console.log('🎯 CARD DETECTION - Valid card detected with', cardLines.length, 'fields');

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

    // Don't intercept the flow here - let the bot respond naturally

    // For other stages, continue with normal flow
    setIsLoading(true);

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

                // REAL-TIME JSON DETECTION - Check for complete JSON blocks during streaming
                if (botResponse.includes('```json') && botResponse.includes('```')) {
                  console.log('🚀 REAL-TIME - Found complete JSON block in stream, length:', botResponse.length);
                  console.log('🚀 REAL-TIME - Stream contains confirm_learning_targets:', botResponse.includes('confirm_learning_targets'));
                  
                  const jsonBlockRegex = /```json\s*[\r\n]+([\s\S]*?)[\r\n]+```/g;
                  let match;
                  
                  while ((match = jsonBlockRegex.exec(botResponse)) !== null) {
                    try {
                      const jsonStr = match[1];
                      console.log('🚀 REAL-TIME - Extracted JSON during streaming:', jsonStr);
                      const jsonData = JSON.parse(jsonStr);
                      
                      if (jsonData.action) {
                        console.log('🚀 REAL-TIME JSON DETECTION - Found action during streaming:', jsonData.action);
                        
                        // Set button states immediately when JSON is detected during streaming
                        switch (jsonData.action) {
                          case "confirm_learning_targets":
                            if (!assessmentTargetsConfirmationMessageId) {
                              console.log('🚀 REAL-TIME - Setting assessment targets buttons during streaming');
                              setAssessmentTargetsConfirmationMessageId(streamingMessageId);
                            }
                            break;
                          case "confirm_basics":
                            if (!intakeConfirmationMessageId) {
                              console.log('🚀 REAL-TIME - Setting intake confirmation buttons during streaming');
                              setIntakeConfirmationMessageId(streamingMessageId);
                            }
                            break;
                          case "confirm_persona":
                            if (!personaConfirmationMessageId) {
                              console.log('🚀 REAL-TIME - Setting persona confirmation buttons during streaming');
                              setPersonaConfirmationMessageId(streamingMessageId);
                            }
                            break;
                          // Add other cases as needed
                        }
                      }
                    } catch (parseError) {
                      console.log('🚀 REAL-TIME - JSON not complete yet, parseError:', parseError);
                      // JSON not complete yet, continue streaming
                    }
                  }
                }
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

      console.log('🔍 STREAM COMPLETION - About to run immediate JSON detection');
      console.log('🔍 STREAM COMPLETION - botResponse length:', botResponse.length);
      console.log('🔍 STREAM COMPLETION - finalMessageId:', finalMessageId);

      // IMMEDIATE JSON DETECTION - Process JSON buttons ONLY in the current bot response
      console.log('🔍 IMMEDIATE JSON DETECTION - Processing CURRENT response only:', botResponse.substring(0, 100) + '...');
      console.log('🔍 IMMEDIATE JSON DETECTION - Response end:', botResponse.slice(-200));
      console.log('🔍 IMMEDIATE JSON DETECTION - Full response length:', botResponse.length);
      console.log('🔍 IMMEDIATE JSON DETECTION - Response contains JSON marker:', botResponse.includes('```json'));
      console.log('🔍 IMMEDIATE JSON DETECTION - Response contains confirm_learning_targets:', botResponse.includes('confirm_learning_targets'));
      console.log('🔍 IMMEDIATE JSON DETECTION - Response contains closing json marker:', botResponse.includes('```', botResponse.indexOf('```json') + 1));
      
      try {
        // Look for JSON blocks ONLY in the current bot response (not conversation history)
        const jsonBlockRegex = /```json\s*[\r\n]+([\s\S]*?)[\r\n]+```/g;
        let match;
        
        while ((match = jsonBlockRegex.exec(botResponse)) !== null) {
          try {
            const jsonStr = match[1];
            console.log('🔍 IMMEDIATE JSON DETECTION - Extracted JSON string:', jsonStr);
            const jsonData = JSON.parse(jsonStr);
            console.log('🔍 IMMEDIATE JSON DETECTION - Found valid JSON:', jsonData);
            
            if (jsonData.action) {
              console.log('🔍 IMMEDIATE JSON DETECTION - Processing action:', jsonData.action);
              console.log('🔍 IMMEDIATE JSON DETECTION - Current assessmentTargetsConfirmationMessageId:', assessmentTargetsConfirmationMessageId);
              
              switch (jsonData.action) {
                case "confirm_learning_targets":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting assessment targets confirmation buttons immediately');
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting finalMessageId to:', finalMessageId);
                  setAssessmentTargetsConfirmationMessageId(finalMessageId);
                  break;
                case "confirm_basics":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting intake confirmation buttons immediately');
                  setIntakeConfirmationMessageId(finalMessageId);
                  break;
                case "confirm_persona":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting persona confirmation buttons immediately');
                  setPersonaConfirmationMessageId(finalMessageId);
                  break;
                case "set_boundaries":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting boundaries buttons immediately');
                  setBoundariesButtonMessageId(finalMessageId);
                  break;
                case "confirm_boundaries":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting boundaries confirmation buttons immediately');
                  setBoundariesConfirmationMessageId(finalMessageId);
                  break;
                case "generate_avatar":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting avatar buttons immediately');
                  setAvatarButtonMessageId(finalMessageId);
                  
                  // Auto-trigger avatar generation
                  console.log('🎨 AUTO-GENERATION - Triggering automatic avatar generation from JSON');
                  setTimeout(() => {
                    // Use the handleCreateAvatar function to automatically generate
                    if (finalMessageId) {
                      console.log('🎨 AUTO-GENERATION - Calling handleCreateAvatar automatically');
                      // Trigger generation automatically
                      handleCreateAvatar();
                    }
                  }, 500);
                  break;
                case "test_bot":
                  console.log('🔍 IMMEDIATE JSON DETECTION - Setting test bot button immediately');
                  setTestBotButtonMessageId(finalMessageId);
                  break;
              }
            }
          } catch (parseError) {
            console.log('🔍 IMMEDIATE JSON DETECTION - Failed to parse JSON block:', parseError);
            console.log('🔍 IMMEDIATE JSON DETECTION - Raw JSON that failed to parse:', match[1]);
          }
        }
      } catch (error) {
        console.log('🔍 IMMEDIATE JSON DETECTION - Error processing JSON:', error);
      }
      
      // DEBUG: Show what we're actually searching through
      if (botResponse.includes('confirm_learning_targets')) {
        console.log('🔍 DEBUG - Response contains confirm_learning_targets, searching around it...');
        const targetIndex = botResponse.indexOf('confirm_learning_targets');
        const contextStart = Math.max(0, targetIndex - 200);
        const contextEnd = Math.min(botResponse.length, targetIndex + 200);
        console.log('🔍 DEBUG - Context around confirm_learning_targets:', botResponse.substring(contextStart, contextEnd));
      }

      // Check for intake confirmation summary in Stage 1
      if (currentStageId === 1 && botType === "intake-basics" && 
          (botResponse.includes("Ok! Here's what I've got so far:") || 
           botResponse.includes("Ok, here's what I've got so far:"))) {
        console.log("🎯 Summary detected in bot response - adding confirmation buttons");
        console.log("🎯 Current finalMessageId:", finalMessageId);
        console.log("🎯 Bot response length:", botResponse.length);
        
        // Add confirmation buttons to the bot response
        const updatedResponse = botResponse + "\n\n[INTAKE_CONFIRMATION_BUTTONS]";
        console.log("🎯 Updated response includes marker:", updatedResponse.includes('[INTAKE_CONFIRMATION_BUTTONS]'));
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === finalMessageId) {
            console.log("🎯 Updating message with finalMessageId:", finalMessageId, "to include buttons");
            return { ...msg, content: updatedResponse };
          }
          return msg;
        }));
        
        console.log("🎯 Setting intakeConfirmationMessageId to:", finalMessageId);
        setIntakeConfirmationMessageId(finalMessageId);
      }

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
        // REMOVED: Legacy [BOUNDARIES_BUTTONS] logging - now using JSON-only detection
        console.log("🔥 STREAMING COMPLETION - currentStageId:", currentStageId, "botType:", botType);
        console.log("🔥 STREAMING COMPLETION - botResponse preview:", botResponse.substring(botResponse.length - 300));
        
        // REMOVED: Legacy auto-injection of [BOUNDARIES_BUTTONS] marker
        // Now using JSON-based detection only via immediate JSON detection below
        
        // NOW update the message ID and content together
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === streamingMessageId 
              ? { ...msg, id: finalMessageId, content: botResponse }
              : msg
          )
        );

        // Add immediate JSON detection for user messages  
        console.log('🔍 USER MESSAGE COMPLETION - Processing JSON detection');
        console.log('🔍 USER MESSAGE COMPLETION - botResponse contains ```json:', botResponse.includes('```json'));
        console.log('🔍 USER MESSAGE COMPLETION - botResponse contains confirm_persona:', botResponse.includes('confirm_persona'));
        
        try {
          // First try markdown JSON blocks - using flexible regex for different newline formats
          const jsonBlockRegex = /```json\s*[\r\n]+([\s\S]*?)[\r\n]+```/g;
          let match;
          let foundAction = false;
          
          console.log('🔍 USER MESSAGE JSON DETECTION - Attempting to match with regex');
          while ((match = jsonBlockRegex.exec(botResponse)) !== null) {
            console.log('🔍 USER MESSAGE JSON DETECTION - Found markdown JSON match:', match[1]);
            try {
              const jsonData = JSON.parse(match[1]);
              if (jsonData.action) {
                console.log('🔍 USER MESSAGE JSON DETECTION - Processing action:', jsonData.action);
                foundAction = true;
                switch (jsonData.action) {
                  case "confirm_learning_targets":
                    console.log('🔍 USER MESSAGE JSON DETECTION - Setting assessment targets confirmation buttons');
                    setAssessmentTargetsConfirmationMessageId(finalMessageId);
                    break;
                  case "confirm_basics":
                    setIntakeConfirmationMessageId(finalMessageId);
                    break;
                  case "confirm_persona":
                    console.log('🔍 USER MESSAGE JSON DETECTION - Setting persona confirmation buttons');
                    setPersonaConfirmationMessageId(finalMessageId);
                    break;
                  case "set_boundaries":
                    setBoundariesButtonMessageId(finalMessageId);
                    break;
                  case "confirm_boundaries":
                    setBoundariesConfirmationMessageId(finalMessageId);
                    break;
                  case "generate_avatar":
                    setAvatarButtonMessageId(finalMessageId);
                    break;
                  case "test_bot":
                    setTestBotButtonMessageId(finalMessageId);
                    break;
                }
              }
            } catch (parseError) {
              console.log('🔍 USER MESSAGE JSON DETECTION - JSON parse error:', parseError);
            }
          }
          
          // If no markdown JSON found, try plain JSON format (like what Claude actually sent)
          if (!foundAction) {
            console.log('🔍 USER MESSAGE JSON DETECTION - No markdown JSON found, trying plain JSON detection');
            // Look for JSON object patterns in the response
            const plainJsonRegex = /\{\s*"action":\s*"[^"]+"\s*,[\s\S]*?\}/g;
            let plainMatch;
            
            while ((plainMatch = plainJsonRegex.exec(botResponse)) !== null) {
              try {
                const jsonData = JSON.parse(plainMatch[0]);
                if (jsonData.action) {
                  console.log('🔍 USER MESSAGE PLAIN JSON DETECTION - Processing action:', jsonData.action);
                  switch (jsonData.action) {
                    case "confirm_learning_targets":
                      console.log('🔍 USER MESSAGE PLAIN JSON DETECTION - Setting assessment targets confirmation buttons');
                      setAssessmentTargetsConfirmationMessageId(finalMessageId);
                      break;
                    case "confirm_basics":
                      setIntakeConfirmationMessageId(finalMessageId);
                      break;
                    case "confirm_persona":
                      console.log('🔍 USER MESSAGE PLAIN JSON DETECTION - Setting persona confirmation buttons');
                      setPersonaConfirmationMessageId(finalMessageId);
                      break;
                    case "set_boundaries":
                      setBoundariesButtonMessageId(finalMessageId);
                      break;
                    case "confirm_boundaries":
                      setBoundariesConfirmationMessageId(finalMessageId);
                      // Store the complete boundary data directly
                      if (jsonData.data) {
                        const combinedBoundaries = jsonData.data.standardBoundaries + 
                          (jsonData.data.additionalBoundaries ? `. ${jsonData.data.additionalBoundaries}` : '');
                        console.log('🚧 BOUNDARIES - Storing combined boundaries from JSON:', combinedBoundaries);
                        setExtractedBoundaries(combinedBoundaries);
                      }
                      break;
                    case "generate_avatar":
                      setAvatarButtonMessageId(finalMessageId);
                      break;
                    case "test_bot":
                      setTestBotButtonMessageId(finalMessageId);
                      break;
                  }
                }
              } catch (parseError) {
                console.log('🔍 USER MESSAGE PLAIN JSON DETECTION - JSON parse error:', parseError);
              }
            }
          }
        } catch (error) {
          console.log('🔍 USER MESSAGE JSON DETECTION - Error:', error);
        }

        // Trigger background analysis after bot response is complete


        // Check for intake confirmation summary in Stage 1 (for revision flow)
        if (currentStageId === 1 && botType === "intake-basics" && 
            (botResponse.includes("Ok! Here's what I've got so far:") || 
             botResponse.includes("Ok, here's what I've got so far:"))) {
          console.log("🎯 REVISION FLOW: Summary detected in regular message - adding confirmation buttons");
          console.log("🎯 REVISION FLOW: Current finalMessageId:", finalMessageId);
          console.log("🎯 REVISION FLOW: Bot response length:", botResponse.length);
          
          // Add confirmation buttons to the bot response
          const updatedResponse = botResponse + "\n\n[INTAKE_CONFIRMATION_BUTTONS]";
          console.log("🎯 REVISION FLOW: Updated response includes marker:", updatedResponse.includes('[INTAKE_CONFIRMATION_BUTTONS]'));
          
          setMessages(prev => prev.map(msg => {
            if (msg.id === finalMessageId) {
              console.log("🎯 REVISION FLOW: Updating message with finalMessageId:", finalMessageId, "to include buttons");
              return { ...msg, content: updatedResponse };
            }
            return msg;
          }));
          
          console.log("🎯 REVISION FLOW: Setting intakeConfirmationMessageId to:", finalMessageId);
          setIntakeConfirmationMessageId(finalMessageId);
          
          // Multiple attempts to ensure buttons appear
          setTimeout(() => {
            console.log("🎯 Force re-render for intake confirmation buttons attempt 1");
            setMessages(prev => prev.map(msg => 
              msg.id === finalMessageId ? { ...msg, content: msg.content } : msg
            ));
            setIntakeConfirmationMessageId(finalMessageId);
          }, 50);
          
          setTimeout(() => {
            console.log("🎯 Re-setting intake confirmation button state attempt 2");
            setIntakeConfirmationMessageId(finalMessageId);
          }, 200);
          
          setTimeout(() => {
            console.log("🎯 Final attempt to set intake confirmation button state");
            setIntakeConfirmationMessageId(finalMessageId);
          }, 500);
        }

        // Check for persona confirmation button marker in Stage 3
        if (currentStageId === 3 && botType === "intake-assessment-bot" && botResponse.includes('[PERSONA_CONFIRMATION_BUTTONS]')) {
          console.log("✅ Persona confirmation buttons detected in streaming response");
          setPersonaConfirmationMessageId(finalMessageId);
          
          // Multiple attempts to ensure buttons appear
          setTimeout(() => {
            console.log("✅ Force re-render for persona confirmation buttons attempt 1");
            setMessages(prev => prev.map(msg => 
              msg.id === finalMessageId ? { ...msg, content: msg.content } : msg
            ));
            setPersonaConfirmationMessageId(finalMessageId);
          }, 50);
          
          setTimeout(() => {
            console.log("✅ Re-setting persona confirmation button state attempt 2");
            setPersonaConfirmationMessageId(finalMessageId);
          }, 200);
          
          setTimeout(() => {
            console.log("✅ Final attempt to set persona confirmation button state");
            setPersonaConfirmationMessageId(finalMessageId);
          }, 500);
        }

        // Check for avatar button marker in Stage 3 (more robust detection)
        if (currentStageId === 3 && botType === "intake-assessment-bot" && botResponse.includes('[AVATAR_BUTTONS_HERE]')) {
          console.log("🎨 Avatar buttons detected in streaming response - setting state to:", finalMessageId);
          
          // Set state immediately to hide marker text
          setAvatarButtonMessageId(finalMessageId);
          
          // Force immediate re-render to ensure visibility
          setMessages(prev => prev.map(msg => 
            msg.id === finalMessageId ? { ...msg, content: msg.content } : msg
          ));
          
          // Additional attempts with delays to ensure buttons appear
          setTimeout(() => {
            console.log("🎨 Force re-render for avatar buttons attempt 1");
            setMessages(prev => prev.map(msg => 
              msg.id === finalMessageId ? { ...msg, content: msg.content } : msg
            ));
            setAvatarButtonMessageId(finalMessageId); // Re-set state
          }, 50);
          
          setTimeout(() => {
            console.log("🎨 Re-setting avatar button state attempt 2");
            setAvatarButtonMessageId(finalMessageId); // Re-set state again
          }, 200);
          
          setTimeout(() => {
            console.log("🎨 Final attempt to set avatar button state");
            setAvatarButtonMessageId(finalMessageId); // Final re-set
          }, 500);
        }

        // REMOVED: Legacy [BOUNDARIES_BUTTONS] marker detection - now using JSON-only detection

        // Check for boundaries confirmation button marker in Stage 3
        if (currentStageId === 3 && botType === "intake-assessment-bot" && botResponse.includes('[BOUNDARIES_CONFIRMATION_BUTTONS]')) {
          console.log("🚧 Boundaries confirmation buttons detected in streaming response");
          
          // Set state immediately to hide the marker text
          setBoundariesConfirmationMessageId(finalMessageId);
          
          // Multiple attempts to ensure buttons appear with same pattern as avatar buttons
          setTimeout(() => {
            console.log("🚧 Force re-render for boundaries confirmation buttons attempt 1");
            setMessages(prev => prev.map(msg => 
              msg.id === finalMessageId ? { ...msg, content: msg.content } : msg
            ));
            setBoundariesConfirmationMessageId(finalMessageId); // Re-set state
          }, 50);
          
          setTimeout(() => {
            console.log("🚧 Re-setting boundaries confirmation button state attempt 2");
            setBoundariesConfirmationMessageId(finalMessageId); // Re-set state
          }, 200);
          
          setTimeout(() => {
            console.log("🚧 Final attempt to set boundaries confirmation button state");
            setBoundariesConfirmationMessageId(finalMessageId); // Final re-set
          }, 500);
        }

        // Check for assessment targets confirmation button marker in Stage 2 (more robust detection)
        if (currentStageId === 2 && botType === "intake-context" && botResponse.includes('[ASSESSMENT_TARGETS_CONFIRMATION_BUTTONS]')) {
          console.log("🎯 Assessment targets confirmation buttons detected in streaming response - setting state to:", finalMessageId);
          setAssessmentTargetsConfirmationMessageId(finalMessageId);
          
          // Multiple attempts to ensure buttons appear
          setTimeout(() => {
            console.log("🎯 Force re-render for assessment targets confirmation buttons attempt 1");
            setMessages(prev => prev.map(msg => 
              msg.id === finalMessageId ? { ...msg, content: msg.content } : msg
            ));
            setAssessmentTargetsConfirmationMessageId(finalMessageId);
          }, 50);
          
          setTimeout(() => {
            console.log("🎯 Re-setting assessment targets confirmation button state attempt 2");
            setAssessmentTargetsConfirmationMessageId(finalMessageId);
          }, 200);
          
          setTimeout(() => {
            console.log("🎯 Final attempt to set assessment targets confirmation button state");
            setAssessmentTargetsConfirmationMessageId(finalMessageId);
          }, 500);
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

    // Fallback check system - run after all retry attempts
    setTimeout(() => {
      console.log("🔧 FALLBACK CHECK: Running button verification system");
      checkAndFixMissingButtons();
    }, 1000);
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
                    // Regular message without card - check for persona confirmation, intake confirmation, or avatar buttons
                    const hasPersonaConfirmationButtons = message.content.includes('[PERSONA_CONFIRMATION_BUTTONS]');
                    const hasIntakeConfirmationButtons = message.content.includes('[INTAKE_CONFIRMATION_BUTTONS]');
                    const hasAvatarButtons = message.content.includes('[AVATAR_BUTTONS_HERE]');
                    const hasTestButton = message.content.includes('[TEST_YOUR_BOT]');
                    
                    // Debug avatar button detection
                    if (hasAvatarButtons) {
                      console.log("🎨 AVATAR DEBUG - Found AVATAR_BUTTONS_HERE in message:", message.id);
                      console.log("🎨 AVATAR DEBUG - Current avatarButtonMessageId:", avatarButtonMessageId);
                      console.log("🎨 AVATAR DEBUG - State match:", avatarButtonMessageId === message.id);
                    }
                    const hasBoundariesButtons = message.content.includes('[BOUNDARIES_BUTTONS]');
                    
                    // Debug boundaries button state
                    if (hasBoundariesButtons) {
                      console.log("🚧 BOUNDARIES DEBUG - Found BOUNDARIES_BUTTONS in message:", message.id);
                      console.log("🚧 BOUNDARIES DEBUG - Current boundariesButtonMessageId:", boundariesButtonMessageId);
                      console.log("🚧 BOUNDARIES DEBUG - State match:", boundariesButtonMessageId === message.id);
                    }
                    const hasBoundariesConfirmationButtons = message.content.includes('[BOUNDARIES_CONFIRMATION_BUTTONS]');
                    const hasAssessmentTargetsConfirmationButtons = message.content.includes('[ASSESSMENT_TARGETS_CONFIRMATION_BUTTONS]');
                    if (hasAssessmentTargetsConfirmationButtons) {
                      console.log("🎯 ASSESSMENT DEBUG - Found ASSESSMENT_TARGETS_CONFIRMATION_BUTTONS in message:", message.id);
                      console.log("🎯 ASSESSMENT DEBUG - Current assessmentTargetsConfirmationMessageId:", assessmentTargetsConfirmationMessageId);
                      
                      // Set the assessment targets confirmation message ID if not already set
                      if (!assessmentTargetsConfirmationMessageId) {
                        console.log("🎯 ASSESSMENT DEBUG - Setting assessmentTargetsConfirmationMessageId to:", message.id);
                        setAssessmentTargetsConfirmationMessageId(message.id);
                      }
                    }
                    
                    if (personaConfirmationMessageId === message.id) {
                      // Show persona confirmation buttons - triggered by JSON detection, not marker
                      console.log('🎭 PERSONA BUTTONS - Rendering buttons for message:', message.id);
                      console.log('🎭 PERSONA BUTTONS - personaConfirmationMessageId:', personaConfirmationMessageId);
                      const beforeButtons = message.content;
                      const afterButtons = "";
                      
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
                          
                          {/* Persona confirmation buttons */}
                          <div className="flex gap-3 my-4">
                            <Button
                              onClick={handleConfirmPersona}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              ✓ Confirm This Persona
                            </Button>
                            <Button
                              onClick={handleRevisePersona}
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              ✏️ Make Changes
                            </Button>
                          </div>
                          
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
                    } else if (hasIntakeConfirmationButtons && intakeConfirmationMessageId === message.id) {
                      console.log("🎯 RENDERING: Intake confirmation buttons detected");
                      console.log("🎯 RENDERING: Message ID:", message.id);
                      console.log("🎯 RENDERING: Expected ID:", intakeConfirmationMessageId);
                      console.log("🎯 RENDERING: Message content includes marker:", hasIntakeConfirmationButtons);
                      
                      // Split content around the intake confirmation marker
                      const [beforeButtons, afterButtons] = message.content.split('[INTAKE_CONFIRMATION_BUTTONS]');
                      
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
                          
                          {/* Intake confirmation buttons */}
                          <div className="flex gap-3 my-4">
                            <Button
                              onClick={handleConfirmIntake}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              ✓ Looks Good!
                            </Button>
                            <Button
                              onClick={handleUpdateIntake}
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              ✏️ Update Details
                            </Button>
                          </div>
                          
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
                    } else if (avatarButtonMessageId === message.id) {
                      console.log("🎨 AVATAR DEBUG - Rendering avatar content for message:", message.id);
                      // Remove JSON blocks from display since we use JSON detection
                      const contentWithoutJson = message.content.replace(/```json\s*\n[\s\S]*?\n```/g, '').trim();
                      
                      // Check if this message already has a generated avatar image
                      const hasGeneratedAvatar = contentWithoutJson.includes('![Generated Avatar]') || contentWithoutJson.includes('![');
                      
                      console.log("🎨 AVATAR DEBUG - Has generated avatar:", hasGeneratedAvatar);
                      console.log("🎨 AVATAR DEBUG - Content preview:", contentWithoutJson.substring(0, 100));
                      
                      return (
                        <div className="prose prose-sm max-w-none">
                          {/* Message content */}
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
                              img: ({ src, alt }) => {
                                console.log("🖼️ AVATAR IMG COMPONENT - Rendering avatar image:", { src, alt });
                                return (
                                  <div className="my-4 text-center">
                                    <img 
                                      src={src} 
                                      alt={alt} 
                                      className="max-w-full h-auto rounded-lg shadow-md mx-auto max-h-96"
                                      style={{ maxHeight: '384px' }}
                                      onLoad={() => console.log("🖼️ AVATAR IMG COMPONENT - Avatar image loaded successfully:", src)}
                                      onError={(e) => console.error("🖼️ AVATAR IMG COMPONENT - Avatar image failed to load:", src, e)}
                                    />
                                    {alt && (
                                      <p className="text-sm text-gray-600 mt-2 italic">{alt}</p>
                                    )}
                                  </div>
                                );
                              },
                            }}
                          >
                            {contentWithoutJson}
                          </ReactMarkdown>
                          
                          {/* Only show avatar buttons if no avatar has been generated yet */}
                          {!hasGeneratedAvatar && (
                            <AvatarButtons
                              onCreateAvatar={handleCreateAvatar}
                              onReviseDescription={handleReviseDescription}
                              isGenerating={isGeneratingAvatar}
                            />
                          )}
                        </div>
                      );
                    } else if (boundariesButtonMessageId === message.id) {
                      console.log("🚧 BOUNDARIES DEBUG - Rendering boundaries buttons for message:", message.id);
                      // Remove JSON blocks from display since we use JSON detection
                      const contentWithoutJson = message.content.replace(/```json\s*\n[\s\S]*?\n```/g, '').trim();
                      
                      return (
                        <div className="prose prose-sm max-w-none">
                          {/* Message content */}
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
                            {contentWithoutJson}
                          </ReactMarkdown>
                          {/* Boundaries buttons */}
                          <div className="flex flex-col gap-3 my-4 max-w-md">
                            <Button 
                              onClick={async () => {
                                console.log("🚧 Looks good button clicked for boundaries");
                                
                                // Replace with confirmation message (remove JSON)
                                setMessages(prev => prev.map(msg => 
                                  msg.id === boundariesButtonMessageId
                                    ? { 
                                        ...msg, 
                                        content: contentWithoutJson + "\n\n*Perfect! No additional boundaries needed. Now let's create your bot's visual avatar.*"
                                      }
                                    : msg
                                ));
                                
                                // Set boundaries to default when no additional ones needed
                                setExtractedBoundaries("Follow normal school-appropriate standards");
                                
                                // Clear the button state
                                setBoundariesButtonMessageId(null);
                                
                                // Send continuation message to bot
                                await sendButtonMessage("No additional boundaries needed. Let's create the avatar.");
                              }}
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                            >Use Standard Boundaries</Button>
                            <Button 
                              onClick={async () => {
                                console.log("🚧 Add specific boundaries clicked");
                                
                                // Replace with revision message (remove JSON)
                                setMessages(prev => prev.map(msg => 
                                  msg.id === boundariesButtonMessageId
                                    ? { 
                                        ...msg, 
                                        content: contentWithoutJson + "\n\n*What specific boundaries would you like me to add for your bot? Please describe what topics or approaches it should avoid.*"
                                      }
                                    : msg
                                ));
                                
                                // Clear the button state
                                setBoundariesButtonMessageId(null);
                                
                                // Send continuation message to bot
                                await sendButtonMessage("I want to add specific boundaries for my bot. Please ask me what I'd like to avoid.");
                              }}
                              className="w-full hover:bg-orange-200 border border-orange-300 font-medium py-2.5 px-4 rounded-lg transition-colors bg-[#ffffff] text-[#000000]"
                            >
                              Add additional boundaries
                            </Button>
                          </div>
                        </div>
                      );
                    } else if (boundariesConfirmationMessageId === message.id) {
                      // Remove JSON blocks from display since we use JSON detection
                      const contentWithoutJson = message.content.replace(/```json\s*\n[\s\S]*?\n```/g, '').trim();
                      
                      return (
                        <div className="prose prose-sm max-w-none">
                          {/* Message content */}
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
                            {contentWithoutJson}
                          </ReactMarkdown>
                          
                          {/* Boundaries confirmation buttons */}
                          <div className="flex flex-col gap-3 my-4 max-w-md">
                            <Button 
                              onClick={async () => {
                                console.log("🚧 Yes, boundaries correct button clicked");
                                
                                // Replace with confirmation message (remove JSON)
                                setMessages(prev => prev.map(msg => 
                                  msg.id === boundariesConfirmationMessageId
                                    ? { 
                                        ...msg, 
                                        content: contentWithoutJson + "\n\n*Perfect! Those boundaries are confirmed.*"
                                      }
                                    : msg
                                ));
                                
                                // Boundaries are now extracted automatically during JSON detection
                                // No manual extraction needed here since it's handled in the streaming completion flow
                                
                                // Clear the button state
                                setBoundariesConfirmationMessageId(null);
                                
                                // Send continuation message to bot
                                await sendButtonMessage("Yes, that's correct");
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Yes, that's correct
                            </Button>
                            <Button 
                              onClick={async () => {
                                console.log("🚧 Let me revise boundaries button clicked");
                                
                                // Replace with revision message (remove JSON)
                                setMessages(prev => prev.map(msg => 
                                  msg.id === boundariesConfirmationMessageId
                                    ? { 
                                        ...msg, 
                                        content: contentWithoutJson + "\n\n*What changes would you like me to make to the boundaries?*"
                                      }
                                    : msg
                                ));
                                
                                // Clear the button state
                                setBoundariesConfirmationMessageId(null);
                                
                                // Send continuation message to bot
                                await sendButtonMessage("Let me revise that");
                              }}
                              variant="outline"
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              Let me revise that
                            </Button>
                          </div>
                        </div>
                      );
                    } else if (assessmentTargetsConfirmationMessageId === message.id) {
                      // Display the full content without JSON markers, since we now use JSON detection
                      // Remove JSON blocks from display
                      const contentWithoutJson = message.content.replace(/```json\s*\n[\s\S]*?\n```/g, '').trim();
                      
                      return (
                        <div className="prose prose-sm max-w-none">
                          {/* Message content */}
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
                            {contentWithoutJson}
                          </ReactMarkdown>
                          
                          {/* Assessment targets confirmation buttons */}
                          <div className="flex flex-col gap-3 my-4 max-w-md">
                            <Button 
                              onClick={async () => {
                                console.log("🎯 Yes, those targets work button clicked");
                                
                                // Replace with confirmation message (remove JSON)
                                setMessages(prev => prev.map(msg => 
                                  msg.id === assessmentTargetsConfirmationMessageId
                                    ? { 
                                        ...msg, 
                                        content: contentWithoutJson + "\n\n*Perfect! Those assessment targets look great.*"
                                      }
                                    : msg
                                ));
                                
                                // Clear the button state
                                setAssessmentTargetsConfirmationMessageId(null);
                                
                                // Send continuation message to bot
                                await sendButtonMessage("Yes, those targets work");
                              }}
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                            >
                              Yes, those targets work
                            </Button>
                            <Button 
                              onClick={async () => {
                                console.log("🎯 Let me revise those button clicked");
                                
                                // Replace with revision message (remove JSON)
                                setMessages(prev => prev.map(msg => 
                                  msg.id === assessmentTargetsConfirmationMessageId
                                    ? { 
                                        ...msg, 
                                        content: contentWithoutJson + "\n\n*What changes would you like me to make to the assessment targets?*"
                                      }
                                    : msg
                                ));
                                
                                // Clear the button state
                                setAssessmentTargetsConfirmationMessageId(null);
                                
                                // Send continuation message to bot
                                await sendButtonMessage("Let me revise those");
                              }}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-full hover:bg-orange-200 border border-orange-300 font-medium py-2.5 px-4 rounded-lg transition-colors bg-[#ffffff] text-[#000000]"
                            >
                              Let me revise those
                            </Button>
                          </div>
                        </div>
                      );
                    } else if (hasTestButton && testBotButtonMessageId === message.id) {
                      // Special test button rendering
                      return (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                          <div className="text-center">
                            <div className="mb-3">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">🎉 Your Assessment Bot is Ready!</h3>
                              <p className="text-sm text-gray-600">Test your bot to see how it will interact with students</p>
                            </div>
                            <Button
                              onClick={onTestBotClick}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                              size="lg"
                            >
                              🤖 Test Your Bot
                            </Button>
                          </div>
                        </div>
                      );
                    } else {
                      // Regular message without special buttons
                      // Hide marker text if the corresponding state hasn't been set yet
                      let displayContent = message.content;
                      
                      // Remove markers that haven't been activated yet
                      if (message.content.includes('[BOUNDARIES_CONFIRMATION_BUTTONS]') && !boundariesConfirmationMessageId) {
                        displayContent = displayContent.replace('[BOUNDARIES_CONFIRMATION_BUTTONS]', '');
                      }
                      if (message.content.includes('[AVATAR_BUTTONS_HERE]') && !avatarButtonMessageId) {
                        displayContent = displayContent.replace('[AVATAR_BUTTONS_HERE]', '');
                      }
                      // REMOVED: Legacy [BOUNDARIES_BUTTONS] marker cleanup - now using JSON-only detection
                      if (message.content.includes('[ASSESSMENT_TARGETS_CONFIRMATION_BUTTONS]') && !assessmentTargetsConfirmationMessageId) {
                        displayContent = displayContent.replace('[ASSESSMENT_TARGETS_CONFIRMATION_BUTTONS]', '');
                      }
                      if (message.content.includes('[PERSONA_CONFIRMATION_BUTTONS]') && !personaConfirmationMessageId) {
                        displayContent = displayContent.replace('[PERSONA_CONFIRMATION_BUTTONS]', '');
                      }
                      if (message.content.includes('[INTAKE_CONFIRMATION_BUTTONS]') && !intakeConfirmationMessageId) {
                        displayContent = displayContent.replace('[INTAKE_CONFIRMATION_BUTTONS]', '');
                      }
                      if (message.content.includes('[TEST_YOUR_BOT]') && !testBotButtonMessageId) {
                        displayContent = displayContent.replace('[TEST_YOUR_BOT]', '');
                      }
                      
                      console.log("🖼️ REGULAR MESSAGE - Rendering message with content:", displayContent.substring(0, 100) + "...");
                      console.log("🖼️ REGULAR MESSAGE - Contains image markdown:", displayContent.includes('!['));
                      
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
                              img: ({ src, alt }) => {
                                console.log("🖼️ IMG COMPONENT - Rendering image:", { src, alt });
                                return (
                                  <div className="my-4 text-center">
                                    <img 
                                      src={src} 
                                      alt={alt} 
                                      className="max-w-full h-auto rounded-lg shadow-md mx-auto max-h-96"
                                      style={{ maxHeight: '384px' }}
                                      onLoad={() => console.log("🖼️ IMG COMPONENT - Image loaded successfully:", src)}
                                      onError={(e) => console.error("🖼️ IMG COMPONENT - Image failed to load:", src, e)}
                                    />
                                    {alt && (
                                      <p className="text-sm text-gray-600 mt-2 italic">{alt}</p>
                                    )}
                                  </div>
                                );
                              },
                            }}
                          >
                            {displayContent}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                  }
                })()
              ) : (
                // Check if this user message has card data to render as completed card
                (message.cardData ? (<CompletedIntakeCard data={message.cardData} />) : (<div className="whitespace-pre-wrap">{message.content}</div>))
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
  const [botSampleDialogue, setBotSampleDialogue] = useState<string | null>(null);
  const [botVisualDescription, setBotVisualDescription] = useState<string | null>(null);
  const [showPersonalityTester, setShowPersonalityTester] = useState(false);
  const [personalityTesterExpanded, setPersonalityTesterExpanded] = useState(false);
  const [extractedBoundaries, setExtractedBoundaries] = useState<string>("");
  const [messageInjectionFunction, setMessageInjectionFunction] = useState<((message: string) => void) | null>(null);
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

  // Function to skip to boundaries stage with Detective Piggy data
  const skipToBoundaries = () => {
    console.log("🚀 SKIP TO BOUNDARIES: Loading Detective Piggy state...");
    
    // Set up basic stage 1 data
    const stage1Data = {
      schoolDistrict: "Blueberry",
      school: "Redmond Middle School", 
      subject: "English",
      topic: "Lord of the Flies symbolism (conch shell and glasses)",
      gradeLevel: "8th grade"
    };
    
    // Set up stage 2 context data
    const stage2Context = {
      ...stage1Data,
      completionMessage: "Great! Let's talk about the personality of your assessment bot. Do you have a persona in mind or would you like me to suggest some options?",
      uploadedFiles: [],
      learningTargets: [
        "Understanding of the conch shell as a symbol of democracy and order",
        "Recognition of Piggy's glasses as a symbol of knowledge and intelligence",
        "Analysis of how these symbols develop throughout Lord of the Flies"
      ]
    };
    
    // Set up Detective Piggy persona data
    const detectivePiggyData = {
      botName: "Detective Piggy",
      botJobTitle: "Analytical Detective",
      personalitySummary: "A brilliant detective who specializes in uncovering hidden meanings and symbols. Approaches analysis with methodical precision and encourages students to think like detectives when examining literature.",
      fullBotPersonality: "You are Detective Piggy, a brilliant analytical detective who specializes in uncovering hidden meanings and symbols in literature. You approach every text like a crime scene, looking for clues and evidence. You're methodical, precise, and encouraging. You help students develop their analytical skills by teaching them to think like detectives when examining literature. You use detective metaphors and terminology while staying age-appropriate and engaging.",
      botSampleDialogue: "Ah, interesting observation! I see you've spotted something about that conch shell. Tell me, detective, what clues in the text led you to that conclusion? Every good detective needs evidence to support their theories.",
      botVisualDescription: "A cartoon pig character with a scholarly, detective appearance. Wearing oversized, round glasses similar to Piggy's from Lord of the Flies, a detective's trench coat, and carrying a magnifying glass. Has an intelligent, observant expression that conveys both wisdom and approachability.",
      generatedAvatar: "https://example.com/detective-piggy-avatar.png", // Placeholder since we don't have the actual generated image
      botWelcomeMessage: "Greetings, young detective! I'm Detective Piggy, and I'm here to help you uncover the hidden mysteries within Lord of the Flies. Every great detective knows that symbols and deeper meanings are like clues waiting to be discovered. Are you ready to put on your detective hat and explore the evidence together?"
    };
    
    // Mark stages 1 and 2 as completed, stage 3 partially completed (personality done, boundaries next)
    setStages(prev => prev.map(stage => {
      if (stage.id === 1 || stage.id === 2) {
        return {
          ...stage,
          components: stage.components.map(comp => ({ ...comp, completed: true }))
        };
      } else if (stage.id === 3) {
        return {
          ...stage,
          components: stage.components.map(comp => 
            comp.id === "personality" ? { ...comp, completed: true } : comp
          )
        };
      }
      return stage;
    }));
    
    // Set current stage to 3
    setCurrentStageId(3);
    setCurrentBotType("intake-assessment-bot");
    
    // Set up all the state variables
    setStageContext(stage2Context);
    setCriteria(prev => ({
      ...prev,
      schoolDistrict: { detected: true, value: stage1Data.schoolDistrict, confidence: 1.0, finalValue: stage1Data.schoolDistrict },
      school: { detected: true, value: stage1Data.school, confidence: 1.0, finalValue: stage1Data.school },
      subject: { detected: true, value: stage1Data.subject, confidence: 1.0, finalValue: stage1Data.subject },
      topic: { detected: true, value: stage1Data.topic, confidence: 1.0, finalValue: stage1Data.topic },
      gradeLevel: { detected: true, value: stage1Data.gradeLevel, confidence: 1.0, finalValue: stage1Data.gradeLevel }
    }));
    
    // Set persona data
    setBotName(detectivePiggyData.botName);
    setBotJobTitle(detectivePiggyData.botJobTitle);
    setPersonalitySummary(detectivePiggyData.personalitySummary);
    setFullBotPersonality(detectivePiggyData.fullBotPersonality);
    setBotSampleDialogue(detectivePiggyData.botSampleDialogue);
    setBotVisualDescription(detectivePiggyData.botVisualDescription);
    setGeneratedAvatar(detectivePiggyData.generatedAvatar);
    setBotWelcomeMessage(detectivePiggyData.botWelcomeMessage);
    
    // Set boundaries state to be ready for the next step
    setExtractedBoundaries(""); // This will be the next thing to work on
    
    console.log("🚀 SKIP TO BOUNDARIES: State loaded! Ready to work on boundaries flow.");
  };

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

  const handleComponentComplete = (componentId: string | any) => {
    console.log("🎯 Component completed:", componentId);
    
    // Handle different types of component completion data
    if (typeof componentId === 'object' && componentId !== null) {
      // This is extraction data from persona confirmation
      console.log("✅ STORING CONFIRMED PERSONA DATA:", componentId);
      
      if (componentId.name) {
        setBotName(componentId.name);
        console.log("🏷️ Stored bot name:", componentId.name);
      }
      
      if (componentId.jobTitle) {
        setBotJobTitle(componentId.jobTitle);
        console.log("💼 Stored job title:", componentId.jobTitle);
      }
      
      if (componentId.description) {
        setPersonalitySummary(componentId.description);
        console.log("📝 Stored description:", componentId.description);
      }
      
      if (componentId.sampleDialogue) {
        setBotSampleDialogue(componentId.sampleDialogue);
        console.log("💬 Stored sample dialogue:", componentId.sampleDialogue);
      }
      
      if (componentId.welcomeMessage) {
        setBotWelcomeMessage(componentId.welcomeMessage);
        console.log("👋 Stored welcome message:", componentId.welcomeMessage);
        console.log("👋 Welcome message successfully set in state");
      } else {
        console.log("⚠️ No welcome message found in componentId:", componentId);
      }
      
      if (componentId.fullPersonality) {
        setFullBotPersonality(componentId.fullPersonality);
        console.log("🧠 Stored full personality:", componentId.fullPersonality);
      }
      
      // Mark personality component as complete since this is confirmed persona data
      setStages(prevStages =>
        prevStages.map(stage =>
          stage.id === 3
            ? {
                ...stage,
                components: stage.components.map(comp =>
                  comp.id === "personality"
                    ? { ...comp, completed: true }
                    : comp
                )
              }
            : stage
        )
      );
      
      return;
    }

    // Handle simple string componentId (normal flow)
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
          let rawContent = "";
          let interpretation = "";
          
          if (endpoint === "/api/intake/upload-imscc") {
            // Handle Canvas .imscc files
            rawContent = result.summary;
            interpretation = `✅ Parsed Canvas course "${result.courseName}". Found ${result.fullData.moduleCount} modules, ${result.fullData.pagesCount} pages, and ${result.fullData.quizzesCount} quizzes.`;
          } else {
            // Handle PDF and text files
            rawContent = result.text;
            interpretation = `✅ Extracted text from ${file.name}.`;
          }
          
          // Now summarize the content
          try {
            const summarizeResponse = await fetch('/api/intake/summarize-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: rawContent,
                fileName: file.name,
                fileType: file.type,
                subject: stageContext?.subject || '',
                topic: stageContext?.topic || '',
                gradeLevel: stageContext?.gradeLevel || '',
              }),
            });

            if (summarizeResponse.ok) {
              const summaryResult = await summarizeResponse.json();
              handleFileUpload({
                ...uploadedFile,
                processingStatus: "completed",
                extractedContent: summaryResult.summary, // Store summary instead of raw content
                interpretation: interpretation + " Content summarized for assessment context.",
              });
            } else {
              // Fallback if summarization fails
              handleFileUpload({
                ...uploadedFile,
                processingStatus: "completed",
                extractedContent: rawContent.substring(0, 500) + "...", // Truncated fallback
                interpretation: interpretation + " Content processed for assessment context.",
              });
            }
          } catch (summaryError) {
            console.error('Content summarization failed:', summaryError);
            // Fallback if summarization fails
            handleFileUpload({
              ...uploadedFile,
              processingStatus: "completed",
              extractedContent: rawContent.substring(0, 500) + "...", // Truncated fallback
              interpretation: interpretation + " Content processed for assessment context.",
            });
          }
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
          // Summarize the YouTube transcript
          try {
            const summarizeResponse = await fetch('/api/intake/summarize-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: result.transcript,
                fileName: result.title || "YouTube Video",
                fileType: "video/youtube",
                subject: stageContext?.subject || '',
                topic: stageContext?.topic || '',
                gradeLevel: stageContext?.gradeLevel || '',
              }),
            });

            let finalContent = result.transcript;
            let interpretation = `✅ Extracted transcript from YouTube video: "${result.title}".`;

            if (summarizeResponse.ok) {
              const summaryResult = await summarizeResponse.json();
              finalContent = summaryResult.summary;
              interpretation += " Content summarized for assessment context.";
            } else {
              finalContent = result.transcript.substring(0, 500) + "...";
              interpretation += " Content processed for assessment context.";
            }

            const youtubeFile: UploadedFile = {
              id: Date.now().toString(),
              name: result.title || "YouTube Video",
              type: "video/youtube",
              size: 0,
              processingStatus: "completed",
              extractedContent: finalContent,
              interpretation: interpretation,
            };

            console.log("🔍 FRONTEND YOUTUBE DEBUG - Created file object:", {
              id: youtubeFile.id,
              name: youtubeFile.name,
              extractedContent: youtubeFile.extractedContent,
              contentLength: youtubeFile.extractedContent?.length || 0
            });

            handleFileUpload(youtubeFile);
          } catch (summaryError) {
            console.error('YouTube content summarization failed:', summaryError);
            // Fallback if summarization fails
            const youtubeFile: UploadedFile = {
              id: Date.now().toString(),
              name: result.title || "YouTube Video",
              type: "video/youtube",
              size: 0,
              processingStatus: "completed",
              extractedContent: result.transcript.substring(0, 500) + "...",
              interpretation: `✅ Extracted transcript from YouTube video: "${result.title}". Content processed for assessment context.`,
            };
            handleFileUpload(youtubeFile);
          }
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
        
        // NOTE: DO NOT extract automatically here - only use confirmed persona data from persona confirmation step
        console.log("🎯 Skipping automatic extraction - waiting for confirmed persona data from user confirmation");
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg text-gray-900">Content Creator</h2>
              <Button
                onClick={skipToBoundaries}
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 h-auto border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Skip to Boundaries
              </Button>
            </div>
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
                            <div className="mb-3">
                              {/* Top row: Avatar and Name */}
                              <div className="flex items-center gap-2 mb-2">
                                {generatedAvatar ? (
                                  <img 
                                    src={generatedAvatar} 
                                    alt="Bot Avatar" 
                                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                                <div className="text-sm font-medium text-gray-900">
                                  {botName || "Assessment Bot"}
                                </div>
                              </div>
                              
                              {/* Job title spans full width */}
                              {botJobTitle && (
                                <div className="text-xs font-medium text-blue-600 mb-1">
                                  {botJobTitle}
                                </div>
                              )}
                              
                              {/* Description spans full width */}
                              <div className="text-xs text-gray-500 leading-relaxed">
                                {personalitySummary || "Your newly designed assessment bot"}
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
            onInjectMessage={setMessageInjectionFunction}
            stages={stages}
            onTestBotClick={() => setPersonalityTesterExpanded(true)}
          />
          

        </div>
        
        {/* Personality Testing Bot Modal - Full screen overlay */}
        {personalityTesterExpanded && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-8"
            onClick={(e) => {
              console.log("🟠 Modal backdrop clicked");
              // Only close if clicking the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                console.log("🟠 Closing modal via backdrop click");
                setPersonalityTesterExpanded(false);
                // Inject the return from testing trigger message
                if (messageInjectionFunction && currentStageId === 3) {
                  setTimeout(() => {
                    messageInjectionFunction("[USER_RETURNED_FROM_TESTING]");
                  }, 100);
                }
              }
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
            >
              {(() => {
                console.log("🟢 About to render PersonalityTestingBot with props:", {
                  avatar: generatedAvatar,
                  personalitySummary: personalitySummary,
                  botPersonality: fullBotPersonality || personalitySummary || "A helpful and friendly assistant",
                  botName: botName,
                  botJobTitle: botJobTitle,
                  botWelcomeMessage: botWelcomeMessage,
                  sampleDialogue: botSampleDialogue
                });
                console.log("🟢 personalityTesterExpanded:", personalityTesterExpanded);
                return null;
              })()}
              
              <PersonalityTestingBot
                avatar={generatedAvatar}
                personalitySummary={personalitySummary}
                botPersonality={fullBotPersonality || personalitySummary || "A helpful and friendly assistant"} // Use full personality description
                botName={botName}
                botJobTitle={botJobTitle}
                botWelcomeMessage={botWelcomeMessage}
                sampleDialogue={botSampleDialogue}
                boundaries={extractedBoundaries || "Follow normal school-appropriate standards"} 
                stageContext={{
                  ...stageContext,
                  learningTargets: stageContext?.learningTargets || [
                    "Understanding of the conch shell as a symbol of democracy and order",
                    "Recognition of Piggy's glasses as a symbol of knowledge and intelligence", 
                    "Analysis of how these symbols develop throughout Lord of the Flies"
                  ]
                }} // Enhanced context with learning targets
                uploadedFiles={uploadedFiles} // Pass Stage 2 uploaded files
                onClose={() => {
                  console.log("🟡 PersonalityTestingBot onClose callback triggered");
                  setPersonalityTesterExpanded(false);
                  
                  // Direct trigger: find the current Stage 3 chat and manually add the trigger message
                  if (currentStageId === 3) {
                    console.log("🟡 Directly triggering return-from-testing message for Stage 3");
                    
                    setTimeout(() => {
                      // Find the IntakeChat component and trigger message directly
                      const triggerMessage = "[USER_RETURNED_FROM_TESTING]";
                      console.log("🟡 Adding trigger message directly to chat");
                      
                      // Create a custom event to communicate with the active chat
                      const event = new CustomEvent('inject-message', { 
                        detail: { message: triggerMessage, stageId: 3 }
                      });
                      window.dispatchEvent(event);
                      console.log("🟡 Dispatched inject-message event");
                    }, 100);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
