import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import LowLevelBot from "@/components/teaching/LowLevelBot";
import MediumLevelBot from "@/components/teaching/MediumLevelBot";
import HighLevelBot from "@/components/teaching/HighLevelBot";
import DevMenu from "@/components/DevMenu";

export default function TeachingBotTest() {
  const [, setLocation] = useLocation();
  const [teachingLevel, setTeachingLevel] = useState<'low' | 'medium' | 'high'>('low');

  // Function to reset the application
  const resetApp = () => {
    window.location.reload();
  };

  // Handle completion of the teaching bot conversation
  const handleNext = (nextAssistantId?: string, feedbackData?: any) => {
    alert('Teaching bot conversation completed!');
    console.log('Feedback data:', feedbackData);
  };

  // Handle going back
  const handlePrevious = () => {
    setLocation('/');
  };

  // Render the appropriate teaching bot based on level
  const renderTeachingBot = () => {
    switch (teachingLevel) {
      case 'low':
        return (
          <LowLevelBot
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'medium':
        return (
          <MediumLevelBot
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'high':
        return (
          <HighLevelBot
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      default:
        return (
          <LowLevelBot
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto">
      {/* Dev menu for navigation and level selection */}
      <DevMenu
        currentScreen={4} // Teaching bot screen
        setCurrentScreen={() => {}} // No-op since we're on a separate page
        resetApp={resetApp}
        setTeachingLevel={setTeachingLevel}
        currentLevel={teachingLevel}
      />

      {/* Teaching bot container */}
      <div className="flex-grow flex flex-col relative">
        {renderTeachingBot()}
      </div>
    </div>
  );
}