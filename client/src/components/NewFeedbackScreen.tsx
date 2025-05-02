import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Award, Sparkles, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';
import { notifyCourseCompleted } from "@/lib/embedding";

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

interface NewFeedbackScreenProps {
  assistantId?: string;
  systemPrompt?: string;
  onPrevious?: () => void;
  feedbackData?: {
    summary?: string;
    contentKnowledgeScore?: number;
    writingScore?: number;
    nextSteps?: string;
  };
}

export default function NewFeedbackScreen({ 
  onPrevious,
  feedbackData: propsFeedbackData // Feedback data can be passed via props
}: NewFeedbackScreenProps) {
  // State to track component initialization
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State for feedback data with default values
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

  // Log initialization for debugging
  useEffect(() => {
    console.log("NewFeedbackScreen mounted/rendered");
    
    // Notify parent window of course completion
    try {
      if (propsFeedbackData) {
        notifyCourseCompleted(propsFeedbackData);
      } else if (window.__assessmentData?.feedbackData) {
        notifyCourseCompleted(window.__assessmentData.feedbackData);
      } else {
        notifyCourseCompleted();
      }
    } catch (error) {
      console.error("Error sending course completion notification:", error);
    }
  }, []);

  // Data initialization effect
  useEffect(() => {
    if (isInitialized) return; // Only run once
    
    console.log("Initializing NewFeedbackScreen data");
    console.log("Received propsFeedbackData:", propsFeedbackData);
    console.log("Window.__assessmentData:", window.__assessmentData);
    
    // Priority 1: Use props if available
    if (propsFeedbackData) {
      console.log("Using feedback data from props");
      
      const newFeedbackData = {
        summary: propsFeedbackData.summary || "No summary provided",
        contentKnowledgeScore: propsFeedbackData.contentKnowledgeScore || 0,
        writingScore: propsFeedbackData.writingScore || 0,
        nextSteps: propsFeedbackData.nextSteps || "No next steps provided"
      };
      
      console.log("Setting feedback data from props:", newFeedbackData);
      setFeedbackData(newFeedbackData);
    } 
    // Priority 2: Use window.__assessmentData if available
    else if (window.__assessmentData?.feedbackData) {
      const windowData = window.__assessmentData.feedbackData;
      console.log("Using feedback data from window.__assessmentData");
      
      const newFeedbackData = {
        summary: windowData.summary || "No summary provided",
        contentKnowledgeScore: windowData.contentKnowledgeScore || 0,
        writingScore: windowData.writingScore || 0,
        nextSteps: windowData.nextSteps || "No next steps provided"
      };
      
      console.log("Setting feedback data from window:", newFeedbackData);
      setFeedbackData(newFeedbackData);
    } 
    // Priority 3: Use defaults if nothing else is available
    else {
      console.log("No feedback data found in props or window. Using default values.");
    }
    
    setIsInitialized(true);
  }, [propsFeedbackData, isInitialized]);
  
  // Separate effect to log state updates
  useEffect(() => {
    console.log("Current feedback data state:", feedbackData);
  }, [feedbackData]);

  // Helper function to get color class based on score (0-100 scale)
  const getColorClass = (score: number) => {
    if (score >= 85) return "bg-green-100 border-green-200 text-green-800";
    if (score >= 70) return "bg-blue-100 border-blue-200 text-blue-800";
    if (score >= 50) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    return "bg-red-100 border-red-200 text-red-800";
  };

  // Helper function to determine CSS background color class based on score (0-100 scale)
  const getProgressColor = (score: number): string => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Function to handle PDF download of learning results
  const handleDownloadPDF = () => {
    // Create a container for the content
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    // Create HTML content for the PDF
    element.innerHTML = `
      <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 20px;">Learning Results - Three Branches of Government</h1>
      
      <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2563EB; font-size: 18px; margin-bottom: 10px;">Overall Feedback</h2>
        <p style="color: #374151; line-height: 1.6;">${feedbackData.summary}</p>
      </div>
      
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE; background-color: #EFF6FF;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Content Knowledge</h3>
          <p>Score: ${feedbackData.contentKnowledgeScore}/100</p>
        </div>
        
        <div style="flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE; background-color: #EFF6FF;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Writing Quality</h3>
          <p>Score: ${feedbackData.writingScore}/100</p>
        </div>
      </div>
      
      <div style="background-color: #FFFBEB; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #D97706; font-size: 18px; margin-bottom: 10px;">What's Next for You</h2>
        <p style="color: #374151; line-height: 1.6;">${feedbackData.nextSteps}</p>
      </div>
      
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px;">
        <h2 style="color: #4B5563; font-size: 18px; margin-bottom: 10px;">Three Branches of Government - Learning Content</h2>
        <p><strong>Objective:</strong> Understand the three branches of government and how they work together.</p>
        <p><strong>Grade:</strong> 7-9</p>
        
        <h3 style="margin-top: 15px;">Key Concepts</h3>
        <ul>
          <li><strong>Executive Branch:</strong> Enforces laws, led by the President.</li>
          <li><strong>Legislative Branch:</strong> Makes laws, consisting of Congress (House and Senate).</li>
          <li><strong>Judicial Branch:</strong> Interprets laws, with the Supreme Court at the top.</li>
          <li><strong>Checks and Balances:</strong> System where each branch limits the power of the others.</li>
          <li><strong>Separation of Powers:</strong> Division of government responsibilities into distinct branches.</li>
        </ul>
      </div>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 30px; text-align: center;">
        Downloaded on ${new Date().toLocaleDateString()} - Learning Platform
      </p>
    `;
    
    // Configure PDF options
    const options = {
      margin: 10,
      filename: 'learning-results-government.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and save the PDF
    html2pdf().from(element).set(options).save();
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full max-w-3xl mx-auto">
      {/* Heading section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Award className="text-yellow-500 mr-3 h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Your Learning Results
          </h1>
        </div>
        <Button 
          onClick={handleDownloadPDF}
          variant="outline" 
          className="flex items-center gap-1.5"
        >
          <FileDown className="h-4 w-4" />
          Save as PDF
        </Button>
      </div>

      {/* Overall feedback section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
          Overall Feedback
        </h2>
        <div className="text-gray-700 leading-relaxed markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedbackData.summary}</ReactMarkdown>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Content Knowledge Score */}
        <div className={`p-5 rounded-lg border ${getColorClass(feedbackData.contentKnowledgeScore)}`}>
          <h3 className="text-lg font-medium mb-2">Content Knowledge</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Score:</span>
            <Badge className="bg-white text-gray-800 border border-current">
              {feedbackData.contentKnowledgeScore}/100
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.contentKnowledgeScore)}`}
              style={{ width: `${Math.max(1, feedbackData.contentKnowledgeScore)}%` }}
            ></div>
          </div>
        </div>

        {/* Writing Score */}
        <div className={`p-5 rounded-lg border ${getColorClass(feedbackData.writingScore)}`}>
          <h3 className="text-lg font-medium mb-2">Writing Quality</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Score:</span>
            <Badge className="bg-white text-gray-800 border border-current">
              {feedbackData.writingScore}/100
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.writingScore)}`}
              style={{ width: `${Math.max(1, feedbackData.writingScore)}%` }}
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
        <div className="text-gray-700 leading-relaxed markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedbackData.nextSteps}</ReactMarkdown>
        </div>
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