import { useState, useEffect } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import AssessmentBotScreen from "@/components/AssessmentBotScreen";
import DynamicAssistantScreen from "@/components/DynamicAssistantScreen";
import HighBotWithArticleScreen from "@/components/HighBotWithArticleScreen";
import SimpleFeedbackScreen from "@/components/SimpleFeedbackScreen";
import DeploymentPage from "@/pages/deployment";
import ExperienceCreator from "@/pages/experience-creator";
import { config } from "@/config";
import { useAssistantConfig } from "@/hooks/useAssistantConfig";
import { useToast } from "@/hooks/use-toast";

// Teaching assistance data interface
interface TeachingAssistance {
  level: 'low' | 'medium' | 'high';
  systemPrompt: string;
}

export default function Home() {
  const { toast } = useToast();
  
  // Check URL for experience parameter (for admin testing)
  const urlParams = new URLSearchParams(window.location.search);
  const experienceParam = urlParams.get('experience');
  
  // Decode the experience parameter if it exists (handles URL encoding)
  const decodedExperience = experienceParam ? 
    experienceParam.split('/').map(part => decodeURIComponent(part)).join('/') : 
    null;
  
  // Debug URL parsing
  console.log('🔥 URL Debugging:');
  console.log('🔥 window.location.search:', window.location.search);
  console.log('🔥 experienceParam:', experienceParam);
  console.log('🔥 decodedExperience:', decodedExperience);
  
  // Track the current screen in the learning flow (1 = assessment, 2 = teaching, 3 = feedback)
  // Skip deployment page and start directly with Three Branches experience (or specified experience)
  const [currentScreen, setCurrentScreen] = useState(1); // Start with assessment (skip deployment)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    decodedExperience || "demo-district/civics-government/three-branches"
  );
  const [showExperienceCreator, setShowExperienceCreator] = useState(false);
  
  // Store the dynamic assistant ID received from assessment
  const [dynamicAssistantId, setDynamicAssistantId] = useState<string>("");
  
  // Store the assessment thread ID and conversation data for passing to the teaching bot
  const [assessmentThreadId, setAssessmentThreadId] = useState<string>("");
  const [assessmentConversation, setAssessmentConversation] = useState<any[]>([]);
  
  // Teaching assistance data from Claude assessment
  const [teachingAssistance, setTeachingAssistance] = useState<TeachingAssistance | undefined>(undefined);
  
  // Store feedback data
  const [feedbackData, setFeedbackData] = useState<{
    summary?: string;
    contentKnowledgeScore?: number;
    writingScore?: number;
    nextSteps?: string;
  } | undefined>(undefined);
  
  // Fetch assistant IDs from the backend
  const { discussionAssistantId, assessmentAssistantId, contentPackage, isLoading, error } = useAssistantConfig(selectedExperience);
  
  // Debug logging for content package  
  useEffect(() => {
    console.log('🔥 Home component - selectedExperience:', selectedExperience);
    console.log('🔥 Home component - decodedExperience:', decodedExperience);
    console.log('🔥 Home component - contentPackage:', contentPackage);
    console.log('🔥 Home component - assessmentBot personality:', contentPackage?.assessmentBot?.personality?.substring(0, 100) + '...');
  }, [selectedExperience, contentPackage]);

  // Clear cached conversations when switching experiences
  useEffect(() => {
    if (contentPackage && contentPackage.id !== "demo-district/civics-government/three-branches") {
      console.log('🔥 Switching to new experience, clearing all cached data IMMEDIATELY');
      
      // Clear localStorage immediately and synchronously
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('learningAppGlobalStorage');
          window.localStorage.removeItem('assessment_conversation');
          window.localStorage.removeItem('assessment_thread_id');
          window.localStorage.removeItem('teaching_conversation');
          window.localStorage.removeItem('teaching_thread_id');
          window.localStorage.removeItem('feedback_data');
        }
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Clear window.__assessmentData immediately
      if (typeof window !== 'undefined') {
        window.__assessmentData = undefined;
      }
      
      // Also import and call clearAllData for good measure
      import('../lib/globalStorage').then(({ clearAllData }) => {
        clearAllData();
      });
      
      // Reset current screen to start fresh
      setCurrentScreen(1);
      
      // Clear any existing conversation state
      setAssessmentThreadId("");
      setAssessmentConversation([]);
      setTeachingAssistance(undefined);
      setFeedbackData(undefined);
    }
  }, [contentPackage?.id]);
  
  // List of High Bot assistant IDs
  const highBotAssistantIds = [
    "asst_lUweN1vW36yeAORIXCWDopm9",  // Original High Bot ID
    "asst_87DSLhfnAK7elvmsiL0aTPH4"    // Additional High Bot ID specified by user
  ];
  
  // Check if the current assistant ID is a High Bot
  const isHighBot = dynamicAssistantId !== "" && (
    dynamicAssistantId.includes("High") || 
    highBotAssistantIds.includes(dynamicAssistantId)
  );

  // Navigation functions for the learning flow
  const goToNextScreen = () => {
    setCurrentScreen(prev => Math.min(prev + 1, 3)); // Max 3 for feedback screen
  };

  const goToPreviousScreen = () => {
    // Since we start directly with assessment (screen 1), prevent going below that
    setCurrentScreen(prev => Math.max(prev - 1, 1));
  };

  const handleSelectExperience = (packageId: string) => {
    setSelectedExperience(packageId);
    setCurrentScreen(1); // Go to assessment
  };

  const handleCreateNewExperience = () => {
    setShowExperienceCreator(true);
  };

  const handleSaveExperience = async (experienceData: any) => {
    try {
      const response = await fetch('/api/content/create-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create experience');
      }

      toast({
        title: "Experience Created",
        description: "Your learning experience has been saved successfully!"
      });

      setShowExperienceCreator(false);
      setCurrentScreen(0); // Go back to deployment page
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the experience. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackFromCreator = () => {
    setShowExperienceCreator(false);
  };

  // Display loading state while fetching assistant configurations
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
            <p className="text-gray-500 text-sm">Please check that your Claude API key is properly configured.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show experience creator if requested
  if (showExperienceCreator) {
    return (
      <ExperienceCreator
        onBack={handleBackFromCreator}
        onSave={handleSaveExperience}
      />
    );
  }

  // Note: Deployment page (screen 0) is skipped - we start directly with assessment (screen 1)

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto bg-white shadow-sm">
      {/* Progress indicator showing current position in the learning flow */}
      <div className="flex justify-between items-center p-4">
        <ProgressIndicator currentStep={currentScreen} totalSteps={3} />
      </div>
      
      {/* Screen container with all screen components */}
      <div className="flex-grow relative">
        {/* Assessment Bot Screen (1) */}
        <div className={`absolute inset-0 ${currentScreen === 1 ? 'block' : 'hidden'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg">Loading experience...</p>
              </div>
            </div>
          ) : (
            <AssessmentBotScreen 
              assistantId={assessmentAssistantId}
              systemPrompt={contentPackage?.assessmentBot?.personality || config.systemPrompts.assessment}
              onNext={(teachingAssistanceData) => {
              // Store the teaching assistance data from assessment
              if (teachingAssistanceData) {
                setTeachingAssistance(teachingAssistanceData);
                console.log(`Received teaching assistance level: ${teachingAssistanceData.level}`);
                
                // Set a specific assistant ID based on proficiency level
                const assistantIdByLevel: Record<string, string> = {
                  'high': 'asst_87DSLhfnAK7elvmsiL0aTPH4', // Use high bot ID for high level
                  'medium': 'claude_medium',
                  'low': 'claude_low'
                };
                
                // Set the appropriate dynamic assistant ID
                const newAssistantId = assistantIdByLevel[teachingAssistanceData.level] || 'claude_default';
                setDynamicAssistantId(newAssistantId);
                
                console.log(`Using ${teachingAssistanceData.level} level assistant: ${newAssistantId}`);
              } else {
                console.log("No teaching assistance data provided, using fallback low level");
                // Create fallback teaching assistance data for low level
                const fallbackAssistance = {
                  level: 'low' as 'low',
                  systemPrompt: `You are Mr. Whitaker, a retired civics and American history teacher. You taught for 35 years and now volunteer your time to help students strengthen their understanding of government.`
                };
                
                setTeachingAssistance(fallbackAssistance);
                setDynamicAssistantId('claude_low');
              }
              
              goToNextScreen();
            }} 
            onPrevious={goToPreviousScreen} 
          />
          )}
        </div>
        
        {/* Teaching Assistant Screen (2) */}
        <div className={`absolute inset-0 ${currentScreen === 2 ? 'block' : 'hidden'}`}>
          {isHighBot ? (
            <HighBotWithArticleScreen 
              assistantId={dynamicAssistantId}
              systemPrompt={teachingAssistance?.systemPrompt || config.systemPrompts.dynamic}
              articleContent={config.articleContent}
              onNext={(feedbackResult) => {
                if (feedbackResult) {
                  setFeedbackData(feedbackResult);
                } else {
                  console.log("No feedback data received from HighBotWithArticleScreen");
                }
                goToNextScreen();
              }}
              onPrevious={goToPreviousScreen}
            />
          ) : (
            <DynamicAssistantScreen 
              assistantId={dynamicAssistantId}
              systemPrompt={teachingAssistance?.systemPrompt || config.systemPrompts.dynamic}
              teachingAssistance={teachingAssistance}
              onNext={(feedbackResult) => {
                if (feedbackResult) {
                  setFeedbackData(feedbackResult);
                } else {
                  console.log("No feedback data received from DynamicAssistantScreen");
                }
                goToNextScreen();
              }}
              onPrevious={goToPreviousScreen}
            />
          )}
        </div>
        
        {/* Final Feedback Screen (3) */}
        <div className={`absolute inset-0 ${currentScreen === 3 ? 'block' : 'hidden'}`}>
          <SimpleFeedbackScreen 
            feedbackData={feedbackData}
            onPrevious={goToPreviousScreen}
          />
        </div>
      </div>
    </div>
  );
}