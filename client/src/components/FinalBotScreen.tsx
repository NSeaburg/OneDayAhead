import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Define global window interface for accessing feedback data
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
      feedbackData?: {
        summary?: string;
        contentKnowledgeScore?: number;
        writingScore?: number;
        nextSteps?: string;
      };
    };
  }
}

interface FinalBotScreenProps {
  assistantId: string;
  systemPrompt: string;
  onPrevious?: () => void;
  feedbackData?: {
    summary?: string;
    contentKnowledgeScore?: number;
    writingScore?: number;
    nextSteps?: string;
  };
}

export default function FinalBotScreen({ 
  onPrevious,
  feedbackData: propsFeedbackData // Feedback data can be passed via props
}: FinalBotScreenProps) {
  // First check props, then check window object for feedback data
  const [feedbackData, setFeedbackData] = useState<{
    summary: string;
    contentKnowledgeScore: number;
    writingScore: number;
    nextSteps: string;
  }>({
    summary: "You've completed this learning module successfully!",
    contentKnowledgeScore: 0,
    writingScore: 0,
    nextSteps: "Continue exploring more topics to expand your knowledge."
  });

  useEffect(() => {
    // First check props passed directly
    if (propsFeedbackData) {
      setFeedbackData({
        summary: propsFeedbackData.summary || feedbackData.summary,
        contentKnowledgeScore: propsFeedbackData.contentKnowledgeScore || feedbackData.contentKnowledgeScore,
        writingScore: propsFeedbackData.writingScore || feedbackData.writingScore,
        nextSteps: propsFeedbackData.nextSteps || feedbackData.nextSteps
      });
    } 
    // Then check window object for feedback data
    else if (window.__assessmentData?.feedbackData) {
      const windowData = window.__assessmentData.feedbackData;
      setFeedbackData({
        summary: windowData.summary || feedbackData.summary,
        contentKnowledgeScore: windowData.contentKnowledgeScore || feedbackData.contentKnowledgeScore,
        writingScore: windowData.writingScore || feedbackData.writingScore,
        nextSteps: windowData.nextSteps || feedbackData.nextSteps
      });
    }
    
    console.log("Feedback data in final screen:", feedbackData);
  }, [propsFeedbackData]);

  // Helper function to get color class based on score
  const getColorClass = (score: number) => {
    if (score >= 3.5) return "bg-green-100 border-green-200 text-green-800";
    if (score >= 2.5) return "bg-blue-100 border-blue-200 text-blue-800";
    if (score >= 1.5) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    return "bg-red-100 border-red-200 text-red-800";
  };

  // Helper function to determine CSS background color class based on score
  const getProgressColor = (score: number): string => {
    if (score >= 3.5) return "bg-green-500";
    if (score >= 2.5) return "bg-blue-500";
    if (score >= 1.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full max-w-3xl mx-auto">
      {/* Heading section */}
      <div className="flex items-center mb-6">
        <Award className="text-yellow-500 mr-3 h-8 w-8" />
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Your Learning Results
        </h1>
      </div>

      {/* Overall feedback section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
          Overall Feedback
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {feedbackData.summary}
        </p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Content Knowledge Score */}
        <div className={`p-5 rounded-lg border ${getColorClass(feedbackData.contentKnowledgeScore)}`}>
          <h3 className="text-lg font-medium mb-2">Content Knowledge</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Score:</span>
            <Badge className="bg-white text-gray-800 border border-current">
              {feedbackData.contentKnowledgeScore}/4
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.contentKnowledgeScore)}`}
              style={{ width: `${(feedbackData.contentKnowledgeScore / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Writing Score */}
        <div className={`p-5 rounded-lg border ${getColorClass(feedbackData.writingScore)}`}>
          <h3 className="text-lg font-medium mb-2">Writing Quality</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Score:</span>
            <Badge className="bg-white text-gray-800 border border-current">
              {feedbackData.writingScore}/4
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.writingScore)}`}
              style={{ width: `${(feedbackData.writingScore / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <Card className="p-5 bg-yellow-50 border-yellow-100 mb-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
          What's Next for You
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {feedbackData.nextSteps}
        </p>
      </Card>

      {/* Back button */}
      <div className="mt-auto">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Previous Step
          </Button>
        )}
      </div>
    </div>
  );
}
