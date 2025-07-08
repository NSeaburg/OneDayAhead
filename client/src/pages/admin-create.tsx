import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, MessageCircle, Save, CheckCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStreamingChat } from "@/hooks/useStreamingChat";

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
}

const STEPS = [
  { id: 1, title: "Basic Information", description: "Experience details and topic" },
  { id: 2, title: "Assessment Bot", description: "AI assistant for evaluation" },
  { id: 3, title: "Assessment Criteria", description: "How to evaluate student performance" },
  { id: 4, title: "Teaching Assistants", description: "Adaptive learning bots" },
  { id: 5, title: "Review & Create", description: "Final review and creation" }
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
    lowBotAvatar: null
  });
  
  const [saving, setSaving] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // AI Chat for content creation assistance
  const {
    messages,
    sendMessage,
    isStreaming,
    clearHistory
  } = useStreamingChat("content-creation");

  useEffect(() => {
    // Check authentication
    if (!sessionStorage.getItem("adminAuthenticated")) {
      setLocation("/admin");
      return;
    }

    // Initialize AI assistant
    if (messages.length === 0) {
      sendMessage(`Hello! I'm your Content Creation Assistant. I'm here to help you design effective learning experiences for students.

I understand you're building a learning platform where:
- Students engage in assessment conversations with character AI bots
- Based on their performance level, they're routed to appropriate teaching assistants
- Each assistant provides differentiated instruction based on assessment results

I can help you craft:
- Compelling character personalities for assessment bots
- Clear assessment criteria that reveal student understanding
- Teaching assistant personalities for different performance levels
- System prompts that create engaging, educational conversations
- Evaluation rubrics that guide student routing

What learning experience would you like to create? Tell me about your subject, grade level, and what you want students to learn.`);
    }
  }, [setLocation, messages.length, sendMessage]);

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
        return experienceData.highCriteria && experienceData.mediumCriteria && experienceData.lowCriteria;
      case 4:
        return experienceData.highBotPersonality && experienceData.mediumBotPersonality && experienceData.lowBotPersonality;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
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
                <Input
                  id="district"
                  value={experienceData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="e.g., Demo District"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={experienceData.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  placeholder="e.g., American History"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={experienceData.topic}
                  onChange={(e) => updateField("topic", e.target.value)}
                  placeholder="e.g., civil-war"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Experience Name</Label>
              <Input
                id="name"
                value={experienceData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., The American Civil War"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
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
                <Input
                  id="assessmentName"
                  value={experienceData.assessmentName}
                  onChange={(e) => updateField("assessmentName", e.target.value)}
                  placeholder="e.g., Nancy Know-It-All"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentDescription">Description</Label>
                <Input
                  id="assessmentDescription"
                  value={experienceData.assessmentDescription}
                  onChange={(e) => updateField("assessmentDescription", e.target.value)}
                  placeholder="Brief description of the assessment bot"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentAvatar">Assessment Bot Avatar</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="assessmentAvatar"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => updateField("assessmentAvatar", e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Upload a PNG or JPEG image. It will be automatically cropped to a circle.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assessmentCriteria">Assessment Criteria Display</Label>
              <Textarea
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
              <Textarea
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
                  <Textarea
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
                  <Textarea
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
                  <Textarea
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

      case 4:
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
                    <Input
                      value={experienceData.highBotName}
                      onChange={(e) => updateField("highBotName", e.target.value)}
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={experienceData.highBotDescription}
                      onChange={(e) => updateField("highBotDescription", e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => updateField("highBotAvatar", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
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
                    <Input
                      value={experienceData.mediumBotName}
                      onChange={(e) => updateField("mediumBotName", e.target.value)}
                      placeholder="e.g., Ms. Johnson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={experienceData.mediumBotDescription}
                      onChange={(e) => updateField("mediumBotDescription", e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => updateField("mediumBotAvatar", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
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
                    <Input
                      value={experienceData.lowBotName}
                      onChange={(e) => updateField("lowBotName", e.target.value)}
                      placeholder="e.g., Mr. Wilson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={experienceData.lowBotDescription}
                      onChange={(e) => updateField("lowBotDescription", e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => updateField("lowBotAvatar", e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
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

      case 5:
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
                  <strong>Article Title:</strong> {experienceData.articleTitle}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Assistant - Left Side */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Content Creation Assistant
                </CardTitle>
                <CardDescription>
                  Chat with AI to refine your learning experience design
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border text-gray-900'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-white border p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask for help with your learning experience..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const message = e.currentTarget.value.trim();
                        if (message) {
                          sendMessage(message);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="Ask for help"]') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        sendMessage(input.value.trim());
                        input.value = '';
                      }
                    }}
                    disabled={isStreaming}
                    size="sm"
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Content - Right Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
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
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === 5 ? (
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
        </div>
      </div>
    </div>
  );
}