import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface Avatar {
  id: string;
  imageUrl: string;
  description: string;
}

interface AvatarSelectionProps {
  prompt: string;
  onSelect: (imageUrl: string) => void;
  onCancel: () => void;
}

export function AvatarSelection({ prompt, onSelect, onCancel }: AvatarSelectionProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Generate avatars on mount
  useEffect(() => {
    generateAvatars();
  }, []);

  const generateAvatars = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/intake/generate-avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          style: 'digital art',
          count: 3
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate avatars');
      }

      const data = await response.json();
      console.log("🎨 Avatar generation response:", data);
      
      if (data.avatars && data.avatars.length > 0) {
        setAvatars(data.avatars);
        console.log("✅ Set avatars:", data.avatars.length, "images");
      } else {
        throw new Error('No avatars generated');
      }
    } catch (error: any) {
      console.error('Avatar generation error:', error);
      setError(error.message || 'Failed to generate avatars');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Choose Your Bot's Avatar</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Generating avatar options with DALL-E 3...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm mb-3">
          {error}
          <Button 
            onClick={generateAvatars} 
            size="sm" 
            variant="outline" 
            className="ml-3"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedAvatar === avatar.imageUrl
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedAvatar(avatar.imageUrl)}
              >
                <img
                  src={avatar.imageUrl}
                  alt={avatar.description}
                  className="w-full h-32 object-cover"
                />
                {selectedAvatar === avatar.imageUrl && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSelect}
              disabled={!selectedAvatar}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Use This Avatar
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}