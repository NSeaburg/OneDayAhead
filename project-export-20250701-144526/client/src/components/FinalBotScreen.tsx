import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Award, Sparkles, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from 'html2pdf.js';

// Define global window interface for accessing feedback data
declare global {
  interface Window {
    __assessmentData?: {
      threadId?: string;
      messages?: any[];
      teachingMessages?: any[]; // For storing teaching bot conversation
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
  // Log when this component mounts to help with debugging
  useEffect(() => {
    console.log("FinalBotScreen mounted/rendered");
    console.log("Received propsFeedbackData:", propsFeedbackData);
    console.log("Window.__assessmentData:", window.__assessmentData);
  }, []);
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
      console.log("Using feedback data from props:", propsFeedbackData);
      // Make sure to directly use the props values, not fall back to current state
      const newFeedbackData = {
        summary: propsFeedbackData.summary || "No summary provided",
        contentKnowledgeScore: propsFeedbackData.contentKnowledgeScore || 0,
        writingScore: propsFeedbackData.writingScore || 0,
        nextSteps: propsFeedbackData.nextSteps || "No next steps provided"
      };
      
      console.log("Setting new feedback data:", newFeedbackData);
      setFeedbackData(newFeedbackData);
    } 
    // Then check window object for feedback data
    else if (window.__assessmentData?.feedbackData) {
      const windowData = window.__assessmentData.feedbackData;
      console.log("Using feedback data from window.__assessmentData:", windowData);
      
      const newFeedbackData = {
        summary: windowData.summary || "No summary provided",
        contentKnowledgeScore: windowData.contentKnowledgeScore || 0,
        writingScore: windowData.writingScore || 0,
        nextSteps: windowData.nextSteps || "No next steps provided"
      };
      
      console.log("Setting new feedback data from window:", newFeedbackData);
      setFeedbackData(newFeedbackData);
    } else {
      console.log("No feedback data found in props or window object. Using default values.");
    }
    
    // Log the current state after the effect runs
    // This won't reflect the latest state due to closures, it will show the previous state
    console.log("Current feedback data state:", feedbackData);
    
    // Use a separate effect to log the updated state
  }, [propsFeedbackData]);
  
  // Separate effect to log the updated state after changes
  useEffect(() => {
    console.log("Updated feedback data state:", feedbackData);
  }, [feedbackData]);

  // Helper function to get color class based on score (0-4 scale)
  const getColorClass = (score: number) => {
    if (score >= 3.5) return "bg-green-100 border-green-200 text-green-800";
    if (score >= 3) return "bg-blue-100 border-blue-200 text-blue-800";
    if (score >= 2) return "bg-yellow-100 border-yellow-200 text-yellow-800";
    return "bg-red-100 border-red-200 text-red-800";
  };

  // Helper function to determine CSS background color class based on score (0-4 scale)
  const getProgressColor = (score: number): string => {
    if (score >= 3.5) return "bg-green-500";
    if (score >= 3) return "bg-blue-500";
    if (score >= 2) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Function to handle PDF download of learning results
  const handleDownloadPDF = () => {
    // Create a container for the content
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    // Create heading
    const heading = document.createElement('h1');
    heading.style.color = '#4F46E5';
    heading.style.fontSize = '24px';
    heading.style.marginBottom = '20px';
    heading.textContent = 'Learning Results - Three Branches of Government';
    element.appendChild(heading);
    
    // Create overall feedback section
    const feedbackSection = document.createElement('div');
    feedbackSection.style.backgroundColor = '#EFF6FF';
    feedbackSection.style.padding = '15px';
    feedbackSection.style.borderRadius = '8px';
    feedbackSection.style.marginBottom = '20px';
    
    const feedbackHeading = document.createElement('h2');
    feedbackHeading.style.color = '#2563EB';
    feedbackHeading.style.fontSize = '18px';
    feedbackHeading.style.marginBottom = '10px';
    feedbackHeading.textContent = 'Overall Feedback';
    feedbackSection.appendChild(feedbackHeading);
    
    const feedbackContent = document.createElement('p');
    feedbackContent.style.color = '#374151';
    feedbackContent.style.lineHeight = '1.6';
    feedbackContent.textContent = feedbackData.summary;
    feedbackSection.appendChild(feedbackContent);
    
    element.appendChild(feedbackSection);
    
    // Create scores section
    const scoresSection = document.createElement('div');
    scoresSection.style.display = 'flex';
    scoresSection.style.gap = '20px';
    scoresSection.style.marginBottom = '20px';
    
    // Content knowledge score
    const contentScoreDiv = document.createElement('div');
    contentScoreDiv.style.flex = '1';
    contentScoreDiv.style.padding = '15px';
    contentScoreDiv.style.borderRadius = '8px';
    contentScoreDiv.style.border = '1px solid #BFDBFE';
    contentScoreDiv.style.backgroundColor = '#EFF6FF';
    
    const contentScoreHeading = document.createElement('h3');
    contentScoreHeading.style.fontSize = '16px';
    contentScoreHeading.style.marginBottom = '10px';
    contentScoreHeading.textContent = 'Content Knowledge';
    contentScoreDiv.appendChild(contentScoreHeading);
    
    const contentScorePara = document.createElement('p');
    contentScorePara.textContent = `Score: ${feedbackData.contentKnowledgeScore}/4`;
    contentScoreDiv.appendChild(contentScorePara);
    
    scoresSection.appendChild(contentScoreDiv);
    
    // Writing score
    const writingScoreDiv = document.createElement('div');
    writingScoreDiv.style.flex = '1';
    writingScoreDiv.style.padding = '15px';
    writingScoreDiv.style.borderRadius = '8px';
    writingScoreDiv.style.border = '1px solid #BFDBFE';
    writingScoreDiv.style.backgroundColor = '#EFF6FF';
    
    const writingScoreHeading = document.createElement('h3');
    writingScoreHeading.style.fontSize = '16px';
    writingScoreHeading.style.marginBottom = '10px';
    writingScoreHeading.textContent = 'Writing Quality';
    writingScoreDiv.appendChild(writingScoreHeading);
    
    const writingScorePara = document.createElement('p');
    writingScorePara.textContent = `Score: ${feedbackData.writingScore}/4`;
    writingScoreDiv.appendChild(writingScorePara);
    
    scoresSection.appendChild(writingScoreDiv);
    element.appendChild(scoresSection);
    
    // Create next steps section
    const nextStepsSection = document.createElement('div');
    nextStepsSection.style.backgroundColor = '#FFFBEB';
    nextStepsSection.style.padding = '15px';
    nextStepsSection.style.borderRadius = '8px';
    nextStepsSection.style.marginBottom = '20px';
    
    const nextStepsHeading = document.createElement('h2');
    nextStepsHeading.style.color = '#D97706';
    nextStepsHeading.style.fontSize = '18px';
    nextStepsHeading.style.marginBottom = '10px';
    nextStepsHeading.textContent = 'What\'s Next for You';
    nextStepsSection.appendChild(nextStepsHeading);
    
    const nextStepsContent = document.createElement('p');
    nextStepsContent.style.color = '#374151';
    nextStepsContent.style.lineHeight = '1.6';
    nextStepsContent.textContent = feedbackData.nextSteps;
    nextStepsSection.appendChild(nextStepsContent);
    
    element.appendChild(nextStepsSection);
    
    // Create content section
    const contentSection = document.createElement('div');
    contentSection.style.backgroundColor = '#F3F4F6';
    contentSection.style.padding = '15px';
    contentSection.style.borderRadius = '8px';
    
    const contentHeading = document.createElement('h2');
    contentHeading.style.color = '#4B5563';
    contentHeading.style.fontSize = '18px';
    contentHeading.style.marginBottom = '10px';
    contentHeading.textContent = 'Three Branches of Government - Learning Content';
    contentSection.appendChild(contentHeading);
    
    const objectivePara = document.createElement('p');
    const objectiveStrong = document.createElement('strong');
    objectiveStrong.textContent = 'Objective: ';
    objectivePara.appendChild(objectiveStrong);
    objectivePara.appendChild(document.createTextNode('Understand the three branches of government and how they work together.'));
    contentSection.appendChild(objectivePara);
    
    const gradePara = document.createElement('p');
    const gradeStrong = document.createElement('strong');
    gradeStrong.textContent = 'Grade: ';
    gradePara.appendChild(gradeStrong);
    gradePara.appendChild(document.createTextNode('7-9'));
    contentSection.appendChild(gradePara);
    
    const conceptsHeading = document.createElement('h3');
    conceptsHeading.style.marginTop = '15px';
    conceptsHeading.textContent = 'Key Concepts';
    contentSection.appendChild(conceptsHeading);
    
    const conceptsList = document.createElement('ul');
    
    const concepts = [
      { name: 'Executive Branch', desc: 'Enforces laws, led by the President.' },
      { name: 'Legislative Branch', desc: 'Makes laws, consisting of Congress (House and Senate).' },
      { name: 'Judicial Branch', desc: 'Interprets laws, with the Supreme Court at the top.' },
      { name: 'Checks and Balances', desc: 'System where each branch limits the power of the others.' },
      { name: 'Separation of Powers', desc: 'Division of government responsibilities into distinct branches.' }
    ];
    
    concepts.forEach(concept => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${concept.name}: `;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(concept.desc));
      conceptsList.appendChild(li);
    });
    
    contentSection.appendChild(conceptsList);
    element.appendChild(contentSection);
    
    // Create footer
    const footer = document.createElement('p');
    footer.style.color = '#6B7280';
    footer.style.fontSize = '12px';
    footer.style.marginTop = '30px';
    footer.style.textAlign = 'center';
    footer.textContent = `Downloaded on ${new Date().toLocaleDateString()} - Learning Platform`;
    element.appendChild(footer);
    
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
