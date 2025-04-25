import { useState } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import VideoScreen from "@/components/VideoScreen";
import ArticleChatScreen from "@/components/ArticleChatScreen";
import AssessmentBotScreen from "@/components/AssessmentBotScreen";
import FinalBotScreen from "@/components/FinalBotScreen";
import { config } from "@/config";

export default function Home() {
  // Track the current screen in the learning flow
  const [currentScreen, setCurrentScreen] = useState(1);
  
  // Function to navigate to the next screen
  const goToNextScreen = () => {
    if (currentScreen < config.totalSteps) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto bg-white shadow-sm">
      {/* Progress indicator showing current position in the learning flow */}
      <ProgressIndicator currentStep={currentScreen} totalSteps={config.totalSteps} />
      
      {/* Screen container with all screen components */}
      <div className="flex-grow relative">
        {/* Video Screen (1) */}
        <div className={`absolute inset-0 ${currentScreen === 1 ? 'block' : 'hidden'}`}>
          <VideoScreen videoUrl={config.videoUrl} onNext={goToNextScreen} />
        </div>
        
        {/* Article + Chatbot Screen (2) */}
        <div className={`absolute inset-0 ${currentScreen === 2 ? 'block' : 'hidden'}`}>
          <ArticleChatScreen 
            articleContent={config.articleContent}
            assistantId={config.openai.discussionAssistantId}
            systemPrompt={config.systemPrompts.discussion}
            onNext={goToNextScreen} 
          />
        </div>
        
        {/* Assessment Bot Screen (3) */}
        <div className={`absolute inset-0 ${currentScreen === 3 ? 'block' : 'hidden'}`}>
          <AssessmentBotScreen 
            assistantId={config.openai.assessmentAssistantId}
            systemPrompt={config.systemPrompts.assessment}
            onNext={goToNextScreen} 
          />
        </div>
        
        {/* Final Routed Bot Screen (4) */}
        <div className={`absolute inset-0 ${currentScreen === 4 ? 'block' : 'hidden'}`}>
          <FinalBotScreen 
            assistantId={config.openai.finalBotIdPlaceholder}
            systemPrompt={config.systemPrompts.feedback}
          />
        </div>
      </div>
    </div>
  );
}
