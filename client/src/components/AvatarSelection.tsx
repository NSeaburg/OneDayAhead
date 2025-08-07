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
  const [hasGenerated, setHasGenerated] = useState(false);

  // Generate avatars on mount - but only once
  useEffect(() => {
    if (!hasGenerated && !loading) {
      generateAvatars();
    }
  }, [hasGenerated, loading]);

  const generateAvatars = async () => {
    // Prevent multiple simultaneous calls
    if (loading || hasGenerated) {
      console.log("🚫 Avatar generation already in progress or completed");
      return;
    }

    console.log("🎨 AVATAR DEBUG - Starting avatar generation");
    console.log("🎨 AVATAR DEBUG - Prompt:", prompt);
    console.log("🎨 AVATAR DEBUG - Prompt length:", prompt?.length || 0);

    setLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      console.log("🎨 AVATAR DEBUG - Making API call to /api/intake/generate-avatars");
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

      console.log("🎨 AVATAR DEBUG - API response status:", response.status);
      console.log("🎨 AVATAR DEBUG - API response ok:", response.ok);

      if (!response.ok) {
        console.log("🎨 AVATAR DEBUG - API call failed, reading error data");
        const errorData = await response.json();
        console.log("🎨 AVATAR DEBUG - Error data:", errorData);
        throw new Error(errorData.details || 'Failed to generate avatars');
      }

      const data = await response.json();
      console.log("🎨 AVATAR DEBUG - Avatar generation response:", data);
      console.log("🎨 AVATAR DEBUG - Response success:", data.success);
      console.log("🎨 AVATAR DEBUG - Avatars array length:", data.avatars?.length || 0);
      console.log("🎨 AVATAR DEBUG - Source:", data.source);
      
      if (data.avatars && data.avatars.length > 0) {
        setAvatars(data.avatars);
        console.log("✅ AVATAR DEBUG - Set avatars:", data.avatars.length, "images");
        console.log("🎨 AVATAR DEBUG - First avatar URL:", data.avatars[0]?.imageUrl ? "Present" : "Missing");
      } else {
        console.log("🎨 AVATAR DEBUG - No avatars in response, throwing error");
        throw new Error('No avatars generated');
      }
    } catch (error: any) {
      console.error('🎨 AVATAR DEBUG - Avatar generation error:', error);
      
      // Handle rate limiting specifically
      if (error.message.includes('Rate limit exceeded') || error.message.includes('429')) {
        setError('OpenAI rate limit reached (5 images/minute). Please wait a moment and try again.');
        setHasGenerated(false); // Allow retry for rate limit errors
      } else {
        setError(error.message || 'Failed to generate avatars');
        setHasGenerated(false); // Allow retry for other errors too
      }
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
            onClick={() => {
              setHasGenerated(false);
              generateAvatars();
            }} 
            size="sm" 
            variant="outline" 
            className="ml-3"
            disabled={loading}
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