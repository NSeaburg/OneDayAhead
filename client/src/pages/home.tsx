import { useState, useEffect } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import VideoScreen from "@/components/VideoScreen";
import ArticleChatScreen from "@/components/ArticleChatScreen";
import AssessmentBotScreen from "@/components/AssessmentBotScreen";
import DynamicAssistantScreen from "@/components/DynamicAssistantScreen";
import HighBotWithArticleScreen from "@/components/HighBotWithArticleScreen";
import SimpleFeedbackScreen from "@/components/SimpleFeedbackScreen";
import { config } from "@/config";
import { useAssistantConfig } from "@/hooks/useAssistantConfig";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { notifyScreenChange, notifyFeedbackReceived, notifyCourseCompleted } from "@/lib/embedding";

// Using global interface declared in types.d.ts

export default function Home() {
  // Track the current screen in the learning flow
  const [currentScreen, setCurrentScreen] = useState(1);
  
  // Store the dynamic assistant ID received from N8N
  const [dynamicAssistantId, setDynamicAssistantId] = useState<string>("");
  
  // Store the assessment thread ID and conversation data for passing to the teaching bot
  const [assessmentThreadId, setAssessmentThreadId] = useState<string>("");
  const [assessmentConversation, setAssessmentConversation] = useState<any[]>([]);
  
  // Teaching assistance data from N8N (Claude-specific)
  interface TeachingAssistance {
    level: 'low' | 'medium' | 'high';
    systemPrompt: string;
  }
  const [teachingAssistance, setTeachingAssistance] = useState<TeachingAssistance | undefined>(undefined);
  
  // Store feedback data from N8N
  const [feedbackData, setFeedbackData] = useState<{
    summary?: string;
    contentKnowledgeScore?: number;
    writingScore?: number;
    nextSteps?: string;
  } | undefined>(undefined);
  
  // Add a debug log whenever feedbackData changes
  useEffect(() => {
    if (feedbackData) {
      console.log("⚠️ DEBUG CRITICAL - feedbackData state in Home updated:", 
        JSON.stringify({
          contentKnowledgeScore: feedbackData.contentKnowledgeScore,
          writingScore: feedbackData.writingScore,
          contentKnowledgeScoreType: typeof feedbackData.contentKnowledgeScore,
          writingScoreType: typeof feedbackData.writingScore,
          fullData: feedbackData
        }, null, 2)
      );
    }
  }, [feedbackData]);
  
  // Fetch assistant IDs from the backend
  const { discussionAssistantId, assessmentAssistantId, isLoading, error } = useAssistantConfig();
  
  // List of High Bot assistant IDs (move this outside hooks)
  const highBotAssistantIds = [
    "asst_lUweN1vW36yeAORIXCWDopm9",  // Original High Bot ID
    "asst_87DSLhfnAK7elvmsiL0aTPH4"    // Additional High Bot ID specified by user
  ];
  
  // Check if the current assistant ID is a High Bot
  // (Using a calculated value rather than a hook to avoid hook order issues)
  const isHighBot = dynamicAssistantId !== "" && (
    dynamicAssistantId.includes("High") || 
    highBotAssistantIds.includes(dynamicAssistantId)
  );
  
  // Send screen change notification whenever the current screen changes
  useEffect(() => {
    // Get the screen name based on index
    const screenNames = ["Video", "Article", "Assessment", "Teaching", "Feedback"];
    const screenName = screenNames[currentScreen - 1] || "Unknown";
    
    // Notify parent window about screen change
    notifyScreenChange(screenName, currentScreen);
    
    // Send course completion notification when reaching the final screen
    if (currentScreen === config.totalSteps) {
      notifyCourseCompleted(feedbackData);
    }
  }, [currentScreen, feedbackData]);
  
  // Debug logging when we enter screen 4
  useEffect(() => {
    if (currentScreen === 4) {
      console.log("Teaching screen loaded with assistant ID:", dynamicAssistantId);
      console.log("Using High Bot layout:", isHighBot ? "YES" : "NO");
      if (isHighBot) {
        console.log("Side-by-side article layout will be shown");
      } else {
        console.log("Regular teaching bot layout will be shown");
      }
    }
  }, [currentScreen, dynamicAssistantId, isHighBot]);
  
  // Function to navigate to the next screen
  const goToNextScreen = () => {
    if (currentScreen < config.totalSteps) {
      setCurrentScreen(currentScreen + 1);
    }
  };
  
  // Function to navigate to the previous screen
  const goToPreviousScreen = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };
  
  // Function to reset the app to the first screen
  const resetApp = () => {
    setCurrentScreen(1);
    // Force reload the page to clear all state
    window.location.reload();
  };

  // Display loading state while fetching assistant IDs
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen max-w-7xl mx-auto bg-white shadow-sm">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-300 mb-4"></div>
            <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Display error state if assistant IDs couldn't be fetched
  if (error) {
    return (
      <div className="flex flex-col min-h-screen max-w-7xl mx-auto bg-white shadow-sm">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center text-center p-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500 text-sm">Please check that your OpenAI API key and Assistant IDs are properly configured.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto bg-white shadow-sm">
      {/* Progress indicator showing current position in the learning flow */}
      <div className="flex justify-between items-center">
        <ProgressIndicator currentStep={currentScreen} totalSteps={config.totalSteps} />
      </div>
      
      {/* Screen container with all screen components */}
      <div className="flex-grow relative">
        {/* Video Screen (1) */}
        <div className={`absolute inset-0 ${currentScreen === 1 ? 'block' : 'hidden'}`}>
          <VideoScreen 
            videoUrl={config.videoUrl} 
            onNext={goToNextScreen} 
            onPrevious={currentScreen > 1 ? goToPreviousScreen : undefined} 
          />
        </div>
        
        {/* Article + Chatbot Screen (2) */}
        <div className={`absolute inset-0 ${currentScreen === 2 ? 'block' : 'hidden'}`}>
          <ArticleChatScreen 
            articleContent={config.articleContent}
            assistantId={discussionAssistantId}
            systemPrompt={config.systemPrompts.discussion}
            onNext={goToNextScreen} 
            onPrevious={goToPreviousScreen} 
          />
        </div>
        
        {/* Assessment Bot Screen (3) */}
        <div className={`absolute inset-0 ${currentScreen === 3 ? 'block' : 'hidden'}`}>
          <AssessmentBotScreen 
            assistantId={assessmentAssistantId}
            systemPrompt={config.systemPrompts.assessment}
            onNext={(teachingAssistanceData) => {
              // Store the teaching assistance data from N8N webhook
              if (teachingAssistanceData) {
                setTeachingAssistance(teachingAssistanceData);
                console.log(`Received teaching assistance level: ${teachingAssistanceData.level}`);
                console.log("Received Claude-specific system prompt for teaching");
                
                // Set a specific assistant ID based on proficiency level
                // This is primarily for maintaining backward compatibility with the High Bot layout feature
                const assistantIdByLevel: Record<string, string> = {
                  'high': 'asst_87DSLhfnAK7elvmsiL0aTPH4', // Use high bot ID for high level
                  'medium': 'claude_medium',
                  'low': 'claude_low'
                };
                
                // Set the appropriate dynamic assistant ID
                const newAssistantId = assistantIdByLevel[teachingAssistanceData.level] || 'claude_default';
                setDynamicAssistantId(newAssistantId);
                
                // Check if this is a High Bot level
                if (teachingAssistanceData.level === 'high') {
                  console.log("High proficiency level detected - will use side-by-side layout");
                } else {
                  console.log(`Using regular layout for ${teachingAssistanceData.level} proficiency level`);
                }
              } else {
                console.log("No teaching assistance data provided, using fallback low level");
                // Create fallback teaching assistance data for Mr. Whitaker (low level)
                const fallbackAssistance = {
                  level: 'low' as 'low',
                  systemPrompt: `You are Mr. Whitaker, a retired civics and American history teacher. You taught for 35 years and now volunteer your time to help students strengthen their understanding of government.`
                };
                
                // Set fallback assistance data
                setTeachingAssistance(fallbackAssistance);
                
                // Set the low-level teaching assistant ID
                setDynamicAssistantId('claude_low');
              }
              
              // Capture the assessment conversation and thread ID from the component's state
              // This will be accessed through window.__assessmentData global
              if (window.__assessmentData) {
                setAssessmentThreadId(window.__assessmentData.threadId || "");
                setAssessmentConversation(window.__assessmentData.messages || []);
                console.log("Captured assessment thread ID:", window.__assessmentData.threadId);
                console.log("Captured assessment conversation length:", window.__assessmentData.messages?.length || 0);
              } else {
                console.log("No assessment data available");
              }
              
              goToNextScreen();
            }} 
            onPrevious={goToPreviousScreen}
          />
        </div>
        
        {/* Dynamic Assistant Screen OR High Bot with Article Side-by-Side (4) */}
        <div className={`absolute inset-0 ${currentScreen === 4 ? 'block' : 'hidden'}`}>
          {isHighBot ? (
            // High Bot with Article side-by-side layout
            <HighBotWithArticleScreen 
              assistantId={dynamicAssistantId || discussionAssistantId}
              systemPrompt={teachingAssistance?.systemPrompt || config.systemPrompts.dynamic}
              articleUrl="/nixon-article.html"
              assessmentThreadId={assessmentThreadId}
              assessmentConversation={assessmentConversation}
              onNext={(nextId, feedbackResult) => {
                if (feedbackResult) {
                  console.log("⚠️ DEBUG - Feedback data from HighBotWithArticleScreen:", 
                    JSON.stringify({
                      contentKnowledgeScore: feedbackResult?.contentKnowledgeScore,
                      writingScore: feedbackResult?.writingScore,
                      contentKnowledgeScoreType: typeof feedbackResult?.contentKnowledgeScore,
                      writingScoreType: typeof feedbackResult?.writingScore,
                    })
                  );
                  setFeedbackData(feedbackResult);
                }
                goToNextScreen();
              }}
              onPrevious={goToPreviousScreen}
            />
          ) : (
            // Regular dynamic assistant screen
            <DynamicAssistantScreen 
              assistantId={dynamicAssistantId || discussionAssistantId}
              systemPrompt={teachingAssistance?.systemPrompt || config.systemPrompts.dynamic}
              assessmentThreadId={assessmentThreadId}
              assessmentConversation={assessmentConversation}
              teachingAssistance={teachingAssistance}
              onNext={(nextId, feedbackResult) => {
                if (feedbackResult) {
                  console.log("⚠️ DEBUG - Feedback data received in DynamicAssistantScreen callback:", 
                    JSON.stringify({
                      contentKnowledgeScore: feedbackResult?.contentKnowledgeScore,
                      writingScore: feedbackResult?.writingScore,
                      contentKnowledgeScoreType: typeof feedbackResult?.contentKnowledgeScore,
                      writingScoreType: typeof feedbackResult?.writingScore,
                    })
                  );
                  // Set state with the feedback data
                  setFeedbackData(feedbackResult);
                  
                  // Use an effect to verify the update
                  // This won't show the updated value immediately due to React's state batching
                  console.log("Current feedbackData state (will be previous value):", feedbackData);
                } else {
                  console.log("No feedback data received from DynamicAssistantScreen");
                }
                goToNextScreen();
              }}
              onPrevious={goToPreviousScreen}
            />
          )}
        </div>
        
        {/* Final Feedback Bot Screen (5) */}
        <div className={`absolute inset-0 ${currentScreen === 5 ? 'block' : 'hidden'}`}>
          <SimpleFeedbackScreen 
            feedbackData={feedbackData}
            onPrevious={goToPreviousScreen}
          />
        </div>
      </div>


    </div>
  );
}
