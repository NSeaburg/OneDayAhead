import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Settings } from "lucide-react";
import { Link } from "wouter";

interface ContentPackage {
  id: string;
  name: string;
  description: string;
  district: string;
  course: string;
  topic: string;
}

interface DeploymentPageProps {
  onSelectExperience: (packageId: string) => void;
  onCreateNew: () => void;
}

export default function DeploymentPage({ onSelectExperience, onCreateNew }: DeploymentPageProps) {
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/content/packages');
      if (!response.ok) {
        throw new Error('Failed to load experiences');
      }
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExperience = () => {
    if (selectedPackage) {
      onSelectExperience(selectedPackage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gray-300 mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Experiences</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPackages}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Experience Deployment</h1>
            <p className="text-gray-600">Select an existing experience or create a new one</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Content Manager
            </Button>
          </Link>
        </div>

        {/* Experience Selection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Learning Experience</CardTitle>
            <CardDescription>
              Choose from available experiences to deploy to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Available Experiences</label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an experience..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-sm text-gray-500">
                            {pkg.district} • {pkg.course} • {pkg.topic}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPackage && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  {(() => {
                    const pkg = packages.find(p => p.id === selectedPackage);
                    return pkg ? (
                      <div>
                        <h3 className="font-medium text-blue-900 mb-1">{pkg.name}</h3>
                        <p className="text-blue-700 text-sm mb-3">{pkg.description}</p>
                        <Button onClick={handleStartExperience} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Start Experience
                        </Button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create New Experience Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Experience</CardTitle>
            <CardDescription>
              Build a new learning experience with custom assessment and teaching bots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onCreateNew} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Experience
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        {packages.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p>{packages.length} experience{packages.length !== 1 ? 's' : ''} available</p>
          </div>
        )}
      </div>
    </div>
  );
}