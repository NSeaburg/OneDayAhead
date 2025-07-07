import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExperienceCreatorProps {
  onBack: () => void;
  onSave: (experienceData: any) => void;
}

interface AssessmentBot {
  name: string;
  systemPrompt: string;
  onPageText: string;
  initialMessage: string;
  avatar: File | null;
  keywords: string[];
}

interface RoutingCriteria {
  lowThreshold: number;
  mediumThreshold: number;
  evaluationCriteria: string[];
}

interface TeachingBot {
  name: string;
  characterDescription: string;
  systemPrompt: string;
  avatar: File | null;
}

interface ExperienceData {
  name: string;
  description: string;
  district: string;
  course: string;
  topic: string;
  assessmentBot: AssessmentBot;
  routingCriteria: RoutingCriteria;
  teachingBots: {
    low: TeachingBot;
    medium: TeachingBot;
    high: TeachingBot;
  };
  notes: string;
}

export default function ExperienceCreator({ onBack, onSave }: ExperienceCreatorProps) {
  const { toast } = useToast();
  
  const [experienceData, setExperienceData] = useState<ExperienceData>({
    name: "",
    description: "",
    district: "",
    course: "",
    topic: "",
    assessmentBot: {
      name: "",
      systemPrompt: "",
      onPageText: "",
      initialMessage: "",
      avatar: null,
      keywords: []
    },
    routingCriteria: {
      lowThreshold: 40,
      mediumThreshold: 70,
      evaluationCriteria: []
    },
    teachingBots: {
      low: {
        name: "",
        characterDescription: "",
        systemPrompt: "",
        avatar: null
      },
      medium: {
        name: "",
        characterDescription: "",
        systemPrompt: "",
        avatar: null
      },
      high: {
        name: "",
        characterDescription: "",
        systemPrompt: "",
        avatar: null
      }
    },
    notes: ""
  });

  const [currentKeyword, setCurrentKeyword] = useState("");
  const [currentCriterion, setCurrentCriterion] = useState("");

  const updateExperience = (path: string, value: any) => {
    setExperienceData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addKeyword = () => {
    if (currentKeyword.trim()) {
      const newKeywords = [...experienceData.assessmentBot.keywords, currentKeyword.trim()];
      updateExperience('assessmentBot.keywords', newKeywords);
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = experienceData.assessmentBot.keywords.filter((_, i) => i !== index);
    updateExperience('assessmentBot.keywords', newKeywords);
  };

  const addCriterion = () => {
    if (currentCriterion.trim()) {
      const newCriteria = [...experienceData.routingCriteria.evaluationCriteria, currentCriterion.trim()];
      updateExperience('routingCriteria.evaluationCriteria', newCriteria);
      setCurrentCriterion("");
    }
  };

  const removeCriterion = (index: number) => {
    const newCriteria = experienceData.routingCriteria.evaluationCriteria.filter((_, i) => i !== index);
    updateExperience('routingCriteria.evaluationCriteria', newCriteria);
  };

  const handleFileUpload = (path: string, file: File | null) => {
    updateExperience(path, file);
  };

  const handleSave = async () => {
    // Basic validation
    if (!experienceData.name || !experienceData.district || !experienceData.course || !experienceData.topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (name, district, course, topic)",
        variant: "destructive"
      });
      return;
    }

    if (!experienceData.assessmentBot.name || !experienceData.assessmentBot.systemPrompt) {
      toast({
        title: "Assessment Bot Incomplete",
        description: "Please provide assessment bot name and system prompt",
        variant: "destructive"
      });
      return;
    }

    try {
      onSave(experienceData);
      toast({
        title: "Experience Saved",
        description: "Your learning experience has been created successfully!"
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the experience. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Learning Experience</h1>
            <p className="text-gray-600">Configure assessment bot, routing criteria, and teaching assistants</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Information</CardTitle>
              <CardDescription>Basic details about this learning experience</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Experience Name *</Label>
                <Input
                  id="name"
                  value={experienceData.name}
                  onChange={(e) => updateExperience('name', e.target.value)}
                  placeholder="e.g., Three Branches of Government"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={experienceData.description}
                  onChange={(e) => updateExperience('description', e.target.value)}
                  placeholder="Brief description of what students will learn"
                />
              </div>
              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={experienceData.district}
                  onChange={(e) => updateExperience('district', e.target.value)}
                  placeholder="e.g., demo-district"
                />
              </div>
              <div>
                <Label htmlFor="course">Course *</Label>
                <Input
                  id="course"
                  value={experienceData.course}
                  onChange={(e) => updateExperience('course', e.target.value)}
                  placeholder="e.g., civics-government"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={experienceData.topic}
                  onChange={(e) => updateExperience('topic', e.target.value)}
                  placeholder="e.g., three-branches"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assessment Bot Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Bot Configuration</CardTitle>
              <CardDescription>Configure the bot that will assess student understanding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessment-name">Bot Name *</Label>
                  <Input
                    id="assessment-name"
                    value={experienceData.assessmentBot.name}
                    onChange={(e) => updateExperience('assessmentBot.name', e.target.value)}
                    placeholder="e.g., Reginald Worthington III"
                  />
                </div>
                <div>
                  <Label htmlFor="assessment-avatar">Avatar Image</Label>
                  <Input
                    id="assessment-avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('assessmentBot.avatar', e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="assessment-prompt">System Prompt *</Label>
                <Textarea
                  id="assessment-prompt"
                  value={experienceData.assessmentBot.systemPrompt}
                  onChange={(e) => updateExperience('assessmentBot.systemPrompt', e.target.value)}
                  placeholder="Define the bot's personality, goals, boundaries, and assessment approach..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="on-page-text">On-Page Character Description</Label>
                <Textarea
                  id="on-page-text"
                  value={experienceData.assessmentBot.onPageText}
                  onChange={(e) => updateExperience('assessmentBot.onPageText', e.target.value)}
                  placeholder="Text that appears on the page describing who this character is..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="initial-message">Initial Message</Label>
                <Textarea
                  id="initial-message"
                  value={experienceData.assessmentBot.initialMessage}
                  onChange={(e) => updateExperience('assessmentBot.initialMessage', e.target.value)}
                  placeholder="The first message the bot will send to students..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    placeholder="Add a keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button onClick={addKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {experienceData.assessmentBot.keywords.map((keyword, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {keyword}
                      <button onClick={() => removeKeyword(index)} className="text-blue-600 hover:text-blue-800">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Routing Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Student Routing Criteria</CardTitle>
              <CardDescription>Define how students are routed to different teaching assistants based on assessment performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="low-threshold">Low Level Threshold (0-100)</Label>
                  <Input
                    id="low-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={experienceData.routingCriteria.lowThreshold}
                    onChange={(e) => updateExperience('routingCriteria.lowThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Students scoring below this get low-level support</p>
                </div>
                <div>
                  <Label htmlFor="medium-threshold">Medium Level Threshold (0-100)</Label>
                  <Input
                    id="medium-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={experienceData.routingCriteria.mediumThreshold}
                    onChange={(e) => updateExperience('routingCriteria.mediumThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Students scoring below this get medium-level support</p>
                </div>
              </div>

              <div>
                <Label>Evaluation Criteria</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentCriterion}
                    onChange={(e) => setCurrentCriterion(e.target.value)}
                    placeholder="Add evaluation criterion..."
                    onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                  />
                  <Button onClick={addCriterion}>Add</Button>
                </div>
                <div className="space-y-2">
                  {experienceData.routingCriteria.evaluationCriteria.map((criterion, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                      <span>{criterion}</span>
                      <button onClick={() => removeCriterion(index)} className="text-red-600 hover:text-red-800">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Bots */}
          {(['low', 'medium', 'high'] as const).map((level) => (
            <Card key={level}>
              <CardHeader>
                <CardTitle className="capitalize">{level} Level Teaching Assistant</CardTitle>
                <CardDescription>Configure the teaching bot for {level}-performing students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${level}-name`}>Bot Name</Label>
                    <Input
                      id={`${level}-name`}
                      value={experienceData.teachingBots[level].name}
                      onChange={(e) => updateExperience(`teachingBots.${level}.name`, e.target.value)}
                      placeholder={`e.g., ${level === 'low' ? 'Mr. Whitaker' : level === 'medium' ? 'Mrs. Bannerman' : 'Mrs. Parton'}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${level}-avatar`}>Avatar Image</Label>
                    <Input
                      id={`${level}-avatar`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(`teachingBots.${level}.avatar`, e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`${level}-description`}>Character Description</Label>
                  <Textarea
                    id={`${level}-description`}
                    value={experienceData.teachingBots[level].characterDescription}
                    onChange={(e) => updateExperience(`teachingBots.${level}.characterDescription`, e.target.value)}
                    placeholder="Text that appears on the page describing who this character is..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor={`${level}-prompt`}>System Prompt</Label>
                  <Textarea
                    id={`${level}-prompt`}
                    value={experienceData.teachingBots[level].systemPrompt}
                    onChange={(e) => updateExperience(`teachingBots.${level}.systemPrompt`, e.target.value)}
                    placeholder="Define the bot's teaching approach, personality, and specific activities for this level..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional notes for this experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={experienceData.notes}
                onChange={(e) => updateExperience('notes', e.target.value)}
                placeholder="Any additional notes, reminders, or implementation details..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onBack}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Experience
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}