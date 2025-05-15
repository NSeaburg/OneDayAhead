import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Award, Sparkles, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';
import globalStorage from "@/lib/globalStorage";

interface FeedbackData {
  summary?: string;
  contentKnowledgeScore?: number;
  writingScore?: number;
  nextSteps?: string;
}

interface SimpleFeedbackScreenProps {
  onPrevious?: () => void;
  feedbackData?: FeedbackData;
}

export default function SimpleFeedbackScreen({ 
  onPrevious,
  feedbackData: propsFeedbackData 
}: SimpleFeedbackScreenProps): JSX.Element {
  // State for feedback data with default values
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    summary: "Please wait, loading your results...",
    contentKnowledgeScore: 0,
    writingScore: 0,
    nextSteps: "Your personalized recommendations will appear here."
  });
  
  const [assessmentMessages, setAssessmentMessages] = useState<any[]>([]);
  const [teachingMessages, setTeachingMessages] = useState<any[]>([]);

  // One-time initialization useEffect with [] dependency array
  useEffect(() => {
    console.log("SimpleFeedbackScreen mounted");
    
    // Log data sources for debugging
    console.log("Props feedbackData:", propsFeedbackData);
    console.log("Window.__assessmentData?.feedbackData:", window.__assessmentData?.feedbackData);
    console.log("globalStorage.getFeedbackData():", globalStorage.getFeedbackData());
    
    // PRIORITY 1: Props data
    if (propsFeedbackData) {
      console.log("Using feedback data from props");
      setFeedbackData({
        summary: propsFeedbackData.summary,
        contentKnowledgeScore: Number(propsFeedbackData.contentKnowledgeScore),
        writingScore: Number(propsFeedbackData.writingScore),
        nextSteps: propsFeedbackData.nextSteps
      });
    }
    // PRIORITY 2: Global storage data
    else {
      const storedData = globalStorage.getFeedbackData();
      if (storedData && (storedData.contentKnowledgeScore || storedData.writingScore)) {
        console.log("Using feedback data from globalStorage:", storedData);
        setFeedbackData({
          summary: storedData.summary,
          contentKnowledgeScore: Number(storedData.contentKnowledgeScore),
          writingScore: Number(storedData.writingScore),
          nextSteps: storedData.nextSteps
        });
      }
      // PRIORITY 3: Window data
      else if (window.__assessmentData?.feedbackData) {
        const windowData = window.__assessmentData.feedbackData;
        console.log("Using feedback data from window object:", windowData);
        setFeedbackData({
          summary: windowData.summary,
          contentKnowledgeScore: Number(windowData.contentKnowledgeScore),
          writingScore: Number(windowData.writingScore),
          nextSteps: windowData.nextSteps
        });
      }
    }
    
    // ASSESSMENT MESSAGES
    // ------------------
    const assessmentMsgs = globalStorage.getAssessmentMessages() || 
                          window.__assessmentData?.messages || 
                          [];
    
    console.log(`ASSESSMENT TRANSCRIPT: Found ${assessmentMsgs.length} messages`);
    if (assessmentMsgs.length > 0) {
      console.log("Assessment first message:", 
        assessmentMsgs[0].role, 
        assessmentMsgs[0].content.substring(0, 50) + "..."
      );
    }
    
    // TEACHING MESSAGES
    // ----------------
    // For teaching messages, try multiple sources with detailed logging
    const globalTeachingMsgs = globalStorage.getTeachingMessages();
    const windowTeachingMsgs = window.__assessmentData?.teachingMessages;
    
    console.log("🔍 TEACHING SOURCES:");
    console.log("- localStorage/globalStorage:", globalTeachingMsgs?.length || 0, "messages");
    console.log("- window.__assessmentData:", windowTeachingMsgs?.length || 0, "messages");
    
    // Create a deep clone of whichever source has messages (prioritize global storage)
    let teachingMsgs = [];
    
    if (globalTeachingMsgs && globalTeachingMsgs.length > 0) {
      console.log("✅ Using teaching messages from globalStorage");
      teachingMsgs = JSON.parse(JSON.stringify(globalTeachingMsgs));
    } else if (windowTeachingMsgs && windowTeachingMsgs.length > 0) {
      console.log("✅ Using teaching messages from window.__assessmentData");
      teachingMsgs = JSON.parse(JSON.stringify(windowTeachingMsgs));
    } else {
      console.log("⚠️ No teaching messages found in any source");
      
      // Create a minimal fallback message for display if we have no real messages
      // (this is just for display purposes in the transcript - not stored or used elsewhere)
      teachingMsgs = [{
        role: "assistant",
        content: "Hello! I'm your specialized teaching assistant for this part of the learning journey."
      }];
    }
    
    console.log("🔍 TEACHING TRANSCRIPT: Final teaching messages to display:", 
      teachingMsgs.length, "messages");
    
    if (teachingMsgs.length > 0) {
      console.log("Teaching first message:", 
        teachingMsgs[0].role, 
        teachingMsgs[0].content.substring(0, 50) + "..."
      );
    }
    
    setAssessmentMessages(assessmentMsgs);
    setTeachingMessages(teachingMsgs);
  }, [propsFeedbackData]);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("⚠️ SCORES DISPLAYED - Current feedback data:", 
      JSON.stringify({
        contentKnowledgeScore: feedbackData.contentKnowledgeScore,
        contentKnowledgeScoreType: typeof feedbackData.contentKnowledgeScore,
        writingScore: feedbackData.writingScore,
        writingScoreType: typeof feedbackData.writingScore
      }, null, 2)
    );
  }, [feedbackData]);

  // Helper function to get color class based on score (0-4 scale)
  const getColorClass = (score?: number) => {
    const safeScore = Number(score || 0);
    if (safeScore >= 3.5) return "bg-green-100 border-green-200 text-green-800";
    if (safeScore >= 2.5) return "bg-blue-100 border-blue-200 text-blue-800";
    if (safeScore >= 1.5) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    return "bg-red-100 border-red-200 text-red-800";
  };

  // Helper function to determine CSS background color class based on score (0-4 scale)
  const getProgressColor = (score?: number): string => {
    const safeScore = Number(score || 0);
    if (safeScore >= 3.5) return "bg-green-500";
    if (safeScore >= 2.5) return "bg-blue-500";
    if (safeScore >= 1.5) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Calculate percentage for progress bar (ensures we show at least a small amount)
  const calculateProgressPercentage = (score?: number): string => {
    // Ensure score is treated as a number
    const numericScore = Number(score || 0);
    // Calculate percentage based on 0-4 scale
    const percent = Math.max(5, (numericScore / 4) * 100);
    return `${percent}%`;
  };
  
  // Function to handle PDF download
  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    // Format conversations for the PDF
    const formatConversation = (messages: any[]) => {
      return messages.map((msg) => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'Student';
        const bgColor = msg.role === 'assistant' ? '#F0F7FF' : '#F5F5F5';
        return `
          <div style="background-color: ${bgColor}; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
            <strong>${role}:</strong>
            <p style="white-space: pre-wrap; margin-top: 5px;">${msg.content}</p>
          </div>
        `;
      }).join('');
    };
    
    const assessmentConvHTML = formatConversation(assessmentMessages);
    const teachingConvHTML = formatConversation(teachingMessages);
    
    // Create PDF content
    element.innerHTML = `
      <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 20px;">Learning Results - Three Branches of Government</h1>
      
      <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2563EB; font-size: 18px; margin-bottom: 10px;">Overall Feedback</h2>
        <p style="color: #374151; line-height: 1.6;">${feedbackData.summary || 'No feedback summary available.'}</p>
      </div>
      
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE; background-color: #EFF6FF;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Content Knowledge</h3>
          <p>Score: ${feedbackData.contentKnowledgeScore || 0}/4</p>
        </div>
        
        <div style="flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #BFDBFE; background-color: #EFF6FF;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Writing Quality</h3>
          <p>Score: ${feedbackData.writingScore || 0}/4</p>
        </div>
      </div>
      
      <div style="background-color: #FFFBEB; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #D97706; font-size: 18px; margin-bottom: 10px;">What's Next for You</h2>
        <p style="color: #374151; line-height: 1.6;">${feedbackData.nextSteps || 'No next steps available.'}</p>
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
    `;
    
    // Configure PDF options
    const options = {
      margin: 10,
      filename: 'learning-results.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and save the PDF
    html2pdf().from(element).set(options).save();
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-full max-w-5xl mx-auto">
      {/* Header */}
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

      {/* Overall feedback */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
          Overall Feedback
        </h2>
        <div className="text-gray-700 leading-relaxed markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedbackData.summary || 'No feedback summary available.'}</ReactMarkdown>
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
              {`${feedbackData.contentKnowledgeScore || 0}/4`}
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.contentKnowledgeScore)}`}
              style={{ width: calculateProgressPercentage(feedbackData.contentKnowledgeScore) }}
            ></div>
          </div>
        </div>

        {/* Writing Score */}
        <div className={`p-5 rounded-lg border ${getColorClass(feedbackData.writingScore)}`}>
          <h3 className="text-lg font-medium mb-2">Writing Quality</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Score:</span>
            <Badge className="bg-white text-gray-800 border border-current">
              {`${feedbackData.writingScore || 0}/4`}
            </Badge>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(feedbackData.writingScore)}`}
              style={{ width: calculateProgressPercentage(feedbackData.writingScore) }}
            ></div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <Card className="p-5 bg-yellow-50 border-yellow-100 mb-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
          What's Next for You
        </h2>
        <div className="text-gray-700 leading-relaxed markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedbackData.nextSteps || 'No next steps available.'}</ReactMarkdown>
        </div>
      </Card>

      {/* Conversation Transcripts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation Transcripts</h2>
        
        {/* If both transcripts are empty, show a more helpful message */}
        {assessmentMessages.length === 0 && teachingMessages.length <= 1 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-lg text-yellow-800 mb-3">Conversation History Not Available</h3>
            <p className="text-yellow-700 mb-4">
              The transcript of your conversations with Reginald Worthington III and your teaching assistant
              couldn't be retrieved. This might happen if you're viewing this page directly without completing
              the previous steps.
            </p>
            <Button
              variant="outline"
              className="text-yellow-700 border-yellow-400 hover:bg-yellow-100"
              onClick={() => {
                // Show localStorage data in console for debugging
                console.log("DEBUG - localStorage: ", localStorage.getItem('learningAppGlobalStorage'));
                console.log("DEBUG - window.__assessmentData: ", window.__assessmentData);
                console.log("DEBUG - teachingMessages: ", teachingMessages);
                console.log("DEBUG - assessmentMessages: ", assessmentMessages);
                
                alert("Storage information has been output to the console for debugging");
              }}
            >
              Debug Info
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Assessment Bot Conversation */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Assessment Conversation with Reginald Worthington III</h3>
              <div className="max-h-80 overflow-y-auto border border-gray-200 bg-white rounded-md p-4">
                {assessmentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {assessmentMessages.map((message, index) => {
                      // Skip any empty or invalid messages
                      if (!message || !message.content) {
                        return null;
                      }
                      
                      return (
                        <div key={index} className={`p-2 rounded ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            {message.role === 'assistant' ? 'Reginald Worthington III' : 'You'}:
                          </p>
                          <div className="text-sm prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No assessment conversation data available</p>
                )}
              </div>
            </div>
            
            {/* Teaching Bot Conversation */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Teaching Conversation</h3>
              <div className="max-h-80 overflow-y-auto border border-gray-200 bg-white rounded-md p-4">
                {teachingMessages.length > 0 ? (
                  <div className="space-y-3">
                    {teachingMessages.map((message, index) => {
                      // Skip any empty or invalid messages
                      if (!message || !message.content) {
                        return null;
                      }
                      
                      // Determine the correct display name
                      let speakerName = "Teaching Assistant";
                      if (message.role === 'assistant') {
                        // Look for Mrs/Mr in the content to identify the teacher
                        if (message.content.includes("Mrs. Parton")) {
                          speakerName = "Mrs. Parton";
                        } else if (message.content.includes("Mrs. Bannerman")) {
                          speakerName = "Mrs. Bannerman";
                        } else if (message.content.includes("Mr. Whitaker")) {
                          speakerName = "Mr. Whitaker";
                        }
                      } else if (message.role === 'user') {
                        speakerName = "You";
                      }
                      
                      return (
                        <div key={index} className={`p-2 rounded ${message.role === 'assistant' ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            {speakerName}:
                          </p>
                          <div className="text-sm prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No teaching conversation data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Back button */}
      {onPrevious && (
        <div className="mt-auto">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Previous Step
          </Button>
        </div>
      )}
    </div>
  );
}