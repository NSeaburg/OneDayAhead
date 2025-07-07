import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, File, Edit, Save, Plus, X, FileText, User, Settings } from "lucide-react";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useToast } from "@/hooks/use-toast";

interface ContentPackage {
  id: string;
  name: string;
  description: string;
  district: string;
  course: string;
  topic: string;
  assessmentBot: BotConfig;
  teachingBots: {
    high: BotConfig;
    medium: BotConfig;
    low: BotConfig;
  };
}

interface BotConfig {
  name: string;
  description: string;
  avatar: string;
  role: string;
  personality: string;
  config: any;
  keywords?: any;
}

export default function ContentManagerScreen() {
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ContentPackage | null>(null);
  const [editingBot, setEditingBot] = useState<{ type: string; level?: string } | null>(null);
  const [editingPersonality, setEditingPersonality] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load content packages on mount
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch("/api/content/packages", {
        credentials: 'include'
      });
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error("Error loading packages:", error);
      toast({
        title: "Error",
        description: "Failed to load content packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBot = async (type: string, level?: string) => {
    if (!selectedPackage) return;
    
    try {
      const url = level 
        ? `/api/content/personality/${selectedPackage.district}/${selectedPackage.course}/${selectedPackage.topic}/${type}/${level}`
        : `/api/content/personality/${selectedPackage.district}/${selectedPackage.course}/${selectedPackage.topic}/${type}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      
      setEditingPersonality(data.personality || "");
      setEditingBot({ type, level });
    } catch (error) {
      console.error("Error loading personality:", error);
      toast({
        title: "Error",
        description: "Failed to load bot personality",
        variant: "destructive",
      });
    }
  };

  const handleSavePersonality = async () => {
    if (!selectedPackage || !editingBot) return;
    
    setSaving(true);
    try {
      const url = editingBot.level 
        ? `/api/content/personality/${selectedPackage.district}/${selectedPackage.course}/${selectedPackage.topic}/${editingBot.type}/${editingBot.level}`
        : `/api/content/personality/${selectedPackage.district}/${selectedPackage.course}/${selectedPackage.topic}/${editingBot.type}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ personality: editingPersonality }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save personality");
      }
      
      toast({
        title: "Success",
        description: "Bot personality saved successfully",
      });
      
      // Refresh the package data
      await loadPackages();
      const updatedPackage = packages.find(p => p.id === selectedPackage.id);
      if (updatedPackage) {
        setSelectedPackage(updatedPackage);
      }
      
      setEditingBot(null);
      setEditingPersonality("");
    } catch (error) {
      console.error("Error saving personality:", error);
      toast({
        title: "Error",
        description: "Failed to save bot personality",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderBotCard = (bot: BotConfig, type: string, level?: string) => {
    const isEditing = editingBot?.type === type && editingBot?.level === level;
    
    return (
      <Card key={`${type}-${level || ''}`} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <CardTitle className="text-lg">{bot.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {level ? `${level} level` : type}
              </Badge>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSavePersonality} 
                    disabled={saving}
                    size="sm"
                    className="h-8"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingBot(null);
                      setEditingPersonality("");
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => handleEditBot(type, level)}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardDescription>{bot.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                System Prompt (sent directly to Claude):
              </label>
              <AutoResizeTextarea
                value={editingPersonality}
                onChange={(e) => setEditingPersonality(e.target.value)}
                placeholder="Enter the system prompt for this bot..."
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                This text will be sent as the system prompt to Claude. Any changes here directly affect the bot's behavior.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-3 w-3" />
                <span>System prompt ({bot.personality.length} characters)</span>
              </div>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {bot.personality.substring(0, 200)}
                {bot.personality.length > 200 && "..."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Package Browser */}
          <div className="w-1/3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Content Packages
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
                <CardDescription>
                  Manage learning experiences and bot personalities
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                        selectedPackage?.id === pkg.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{pkg.name}</div>
                          <div className="text-xs text-gray-500">
                            {pkg.district} → {pkg.course}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {packages.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No content packages found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Package Editor */}
          <div className="flex-1">
            {selectedPackage ? (
              <div className="space-y-6">
                {/* Package Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {selectedPackage.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedPackage.district} → {selectedPackage.course} → {selectedPackage.topic}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Assessment Bot */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assessment Bot
                  </h3>
                  {renderBotCard(selectedPackage.assessmentBot, "assessment")}
                </div>

                {/* Teaching Bots */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Teaching Bots
                  </h3>
                  {renderBotCard(selectedPackage.teachingBots.high, "teaching", "high")}
                  {renderBotCard(selectedPackage.teachingBots.medium, "teaching", "medium")}
                  {renderBotCard(selectedPackage.teachingBots.low, "teaching", "low")}
                </div>
              </div>
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Select a Content Package</p>
                    <p className="text-sm">Choose a package from the sidebar to edit bot personalities</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}