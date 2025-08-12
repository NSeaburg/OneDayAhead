import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Edit } from "lucide-react";

interface AvatarButtonsProps {
  onCreateAvatar: () => void;
  onReviseDescription: () => void;
  isGenerating?: boolean;
}

export function AvatarButtons({ 
  onCreateAvatar, 
  onReviseDescription, 
  isGenerating = false 
}: AvatarButtonsProps) {
  return (
    <div className="flex gap-2 my-3 flex-wrap">
      <Button
        onClick={onCreateAvatar}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        size="sm"
      >
        <Palette size={16} />
        {isGenerating ? "Generating..." : "Create Avatar Image"}
      </Button>
      
      <Button
        onClick={onReviseDescription}
        disabled={isGenerating}
        variant="outline"
        className="flex items-center gap-2"
        size="sm"
      >
        <Edit size={16} />
        Revise Description
      </Button>
    </div>
  );
}