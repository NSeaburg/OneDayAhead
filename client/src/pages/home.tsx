import { useState } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import VideoScreen from "@/components/VideoScreen";
import ArticleChatScreen from "@/components/ArticleChatScreen";
import AssessmentBotScreen from "@/components/AssessmentBotScreen";
import DynamicAssistantScreen from "@/components/DynamicAssistantScreen";
import FinalBotScreen from "@/components/FinalBotScreen";
import { config } from "@/config";
import { useAssistantConfig } from "@/hooks/useAssistantConfig";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

// Add TypeScript declaration for global window property
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
    };
  }
}

export default function Home() {
  // Track the current screen in the learning flow
  const [currentScreen, setCurrentScreen] = useState(1);
  
  // Store the dynamic assistant ID received from N8N
  const [dynamicAssistantId, setDynamicAssistantId] = useState<string | null>(null);
  
  // Store the assessment thread ID and conversation data for passing to the teaching bot
  const [assessmentThreadId, setAssessmentThreadId] = useState<string>("");
  const [assessmentConversation, setAssessmentConversation] = useState<any[]>([]);
  
  // Fetch assistant IDs from the backend
  const { discussionAssistantId, assessmentAssistantId, isLoading, error } = useAssistantConfig();
  
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
        <div className="m-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={resetApp}
          >
            <RotateCcw className="h-4 w-4" /> Reset App
          </Button>
        </div>
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
            onNext={(nextAssistantId) => {
              // Store the dynamic assistant ID received from N8N webhook
              if (nextAssistantId) {
                setDynamicAssistantId(nextAssistantId);
                console.log("Set dynamic assistant ID:", nextAssistantId);
              } else {
                console.log("No nextAssistantId provided, using fallback");
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
        
        {/* Dynamic Assistant Screen (4) - Assistant ID determined by N8N */}
        <div className={`absolute inset-0 ${currentScreen === 4 ? 'block' : 'hidden'}`}>
          <DynamicAssistantScreen 
            assistantId={dynamicAssistantId || discussionAssistantId} // Fallback to discussion assistant if dynamic ID is not available
            systemPrompt={config.systemPrompts.dynamic}
            assessmentThreadId={assessmentThreadId} // Pass assessment thread ID
            assessmentConversation={assessmentConversation} // Pass assessment conversation
            onNext={goToNextScreen} 
            onPrevious={goToPreviousScreen}
          />
        </div>
        
        {/* Final Feedback Bot Screen (5) */}
        <div className={`absolute inset-0 ${currentScreen === 5 ? 'block' : 'hidden'}`}>
          <FinalBotScreen 
            assistantId={discussionAssistantId}
            systemPrompt={config.systemPrompts.feedback}
            onPrevious={goToPreviousScreen}
          />
        </div>
      </div>
    </div>
  );
}
