import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Award, Sparkles, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';
import { notifyCourseCompleted } from "@/lib/embedding";
import { Message } from "@/lib/openai";
import globalStorage from "@/lib/globalStorage";
import DOMPurify from 'dompurify';

// Using global interface from types.d.ts

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
  assessmentConversation?: any[];
  teachingConversation?: any[];
}

export default function NewFeedbackScreen({ 
  onPrevious,
  feedbackData: propsFeedbackData, // Feedback data can be passed via props
  assessmentConversation: propsAssessmentConversation,
  teachingConversation: propsTeachingConversation
}: NewFeedbackScreenProps): JSX.Element {
  // State to track component initialization
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State for feedback data with default values
  const [feedbackData, setFeedbackData] = useState<{
    summary: string;
    contentKnowledgeScore: number;
    writingScore: number;
    nextSteps: string;
  }>({
    summary: "Please wait, loading your results...",
    contentKnowledgeScore: 0,
    writingScore: 0,
    nextSteps: "Your personalized recommendations will appear here."
  });

  // Log initialization for debugging
  useEffect(() => {
    console.log("NewFeedbackScreen mounted/rendered");
    console.log("Window.__assessmentData at mount time:", window.__assessmentData);
    console.log("Window.__assessmentData?.feedbackData at mount time:", window.__assessmentData?.feedbackData);
    
    // Notify parent window of course completion
    try {
      // Try to get data with priority: Props > GlobalStorage > Window > No Data
      if (propsFeedbackData) {
        console.log("Sending course completion with propsFeedbackData");
        notifyCourseCompleted(propsFeedbackData);
      } else {
        const globalData = globalStorage.getFeedbackData();
        
        if (globalData && (globalData.contentKnowledgeScore || globalData.writingScore)) {
          console.log("🔴 GLOBAL STORAGE - Sending course completion with globalStorage data");
          notifyCourseCompleted(globalData);
        } else if (window.__assessmentData?.feedbackData) {
          console.log("Sending course completion with window.__assessmentData.feedbackData");
          notifyCourseCompleted(window.__assessmentData.feedbackData);
        } else {
          console.log("Sending course completion with no data");
          notifyCourseCompleted();
        }
      }
    } catch (error) {
      console.error("Error sending course completion notification:", error);
    }
    
    // Check for global feedback data to help with debugging
    const checkForFeedbackData = () => {
      console.log("Polling for window.__assessmentData.feedbackData...");
      console.log("Current window.__assessmentData:", window.__assessmentData);
      
      if (window.__assessmentData?.feedbackData) {
        console.log("Found feedbackData during polling:", window.__assessmentData.feedbackData);
      } else {
        setTimeout(checkForFeedbackData, 500);
      }
    };
    
    // Start checking for feedback data
    checkForFeedbackData();
    
  }, []);

  // Data initialization effect - completely reworked to use globalStorage
  useEffect(() => {
    if (isInitialized) return; // Only run once
    
    console.log("⚠️ IMPORTANT - Direct initialization of NewFeedbackScreen data using globalStorage");
    console.log("Received propsFeedbackData:", propsFeedbackData);
    
    // Try to get data from our persistent global storage first
    const globalData = globalStorage.getFeedbackData();
    
    // Log what we found in global storage
    console.log("🔴 GLOBAL STORAGE - Retrieved feedback data:", globalData);
    
    // Helper function to check if data appears to be valid
    const isValidFeedbackData = (data: any) => {
      return data && typeof data === 'object' && (
        'summary' in data || 
        'contentKnowledgeScore' in data || 
        'writingScore' in data || 
        'nextSteps' in data
      );
    };
    
    // Priority 1: Use data from global storage if it exists and has any score values
    if (globalData && isValidFeedbackData(globalData) && 
        (globalData.contentKnowledgeScore > 0 || globalData.writingScore > 0)) {
      console.log("🔴 GLOBAL STORAGE - Using valid feedback data from global storage:", globalData);
      
      // No need to format, global storage already handles that
      setFeedbackData(globalData);
    }
    // Priority 2: Use props feedback data if available
    else if (propsFeedbackData && isValidFeedbackData(propsFeedbackData)) {
      console.log("🔴 GLOBAL STORAGE - Using and storing valid feedback data from props");
      
      // Process and store in global storage to ensure consistency
      const processedData = {
        summary: typeof propsFeedbackData.summary === 'string' ? 
          propsFeedbackData.summary : 
          "No feedback summary available.",
          
        contentKnowledgeScore: typeof propsFeedbackData.contentKnowledgeScore === 'number' ? 
          Number(propsFeedbackData.contentKnowledgeScore) : 
          0,
          
        writingScore: typeof propsFeedbackData.writingScore === 'number' ? 
          Number(propsFeedbackData.writingScore) : 
          0,
          
        nextSteps: typeof propsFeedbackData.nextSteps === 'string' ? 
          propsFeedbackData.nextSteps : 
          "No next steps available."
      };
      
      // Store for future components
      globalStorage.setFeedbackData(processedData);
      
      // Use in this component
      setFeedbackData(processedData);
    }
    // Priority 3: Use window.__assessmentData as fallback for backward compatibility
    else if (window.__assessmentData?.feedbackData && isValidFeedbackData(window.__assessmentData.feedbackData)) {
      console.log("🔴 GLOBAL STORAGE - Using window.__assessmentData as fallback");
      
      const windowData = window.__assessmentData.feedbackData;
      
      // Process and store in global storage to ensure consistency
      const processedData = {
        summary: typeof windowData.summary === 'string' ? 
          windowData.summary : 
          "No feedback summary available.",
          
        contentKnowledgeScore: typeof windowData.contentKnowledgeScore === 'number' ? 
          Number(windowData.contentKnowledgeScore) : 
          0,
          
        writingScore: typeof windowData.writingScore === 'number' ? 
          Number(windowData.writingScore) : 
          0,
          
        nextSteps: typeof windowData.nextSteps === 'string' ? 
          windowData.nextSteps : 
          "No next steps available."
      };
      
      // Store for future components
      globalStorage.setFeedbackData(processedData);
      
      // Use in this component
      setFeedbackData(processedData);
    }
    // LAST RESORT - only if absolutely no data is available
    else {
      console.log("🔴 GLOBAL STORAGE - No valid feedback data found in any source");
      
      // These minimal fallback values are only used when no data could be found anywhere
      const fallbackData = {
        summary: "No feedback data was received. This is typically caused by minimal student interaction during the assessment.",
        contentKnowledgeScore: 0,
        writingScore: 0,
        nextSteps: "Try again with more detailed responses to questions to receive personalized feedback."
      };
      
      console.log("🔴 GLOBAL STORAGE - Using minimal fallback data");
      setFeedbackData(fallbackData);
    }
    
    setIsInitialized(true);
  }, [propsFeedbackData, isInitialized]);
  
  // Separate effect to log state updates
  useEffect(() => {
    console.log("Current feedback data state:", feedbackData);
  }, [feedbackData]);

  // Helper function to get color class based on score (0-4 scale)
  const getColorClass = (score: number) => {
    // Convert score to 100-scale for color determination
    const normalizedScore = score <= 4 ? (score / 4) * 100 : score;
    
    if (normalizedScore >= 85) return "bg-green-100 border-green-200 text-green-800";
    if (normalizedScore >= 70) return "bg-blue-100 border-blue-200 text-blue-800";
    if (normalizedScore >= 50) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    return "bg-red-100 border-red-200 text-red-800";
  };

  // Helper function to determine CSS background color class based on score (0-4 scale)
  const getProgressColor = (score: number): string => {
    // Convert score to 100-scale for color determination
    const normalizedScore = score <= 4 ? (score / 4) * 100 : score;
    
    if (normalizedScore >= 85) return "bg-green-500";
    if (normalizedScore >= 70) return "bg-blue-500";
    if (normalizedScore >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Function to handle PDF download of learning results
  const handleDownloadPDF = () => {
    // Create a container for the content
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    // Get assessment conversation data with priority: props > globalStorage > window
    const assessmentConv = propsAssessmentConversation || 
                          globalStorage.getAssessmentMessages() || 
                          window.__assessmentData?.messages || 
                          [];
    
    // Get teaching conversation data with priority: props > globalStorage > window
    const teachingConv = propsTeachingConversation || 
                        globalStorage.getTeachingMessages() || 
                        window.__assessmentData?.teachingMessages || 
                        [];

    // Format conversations for the PDF with sanitization
    const formatConversation = (messages: any[]) => {
      return messages.map((msg, index) => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'Student';
        const bgColor = msg.role === 'assistant' ? '#F0F7FF' : '#F5F5F5';
        // Sanitize message content to prevent XSS
        const safeContent = DOMPurify.sanitize(msg.content || '');
        return `
          <div style="background-color: ${bgColor}; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
            <strong>${role}:</strong>
            <p style="white-space: pre-wrap; margin-top: 5px;">${safeContent}</p>
          </div>
        `;
      }).join('');
    };

    const assessmentConvHTML = formatConversation(assessmentConv);
    const teachingConvHTML = formatConversation(teachingConv);
    
    // Sanitize feedback data
    const safeSummary = DOMPurify.sanitize(feedbackData.summary || '');
    const safeNextSteps = DOMPurify.sanitize(feedbackData.nextSteps || '');
    
    // Create HTML template
    const htmlTemplate = `
      <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 20px;">Learning Results - Three Branches of Government</h1>
      
      <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2563EB; font-size: 18px; margin-bottom: 10px;">Overall Feedback</h2>
        <p style="color: #374151; line-height: 1.6;">${safeSummary}</p>
      </div>
      
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE; background-color: #EFF6FF;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Content Knowledge</h3>
          <p>Score: ${feedbackData.contentKnowledgeScore > 4 
            ? `${(feedbackData.contentKnowledgeScore / 25).toFixed(1)}/4` 
            : `${Math.min(4, feedbackData.contentKnowledgeScore)}/4`}</p>
        </div>
        
        <div style="flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE; background-color: #EFF6FF;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Writing Quality</h3>
          <p>Score: ${feedbackData.writingScore > 4 
            ? `${(feedbackData.writingScore / 25).toFixed(1)}/4` 
            : `${Math.min(4, feedbackData.writingScore)}/4`}</p>
        </div>
      </div>
      
      <div style="background-color: #FFFBEB; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #D97706; font-size: 18px; margin-bottom: 10px;">What's Next for You</h2>
        <p style="color: #374151; line-height: 1.6;">${safeNextSteps}</p>
      </div>
      
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #4B5563; font-size: 18px; margin-bottom: 10px;">Three Branches of Government - Learning Content</h2>
        <p><strong>Objective:</strong> Understand the three branches of government and how they work together.</p>
        
        <h3 style="margin-top: 15px;">Key Concepts</h3>
        <ul>
          <li><strong>Executive Branch:</strong> Enforces laws, led by the President.</li>
          <li><strong>Legislative Branch:</strong> Makes laws, consisting of Congress (House and Senate).</li>
          <li><strong>Judicial Branch:</strong> Interprets laws, with the Supreme Court at the top.</li>
          <li><strong>Checks and Balances:</strong> System where each branch limits the power of the others.</li>
          <li><strong>Separation of Powers:</strong> Division of government responsibilities into distinct branches.</li>
        </ul>
      </div>
      
      <!-- Assessment Conversation Transcript -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #4B5563; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
          Assessment Conversation Transcript
        </h2>
        ${assessmentConvHTML}
      </div>
      
      <!-- Teaching Conversation Transcript -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #4B5563; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
          Teaching Conversation Transcript
        </h2>
        ${teachingConvHTML}
      </div>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 30px; text-align: center;">
        Downloaded on ${new Date().toLocaleDateString()} - Learning Platform
      </p>
    `;
    
    // Set sanitized HTML content to the element
    element.innerHTML = DOMPurify.sanitize(htmlTemplate);
    
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
              {(() => {
                console.log(`⚠️ DEBUG Badge display - contentKnowledgeScore: ${feedbackData.contentKnowledgeScore}, type: ${typeof feedbackData.contentKnowledgeScore}`);
                return feedbackData.contentKnowledgeScore > 4 
                  ? `${(feedbackData.contentKnowledgeScore / 25).toFixed(1)}/4` 
                  : `${Math.min(4, feedbackData.contentKnowledgeScore)}/4`;
              })()}
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.contentKnowledgeScore)}`}
              style={{ width: (() => {
                const percentValue = Math.max(1, feedbackData.contentKnowledgeScore >= 4 
                  ? 100  // If score is 4 or more, show 100%
                  : (feedbackData.contentKnowledgeScore / 4) * 100);
                console.log(`⚠️ DEBUG Progress bar - contentKnowledgeScore: ${feedbackData.contentKnowledgeScore}, calculated width: ${percentValue}%`);
                return `${percentValue}%`;
              })() }}
            ></div>
          </div>
        </div>

        {/* Writing Score */}
        <div className={`p-5 rounded-lg border ${getColorClass(feedbackData.writingScore)}`}>
          <h3 className="text-lg font-medium mb-2">Writing Quality</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Score:</span>
            <Badge className="bg-white text-gray-800 border border-current">
              {(() => {
                console.log(`⚠️ DEBUG Badge display - writingScore: ${feedbackData.writingScore}, type: ${typeof feedbackData.writingScore}`);
                return feedbackData.writingScore > 4 
                  ? `${(feedbackData.writingScore / 25).toFixed(1)}/4` 
                  : `${Math.min(4, feedbackData.writingScore)}/4`;
              })()}
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.writingScore)}`}
              style={{ width: (() => {
                const percentValue = Math.max(1, feedbackData.writingScore >= 4 
                  ? 100  // If score is 4 or more, show 100%
                  : (feedbackData.writingScore / 4) * 100);
                console.log(`⚠️ DEBUG Progress bar - writingScore: ${feedbackData.writingScore}, calculated width: ${percentValue}%`);
                return `${percentValue}%`;
              })() }}
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

      {/* Conversation Transcripts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation Transcripts</h2>
        
        {/* Assessment Bot Conversation */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
            <h3 className="font-medium text-blue-800 mb-2">Assessment Conversation</h3>
            <p className="text-sm text-gray-600 mb-4">This is the conversation with the assessment bot that evaluated your knowledge.</p>
            
            <div className="max-h-96 overflow-y-auto border border-gray-200 bg-white rounded-md p-4">
              {(() => {
                // Get assessment conversation with priority order: Props > GlobalStorage > Window
                const assessmentMessages = propsAssessmentConversation || 
                                          globalStorage.getAssessmentMessages() || 
                                          window.__assessmentData?.messages || 
                                          [];
                
                console.log("🔴 GLOBAL STORAGE - Assessment messages for display:", 
                  assessmentMessages.length, "messages");
                
                return assessmentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {assessmentMessages.map((message, index) => (
                      <div key={index} className={`p-2 rounded ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          {message.role === 'assistant' ? 'Assessment Bot' : 'You'}:
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No assessment conversation data available</p>
                );
              })()}
            </div>
          </div>
          
          {/* Teaching Bot Conversation */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Teaching Conversation</h3>
            <p className="text-sm text-gray-600 mb-4">This is the conversation with the teaching assistant that provided personalized guidance.</p>
            
            <div className="max-h-96 overflow-y-auto border border-gray-200 bg-white rounded-md p-4">
              {(() => {
                // Get teaching conversation with priority order: Props > GlobalStorage > Window
                const teachingMessages = propsTeachingConversation || 
                                       globalStorage.getTeachingMessages() || 
                                       window.__assessmentData?.teachingMessages || 
                                       [];
                
                console.log("🔴 GLOBAL STORAGE - Teaching messages for display:", 
                  teachingMessages.length, "messages");
                
                return teachingMessages.length > 0 ? (
                  <div className="space-y-3">
                    {teachingMessages.map((message: any, index: number) => (
                      <div key={index} className={`p-2 rounded ${message.role === 'assistant' ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          {message.role === 'assistant' ? 'Teaching Assistant' : 'You'}:
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No teaching conversation data available</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
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