import { useState } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import VideoScreen from "@/components/VideoScreen";
import ArticleChatScreen from "@/components/ArticleChatScreen";
import AssessmentBotScreen from "@/components/AssessmentBotScreen";
import FinalBotScreen from "@/components/FinalBotScreen";
import { config } from "@/config";
import { useAssistantConfig } from "@/hooks/useAssistantConfig";

export default function Home() {
  // Track the current screen in the learning flow
  const [currentScreen, setCurrentScreen] = useState(1);
  
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
      <ProgressIndicator currentStep={currentScreen} totalSteps={config.totalSteps} />
      
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
            onNext={goToNextScreen} 
            onPrevious={goToPreviousScreen}
          />
        </div>
        
        {/* Final Routed Bot Screen (4) */}
        <div className={`absolute inset-0 ${currentScreen === 4 ? 'block' : 'hidden'}`}>
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
