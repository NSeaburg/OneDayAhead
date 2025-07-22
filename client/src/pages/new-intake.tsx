import { useState } from "react";
import { Check, ChevronDown, ChevronRight, TestTube, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Stage {
  id: number;
  title: string;
  description: string;
  components: Component[];
  hasTestButton?: boolean;
  testButtonText?: string;
}

interface Component {
  id: string;
  title: string;
  completed: boolean;
  type: 'explicit' | 'implicit' | 'bot-assisted' | 'file-upload';
  note?: string;
}

const stages: Stage[] = [
  {
    id: 1,
    title: "The Basics",
    description: "Let's get to know each other",
    components: [
      { id: "school-district", title: "School District", completed: false, type: 'explicit', note: "or N/A" },
      { id: "school", title: "School", completed: false, type: 'explicit' },
      { id: "subject", title: "Subject", completed: false, type: 'explicit' },
      { id: "topic", title: "Topic", completed: false, type: 'explicit' },
      { id: "grade-level", title: "Grade Level", completed: false, type: 'explicit' },
      { id: "learning-objectives", title: "Learning Objectives", completed: false, type: 'explicit' },
    ]
  },
  {
    id: 2,
    title: "Context Collection",
    description: "What have your students already done in this course?",
    components: [
      { id: "course-context", title: "Course Context", completed: false, type: 'bot-assisted', note: "bot-filled text" },
      { id: "immediate-prep", title: "Immediate Preparation", completed: false, type: 'bot-assisted', note: "what they just did" },
      { id: "file-uploads", title: "Content Files", completed: false, type: 'file-upload', note: "YouTube, PDFs, text" },
    ],
    hasTestButton: true,
    testButtonText: "Test File Processing"
  },
  {
    id: 3,
    title: "Assessment Bot",
    description: "Design the evaluation character and criteria",
    components: [
      { id: "assessment-character", title: "Assessment Character", completed: false, type: 'explicit' },
      { id: "evaluation-criteria", title: "Evaluation Criteria", completed: false, type: 'explicit' },
      { id: "question-types", title: "Question Types", completed: false, type: 'implicit' },
      { id: "scoring-rubric", title: "Scoring Rubric", completed: false, type: 'implicit' },
    ],
    hasTestButton: true,
    testButtonText: "Test Assessment Bot"
  },
  {
    id: 4,
    title: "Teaching Assistants",
    description: "Create differentiated teaching bots",
    components: [
      { id: "routing-logic", title: "Routing Logic", completed: false, type: 'explicit' },
      { id: "high-level-bot", title: "High-Level Teaching Bot", completed: false, type: 'explicit' },
      { id: "medium-level-bot", title: "Medium-Level Teaching Bot", completed: false, type: 'explicit' },
      { id: "low-level-bot", title: "Low-Level Teaching Bot", completed: false, type: 'explicit' },
      { id: "teaching-strategies", title: "Teaching Strategies", completed: false, type: 'implicit' },
    ],
    hasTestButton: true,
    testButtonText: "Test Routing Logic"
  },
  {
    id: 5,
    title: "Final Configuration",
    description: "Polish and prepare for launch",
    components: [
      { id: "ui-customization", title: "UI Customization", completed: false, type: 'implicit' },
      { id: "feedback-system", title: "Feedback System", completed: false, type: 'implicit' },
      { id: "final-review", title: "Final Review", completed: false, type: 'explicit' },
    ],
    hasTestButton: true,
    testButtonText: "Test Full Experience"
  }
];

export default function NewIntake() {
  const [currentStage, setCurrentStage] = useState(1);
  const [expandedStages, setExpandedStages] = useState<number[]>([1]);
  const [stageData, setStageData] = useState(stages);

  const toggleStageExpanded = (stageId: number) => {
    setExpandedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const canNavigateToStage = (stageId: number) => {
    // Can always go backwards or to current stage
    if (stageId <= currentStage) return true;
    
    // Can only go forward if previous stage is complete
    const previousStage = stageData.find(s => s.id === stageId - 1);
    if (!previousStage) return false;
    
    const explicitComponents = previousStage.components.filter(c => c.type === 'explicit');
    return explicitComponents.every(c => c.completed);
  };

  const getStageProgress = (stage: Stage) => {
    const explicitComponents = stage.components.filter(c => c.type === 'explicit');
    const completedExplicit = explicitComponents.filter(c => c.completed).length;
    return {
      completed: completedExplicit,
      total: explicitComponents.length,
      isComplete: completedExplicit === explicitComponents.length
    };
  };

  const handleStageNavigation = (stageId: number) => {
    if (canNavigateToStage(stageId)) {
      setCurrentStage(stageId);
      if (!expandedStages.includes(stageId)) {
        setExpandedStages(prev => [...prev, stageId]);
      }
    }
  };

  const handleTestStage = (stageId: number) => {
    // TODO: Implement test functionality
    console.log(`Testing stage ${stageId}`);
  };

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Content Creator</h1>
          <p className="text-sm text-gray-600 mt-1">Uplevel your Course with AI</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {stageData.map((stage) => {
            const progress = getStageProgress(stage);
            const isExpanded = expandedStages.includes(stage.id);
            const canNavigate = canNavigateToStage(stage.id);
            const isCurrentStage = stage.id === currentStage;
            
            return (
              <div key={stage.id} className="space-y-1">
                {/* Stage Header */}
                <div 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isCurrentStage 
                      ? 'bg-blue-50 border border-blue-200' 
                      : canNavigate 
                        ? 'hover:bg-gray-50' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleStageNavigation(stage.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStageExpanded(stage.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? 
                      <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    }
                  </button>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      progress.isComplete 
                        ? 'bg-green-100 text-green-700' 
                        : isCurrentStage
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {progress.isComplete ? <Check className="w-3 h-3" /> : stage.id}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          canNavigate ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {stage.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          progress.isComplete 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        canNavigate ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Stage Components */}
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    {stage.components.map((component) => (
                      <div 
                        key={component.id}
                        className={`flex items-center gap-3 p-2 rounded text-sm cursor-pointer transition-colors ${
                          component.completed 
                            ? 'text-green-700 hover:bg-green-50' 
                            : component.type === 'explicit'
                              ? 'text-gray-700 hover:bg-gray-50'
                              : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          component.completed 
                            ? 'bg-green-100 text-green-700' 
                            : component.type === 'explicit'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {component.completed ? <Check className="w-2.5 h-2.5" /> : '•'}
                        </div>
                        <span>{component.title}</span>
                        {component.note && (
                          <span className="text-xs text-gray-400 ml-auto">{component.note}</span>
                        )}
                      </div>
                    ))}
                    
                    {/* Test Button */}
                    {stage.hasTestButton && (
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-center gap-2"
                          onClick={() => handleTestStage(stage.id)}
                          disabled={!progress.isComplete}
                        >
                          <TestTube className="w-3 h-3" />
                          {stage.testButtonText}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Stage {currentStage}: {stageData.find(s => s.id === currentStage)?.title}
          </h2>
          <p className="text-gray-600 mt-1">
            {stageData.find(s => s.id === currentStage)?.description}
          </p>
        </div>
        
        <div className="flex-1 p-6">
          <Card className="h-full p-6">
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Stage {currentStage} Content</h3>
                <p>Form and chat interface will be implemented in Phase 2</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Quick Navigation */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          onClick={() => window.open('/admin/dashboard', '_blank')}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin Dashboard
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
        <Button
          onClick={() => window.open('/', '_blank')}
          variant="outline"
          className="shadow-lg bg-white"
          size="sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Student Experience
        </Button>
      </div>
    </div>
  );
}