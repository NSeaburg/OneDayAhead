import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichInput } from "@/components/ui/rich-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextarea } from "@/components/ui/rich-textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Upload, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ListeningTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

interface FocusTopic {
  id: string;
  name: string;
  description: string;
}

interface ExperienceData {
  // Basic Info
  district: string;
  course: string;
  topic: string;
  name: string;
  description: string;
  
  // Assessment Bot
  assessmentName: string;
  assessmentDescription: string;
  assessmentPersonality: string;
  assessmentAvatar: File | null;
  assessmentCriteria: string;
  
  // Assessment Bot UI Config
  assessmentBotTitle: string;
  assessmentChatHeaderTitle: string;
  assessmentListeningTopics: ListeningTopic[];
  assessmentProgressTitle: string;
  assessmentProgressThreshold: number;
  assessmentKeepInMindTitle: string;
  assessmentKeepInMindDescription: string;
  assessmentInputPlaceholder: string;
  assessmentInitialGreeting: string;
  
  // Assessment Criteria
  highCriteria: string;
  mediumCriteria: string;
  lowCriteria: string;
  
  // Teaching Bots
  highBotName: string;
  highBotDescription: string;
  highBotPersonality: string;
  highBotAvatar: File | null;
  
  mediumBotName: string;
  mediumBotDescription: string;
  mediumBotPersonality: string;
  mediumBotAvatar: File | null;
  
  lowBotName: string;
  lowBotDescription: string;
  lowBotPersonality: string;
  lowBotAvatar: File | null;
  
  // Teaching Bot UI Config - High Level
  highBotTitle: string;
  highChatHeaderTitle: string;
  highTeachingApproachTitle: string;
  highTeachingApproachDescription: string;
  highFocusTopics: FocusTopic[];
  highChallengeTitle: string;
  highChallengeDescription: string;
  highInputPlaceholder: string;
  highInitialGreeting: string;
  
  // Teaching Bot UI Config - Medium Level
  mediumBotTitle: string;
  mediumChatHeaderTitle: string;
  mediumTeachingApproachTitle: string;
  mediumTeachingApproachDescription: string;
  mediumFocusTopics: FocusTopic[];
  mediumEncouragementTitle: string;
  mediumEncouragementDescription: string;
  mediumInputPlaceholder: string;
  mediumInitialGreeting: string;
  
  // Teaching Bot UI Config - Low Level
  lowBotTitle: string;
  lowChatHeaderTitle: string;
  lowTeachingApproachTitle: string;
  lowTeachingApproachDescription: string;
  lowFocusTopics: FocusTopic[];
  lowEncouragementTitle: string;
  lowEncouragementDescription: string;
  lowInputPlaceholder: string;
  lowInitialGreeting: string;
}

const STEPS = [
  { id: 1, title: "Basic Information", description: "Experience details and topic" },
  { id: 2, title: "Assessment Bot", description: "AI assistant for evaluation" },
  { id: 3, title: "Assessment Bot UI", description: "User interface configuration" },
  { id: 4, title: "Assessment Criteria", description: "How to evaluate student performance" },
  { id: 5, title: "Teaching Assistants", description: "Adaptive learning bots" },
  { id: 6, title: "Teaching Bot UI", description: "Interface for each teaching level" },
  { id: 7, title: "Review & Create", description: "Final review and creation" }
];

export default function AdminCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [experienceData, setExperienceData] = useState<ExperienceData>({
    district: "",
    course: "",
    topic: "",
    name: "",
    description: "",
    assessmentName: "",
    assessmentDescription: "",
    assessmentPersonality: "",
    assessmentAvatar: null,
    assessmentCriteria: "",
    // Assessment Bot UI Config
    assessmentBotTitle: "",
    assessmentChatHeaderTitle: "",
    assessmentListeningTopics: [],
    assessmentProgressTitle: "Assessment Progress",
    assessmentProgressThreshold: 8,
    assessmentKeepInMindTitle: "Keep in mind",
    assessmentKeepInMindDescription: "",
    assessmentInputPlaceholder: "Type your response here...",
    assessmentInitialGreeting: "",
    // Assessment Criteria
    highCriteria: "",
    mediumCriteria: "",
    lowCriteria: "",
    highBotName: "",
    highBotDescription: "",
    highBotPersonality: "",
    highBotAvatar: null,
    mediumBotName: "",
    mediumBotDescription: "",
    mediumBotPersonality: "",
    mediumBotAvatar: null,
    lowBotName: "",
    lowBotDescription: "",
    lowBotPersonality: "",
    lowBotAvatar: null,
    // Teaching Bot UI Config - High Level
    highBotTitle: "",
    highChatHeaderTitle: "",
    highTeachingApproachTitle: "Teaching Approach",
    highTeachingApproachDescription: "",
    highFocusTopics: [],
    highChallengeTitle: "",
    highChallengeDescription: "",
    highInputPlaceholder: "Type your message here...",
    highInitialGreeting: "",
    // Teaching Bot UI Config - Medium Level
    mediumBotTitle: "",
    mediumChatHeaderTitle: "",
    mediumTeachingApproachTitle: "Teaching Approach",
    mediumTeachingApproachDescription: "",
    mediumFocusTopics: [],
    mediumEncouragementTitle: "",
    mediumEncouragementDescription: "",
    mediumInputPlaceholder: "Type your message here...",
    mediumInitialGreeting: "",
    // Teaching Bot UI Config - Low Level
    lowBotTitle: "",
    lowChatHeaderTitle: "",
    lowTeachingApproachTitle: "Teaching Approach",
    lowTeachingApproachDescription: "",
    lowFocusTopics: [],
    lowEncouragementTitle: "",
    lowEncouragementDescription: "",
    lowInputPlaceholder: "Type your message here...",
    lowInitialGreeting: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    if (!sessionStorage.getItem("adminAuthenticated")) {
      setLocation("/admin");
      return;
    }
  }, [setLocation]);

  const updateField = (field: keyof ExperienceData, value: string | File | null) => {
    setExperienceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return experienceData.district && experienceData.course && experienceData.topic && experienceData.name;
      case 2:
        return experienceData.assessmentName && experienceData.assessmentPersonality;
      case 3:
        return experienceData.assessmentBotTitle && experienceData.assessmentChatHeaderTitle && 
               experienceData.assessmentListeningTopics.length > 0;
      case 4:
        return experienceData.highCriteria && experienceData.mediumCriteria && experienceData.lowCriteria;
      case 5:
        return experienceData.highBotPersonality && experienceData.mediumBotPersonality && experienceData.lowBotPersonality;
      case 6:
        return experienceData.highBotTitle && experienceData.mediumBotTitle && experienceData.lowBotTitle;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateExperience = async () => {
    setSaving(true);
    
    try {
      const response = await fetch("/api/content/create-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(experienceData),
      });

      if (!response.ok) {
        throw new Error("Failed to create experience");
      }

      toast({
        title: "Success!",
        description: "Learning experience created successfully",
      });
      
      setLocation("/admin/dashboard");
    } catch (error) {
      console.error("Error creating experience:", error);
      toast({
        title: "Error",
        description: "Failed to create learning experience",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <RichInput
                  id="district"
                  value={experienceData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="e.g., Demo District"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <RichInput
                  id="course"
                  value={experienceData.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  placeholder="e.g., American History"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <RichInput
                  id="topic"
                  value={experienceData.topic}
                  onChange={(e) => updateField("topic", e.target.value)}
                  placeholder="e.g., civil-war"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Experience Name</Label>
              <RichInput
                id="name"
                value={experienceData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., The American Civil War"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextarea
                id="description"
                value={experienceData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Brief description of what students will learn..."
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assessmentName">Assessment Bot Name</Label>
                <RichInput
                  id="assessmentName"
                  value={experienceData.assessmentName}
                  onChange={(e) => updateField("assessmentName", e.target.value)}
                  placeholder="e.g., Nancy Know-It-All"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentDescription">Bot Description</Label>
                <RichTextarea
                  id="assessmentDescription"
                  value={experienceData.assessmentDescription}
                  onChange={(e) => updateField("assessmentDescription", e.target.value)}
                  placeholder="Detailed character description that appears under the bot title (like Reggie's aristocrat description). Describe the bot's personality, background, and what makes them unique..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  This appears as a paragraph under the bot title. Make it engaging and descriptive!
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentAvatar">Assessment Bot Avatar</Label>
              <div className="flex items-center gap-4">
                <RichInput
                  id="assessmentAvatar"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => updateField("assessmentAvatar", e.target.files?.[0] || null)}
                  className="cursor-pointer hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('assessmentAvatar')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                {experienceData.assessmentAvatar && (
                  <span className="text-sm text-green-600">
                    ✓ {experienceData.assessmentAvatar.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Upload a PNG or JPEG image. It will be automatically cropped to a circle.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentCriteria">Assessment Criteria Display</Label>
              <RichTextarea
                id="assessmentCriteria"
                value={experienceData.assessmentCriteria}
                onChange={(e) => updateField("assessmentCriteria", e.target.value)}
                placeholder="Text that appears next to the chat showing what the bot is listening for..."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                This text appears in the left panel (like Reggie's criteria) to show students what the bot is evaluating.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentPersonality">Assessment Bot System Prompt</Label>
              <RichTextarea
                id="assessmentPersonality"
                value={experienceData.assessmentPersonality}
                onChange={(e) => updateField("assessmentPersonality", e.target.value)}
                placeholder="Enter the system prompt that defines the assessment bot's personality and behavior..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                This prompt will be sent directly to Claude to define how the assessment bot behaves with students.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Assessment Bot User Interface</h3>
              <p className="text-gray-600">Configure how the assessment bot appears to students</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assessmentBotTitle">Bot Title</Label>
                <RichInput
                  id="assessmentBotTitle"
                  value={experienceData.assessmentBotTitle}
                  onChange={(e) => updateField("assessmentBotTitle", e.target.value)}
                  placeholder="e.g., Aristocratic Observer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentChatHeaderTitle">Chat Header Title</Label>
                <RichInput
                  id="assessmentChatHeaderTitle"
                  value={experienceData.assessmentChatHeaderTitle}
                  onChange={(e) => updateField("assessmentChatHeaderTitle", e.target.value)}
                  placeholder="e.g., Assessment: American Civil War"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentInitialGreeting">Initial Greeting</Label>
              <RichTextarea
                id="assessmentInitialGreeting"
                value={experienceData.assessmentInitialGreeting}
                onChange={(e) => updateField("assessmentInitialGreeting", e.target.value)}
                placeholder="The first message the bot sends to students..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentInputPlaceholder">Input Placeholder</Label>
              <RichInput
                id="assessmentInputPlaceholder"
                value={experienceData.assessmentInputPlaceholder}
                onChange={(e) => updateField("assessmentInputPlaceholder", e.target.value)}
                placeholder="e.g., Type your response here..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Listening Topics</Label>
              <p className="text-sm text-gray-600">Add topics the bot is evaluating (shown in the UI)</p>
              <AssessmentTopicManager
                topics={experienceData.assessmentListeningTopics}
                onChange={(topics) => updateField("assessmentListeningTopics", topics)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assessmentKeepInMindTitle">Keep in Mind Section Title</Label>
                <RichInput
                  id="assessmentKeepInMindTitle"
                  value={experienceData.assessmentKeepInMindTitle}
                  onChange={(e) => updateField("assessmentKeepInMindTitle", e.target.value)}
                  placeholder="e.g., Keep in mind"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentKeepInMindDescription">Keep in Mind Description</Label>
                <RichInput
                  id="assessmentKeepInMindDescription"
                  value={experienceData.assessmentKeepInMindDescription}
                  onChange={(e) => updateField("assessmentKeepInMindDescription", e.target.value)}
                  placeholder="Brief reminder for students"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Assessment Evaluation Criteria</h3>
              <p className="text-gray-600">Define how Claude should evaluate student performance and route them to appropriate teaching assistants.</p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">High Performance Criteria</CardTitle>
                  <CardDescription>What indicates a student has strong understanding?</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextarea
                    value={experienceData.highCriteria}
                    onChange={(e) => updateField("highCriteria", e.target.value)}
                    placeholder="Students who demonstrate high performance will show..."
                    rows={4}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-700">Medium Performance Criteria</CardTitle>
                  <CardDescription>What indicates basic understanding with some gaps?</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextarea
                    value={experienceData.mediumCriteria}
                    onChange={(e) => updateField("mediumCriteria", e.target.value)}
                    placeholder="Students who demonstrate medium performance will show..."
                    rows={4}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Low Performance Criteria</CardTitle>
                  <CardDescription>What indicates students need foundational support?</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextarea
                    value={experienceData.lowCriteria}
                    onChange={(e) => updateField("lowCriteria", e.target.value)}
                    placeholder="Students who demonstrate low performance will show..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            {/* High Level Bot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">High Level Teaching Assistant</CardTitle>
                <CardDescription>For students who demonstrate strong understanding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Name</Label>
                    <RichInput
                      value={experienceData.highBotName}
                      onChange={(e) => updateField("highBotName", e.target.value)}
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <RichInput
                      value={experienceData.highBotDescription}
                      onChange={(e) => updateField("highBotDescription", e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <RichInput
                      id="highBotAvatar"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => updateField("highBotAvatar", e.target.files?.[0] || null)}
                      className="cursor-pointer hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('highBotAvatar')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {experienceData.highBotAvatar && (
                      <span className="text-sm text-green-600">
                        ✓ {experienceData.highBotAvatar.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <RichTextarea
                    value={experienceData.highBotPersonality}
                    onChange={(e) => updateField("highBotPersonality", e.target.value)}
                    placeholder="System prompt for advanced students..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medium Level Bot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medium Level Teaching Assistant</CardTitle>
                <CardDescription>For students who show basic understanding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Name</Label>
                    <RichInput
                      value={experienceData.mediumBotName}
                      onChange={(e) => updateField("mediumBotName", e.target.value)}
                      placeholder="e.g., Ms. Johnson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <RichInput
                      value={experienceData.mediumBotDescription}
                      onChange={(e) => updateField("mediumBotDescription", e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <RichInput
                      id="mediumBotAvatar"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => updateField("mediumBotAvatar", e.target.files?.[0] || null)}
                      className="cursor-pointer hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('mediumBotAvatar')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {experienceData.mediumBotAvatar && (
                      <span className="text-sm text-green-600">
                        ✓ {experienceData.mediumBotAvatar.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <RichTextarea
                    value={experienceData.mediumBotPersonality}
                    onChange={(e) => updateField("mediumBotPersonality", e.target.value)}
                    placeholder="System prompt for medium level students..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Low Level Bot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Low Level Teaching Assistant</CardTitle>
                <CardDescription>For students who need additional support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Name</Label>
                    <RichInput
                      value={experienceData.lowBotName}
                      onChange={(e) => updateField("lowBotName", e.target.value)}
                      placeholder="e.g., Mr. Wilson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <RichInput
                      value={experienceData.lowBotDescription}
                      onChange={(e) => updateField("lowBotDescription", e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <RichInput
                      id="lowBotAvatar"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => updateField("lowBotAvatar", e.target.files?.[0] || null)}
                      className="cursor-pointer hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('lowBotAvatar')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {experienceData.lowBotAvatar && (
                      <span className="text-sm text-green-600">
                        ✓ {experienceData.lowBotAvatar.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <RichTextarea
                    value={experienceData.lowBotPersonality}
                    onChange={(e) => updateField("lowBotPersonality", e.target.value)}
                    placeholder="System prompt for students needing support..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Teaching Bot User Interface</h3>
              <p className="text-gray-600">Configure how each teaching bot appears to students</p>
            </div>
            
            {/* High Level UI Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">High Level Bot Interface</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Title</Label>
                    <RichInput
                      value={experienceData.highBotTitle}
                      onChange={(e) => updateField("highBotTitle", e.target.value)}
                      placeholder="e.g., Expert Analysis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Header</Label>
                    <RichInput
                      value={experienceData.highChatHeaderTitle}
                      onChange={(e) => updateField("highChatHeaderTitle", e.target.value)}
                      placeholder="e.g., Advanced Instruction"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teaching Approach Description</Label>
                  <RichTextarea
                    value={experienceData.highTeachingApproachDescription}
                    onChange={(e) => updateField("highTeachingApproachDescription", e.target.value)}
                    placeholder="Describe the teaching approach..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Areas</Label>
                  <FocusTopicManager
                    topics={experienceData.highFocusTopics}
                    onChange={(topics) => updateField("highFocusTopics", topics)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Challenge Title</Label>
                    <RichInput
                      value={experienceData.highChallengeTitle}
                      onChange={(e) => updateField("highChallengeTitle", e.target.value)}
                      placeholder="e.g., Ready for a challenge?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Challenge Description</Label>
                    <RichInput
                      value={experienceData.highChallengeDescription}
                      onChange={(e) => updateField("highChallengeDescription", e.target.value)}
                      placeholder="Challenge message..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Initial Greeting</Label>
                  <RichTextarea
                    value={experienceData.highInitialGreeting}
                    onChange={(e) => updateField("highInitialGreeting", e.target.value)}
                    placeholder="First message to students..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Medium Level UI Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-700">Medium Level Bot Interface</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Title</Label>
                    <RichInput
                      value={experienceData.mediumBotTitle}
                      onChange={(e) => updateField("mediumBotTitle", e.target.value)}
                      placeholder="e.g., Guided Learning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Header</Label>
                    <RichInput
                      value={experienceData.mediumChatHeaderTitle}
                      onChange={(e) => updateField("mediumChatHeaderTitle", e.target.value)}
                      placeholder="e.g., Focused Instruction"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teaching Approach Description</Label>
                  <RichTextarea
                    value={experienceData.mediumTeachingApproachDescription}
                    onChange={(e) => updateField("mediumTeachingApproachDescription", e.target.value)}
                    placeholder="Describe the teaching approach..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Areas</Label>
                  <FocusTopicManager
                    topics={experienceData.mediumFocusTopics}
                    onChange={(topics) => updateField("mediumFocusTopics", topics)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Encouragement Title</Label>
                    <RichInput
                      value={experienceData.mediumEncouragementTitle}
                      onChange={(e) => updateField("mediumEncouragementTitle", e.target.value)}
                      placeholder="e.g., You're doing great!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Encouragement Description</Label>
                    <RichInput
                      value={experienceData.mediumEncouragementDescription}
                      onChange={(e) => updateField("mediumEncouragementDescription", e.target.value)}
                      placeholder="Encouragement message..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Initial Greeting</Label>
                  <RichTextarea
                    value={experienceData.mediumInitialGreeting}
                    onChange={(e) => updateField("mediumInitialGreeting", e.target.value)}
                    placeholder="First message to students..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Low Level UI Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Low Level Bot Interface</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot Title</Label>
                    <RichInput
                      value={experienceData.lowBotTitle}
                      onChange={(e) => updateField("lowBotTitle", e.target.value)}
                      placeholder="e.g., Foundation Builder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Header</Label>
                    <RichInput
                      value={experienceData.lowChatHeaderTitle}
                      onChange={(e) => updateField("lowChatHeaderTitle", e.target.value)}
                      placeholder="e.g., Building Understanding"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teaching Approach Description</Label>
                  <RichTextarea
                    value={experienceData.lowTeachingApproachDescription}
                    onChange={(e) => updateField("lowTeachingApproachDescription", e.target.value)}
                    placeholder="Describe the teaching approach..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Areas</Label>
                  <FocusTopicManager
                    topics={experienceData.lowFocusTopics}
                    onChange={(topics) => updateField("lowFocusTopics", topics)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Encouragement Title</Label>
                    <RichInput
                      value={experienceData.lowEncouragementTitle}
                      onChange={(e) => updateField("lowEncouragementTitle", e.target.value)}
                      placeholder="e.g., Keep learning!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Encouragement Description</Label>
                    <RichInput
                      value={experienceData.lowEncouragementDescription}
                      onChange={(e) => updateField("lowEncouragementDescription", e.target.value)}
                      placeholder="Encouragement message..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Initial Greeting</Label>
                  <RichTextarea
                    value={experienceData.lowInitialGreeting}
                    onChange={(e) => updateField("lowInitialGreeting", e.target.value)}
                    placeholder="First message to students..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Ready to Create</h3>
              </div>
              <p className="text-green-800">
                Your learning experience is ready to be created. This will generate all the necessary files
                and make the experience available to students immediately.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Experience Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {experienceData.name}</div>
                  <div><strong>Topic:</strong> {experienceData.topic}</div>
                  <div><strong>District:</strong> {experienceData.district}</div>
                  <div><strong>Course:</strong> {experienceData.course}</div>
                </div>
                <div className="text-sm">
                  <strong>Description:</strong> {experienceData.description}
                </div>
                <div className="text-sm">
                  <strong>Assessment Bot:</strong> {experienceData.assessmentName}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><strong>High Level:</strong> {experienceData.highBotName}</div>
                  <div><strong>Medium Level:</strong> {experienceData.mediumBotName}</div>
                  <div><strong>Low Level:</strong> {experienceData.lowBotName}</div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Once created, this experience will be immediately available to students.
                You can always edit the bot personalities later from the admin dashboard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation("/admin/dashboard")}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold">Create Learning Experience</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Step {currentStep}: {STEPS[currentStep - 1].title}</CardTitle>
                  <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                </div>
                <div className="text-sm text-gray-500">
                  {currentStep} of {STEPS.length}
                </div>
              </div>
              <Progress value={(currentStep / STEPS.length) * 100} className="mt-4" />
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              {renderStepContent()}
            </CardContent>
            <div className="px-6 pb-6 pt-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex justify-between">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep === 7 ? (
                  <Button
                    onClick={handleCreateExperience}
                    disabled={saving || !canProceed()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Experience
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component for managing assessment listening topics
function AssessmentTopicManager({ topics, onChange }: { topics: ListeningTopic[], onChange: (topics: ListeningTopic[]) => void }) {
  const addTopic = () => {
    const newTopic: ListeningTopic = {
      id: Date.now().toString(),
      name: "",
      description: "",
      keywords: []
    };
    onChange([...topics, newTopic]);
  };

  const updateTopic = (id: string, field: keyof ListeningTopic, value: any) => {
    onChange(topics.map(topic => 
      topic.id === id ? { ...topic, [field]: value } : topic
    ));
  };

  const removeTopic = (id: string) => {
    onChange(topics.filter(topic => topic.id !== id));
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <RichInput
                  placeholder="Topic name (e.g., Executive Branch)"
                  value={topic.name}
                  onChange={(e) => updateTopic(topic.id, 'name', e.target.value)}
                />
                <RichInput
                  placeholder="Description"
                  value={topic.description}
                  onChange={(e) => updateTopic(topic.id, 'description', e.target.value)}
                />
                <RichInput
                  placeholder="Keywords (comma-separated)"
                  value={topic.keywords.join(', ')}
                  onChange={(e) => updateTopic(topic.id, 'keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTopic(topic.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addTopic}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Topic
      </Button>
    </div>
  );
}

// Component for managing teaching focus topics
function FocusTopicManager({ topics, onChange }: { topics: FocusTopic[], onChange: (topics: FocusTopic[]) => void }) {
  const addTopic = () => {
    const newTopic: FocusTopic = {
      id: Date.now().toString(),
      name: "",
      description: ""
    };
    onChange([...topics, newTopic]);
  };

  const updateTopic = (id: string, field: keyof FocusTopic, value: string) => {
    onChange(topics.map(topic => 
      topic.id === id ? { ...topic, [field]: value } : topic
    ));
  };

  const removeTopic = (id: string) => {
    onChange(topics.filter(topic => topic.id !== id));
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <RichInput
                  placeholder="Focus area (e.g., Checks and Balances)"
                  value={topic.name}
                  onChange={(e) => updateTopic(topic.id, 'name', e.target.value)}
                />
                <RichInput
                  placeholder="Description of this focus area"
                  value={topic.description}
                  onChange={(e) => updateTopic(topic.id, 'description', e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTopic(topic.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addTopic}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Focus Area
      </Button>
    </div>
  );
}