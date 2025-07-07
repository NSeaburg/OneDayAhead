import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, GraduationCap, ChevronRight } from "lucide-react";

interface ContentPackage {
  id: string;
  name: string;
  description: string;
  district: string;
  course: string;
  topic: string;
}

interface TeacherSelectionScreenProps {
  onNext: (selectedPackage: ContentPackage) => void;
  onPrevious?: () => void;
}

export default function TeacherSelectionScreen({ onNext, onPrevious }: TeacherSelectionScreenProps) {
  const [contentPackages, setContentPackages] = useState<ContentPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchContentPackages = async () => {
      try {
        const response = await fetch('/api/content/packages', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch content packages');
        }
        const data = await response.json();
        setContentPackages(data.packages || []);
        
        // Auto-select first package if only one is available
        if (data.packages && data.packages.length === 1) {
          setSelectedPackageId(data.packages[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content packages');
      } finally {
        setLoading(false);
      }
    };

    fetchContentPackages();
  }, []);

  const handleNext = () => {
    const selectedPackage = contentPackages.find(pkg => pkg.id === selectedPackageId);
    if (selectedPackage) {
      onNext(selectedPackage);
    }
  };

  const selectedPackage = contentPackages.find(pkg => pkg.id === selectedPackageId);

  if (loading) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-8">
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
      <div className="flex flex-col h-full justify-center items-center p-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Learning Module</h1>
          <p className="text-gray-600">Choose the content package for your students' learning experience</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Content Package Selection</CardTitle>
              <CardDescription className="text-lg">
                Select the learning module that best fits your curriculum needs
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Package Selection */}
              <div className="space-y-2">
                <label htmlFor="package-select" className="text-sm font-medium text-gray-700">
                  Available Learning Modules
                </label>
                <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                  <SelectTrigger id="package-select" className="w-full">
                    <SelectValue placeholder="Choose a learning module..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contentPackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{pkg.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Package Details */}
              {selectedPackage && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-blue-900">{selectedPackage.name}</h3>
                      <p className="text-blue-700">{selectedPackage.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 uppercase tracking-wide">District</p>
                            <p className="font-medium text-blue-900">{selectedPackage.district}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 uppercase tracking-wide">Course</p>
                            <p className="font-medium text-blue-900">{selectedPackage.course}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 uppercase tracking-wide">Topic</p>
                            <p className="font-medium text-blue-900">{selectedPackage.topic}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                {onPrevious && (
                  <Button variant="outline" onClick={onPrevious}>
                    Previous
                  </Button>
                )}
                
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedPackageId}
                  className="ml-auto flex items-center space-x-2"
                >
                  <span>Start Learning Experience</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}