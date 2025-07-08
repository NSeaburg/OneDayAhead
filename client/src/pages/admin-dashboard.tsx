import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, Plus, Settings, Users, BookOpen, LogOut, Edit, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentPackage {
  id: string;
  name: string;
  description: string;
  district: string;
  course: string;
  topic: string;
  assessmentBot: any;
  teachingBots: any;
}

export default function AdminDashboard() {
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    if (!sessionStorage.getItem("adminAuthenticated")) {
      setLocation("/admin");
      return;
    }
    
    loadPackages();
  }, [setLocation]);

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

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    setLocation("/admin");
  };

  const handleCreateNew = () => {
    setLocation("/admin/create");
  };

  const handleEditPackage = (pkg: ContentPackage) => {
    setLocation(`/admin/edit/${pkg.district}/${pkg.course}/${pkg.topic}`);
  };

  const handleLaunchPackage = (pkg: ContentPackage) => {
    // Open learning experience in new tab for testing
    const testUrl = `/?experience=${pkg.district}/${pkg.course}/${pkg.topic}`;
    window.open(testUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-sm text-gray-600">Create and manage learning experiences</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
                  <p className="text-sm text-gray-600">Learning Experiences</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{packages.length * 4}</p>
                  <p className="text-sm text-gray-600">AI Assistants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Folder className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{new Set(packages.map(p => p.district)).size}</p>
                  <p className="text-sm text-gray-600">Districts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Button */}
        <div className="mb-6">
          <Button onClick={handleCreateNew} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Create New Learning Experience
          </Button>
        </div>

        {/* Experiences List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Existing Learning Experiences</h2>
          
          {packages.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Learning Experiences Yet</h3>
                <p className="text-gray-600 mb-6">Create your first learning experience to get started</p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Experience
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {pkg.description}
                        </CardDescription>
                      </div>

                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{pkg.district}</Badge>
                        <Badge variant="outline">{pkg.course}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Topic:</strong> {pkg.topic}</p>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Button 
                          onClick={() => handleLaunchPackage(pkg)}
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Launch
                        </Button>
                        <Button 
                          onClick={() => handleEditPackage(pkg)}
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}