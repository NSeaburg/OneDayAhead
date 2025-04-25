import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoScreenProps {
  videoUrl: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function VideoScreen({ videoUrl, onNext, onPrevious }: VideoScreenProps) {
  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Introduction Video</h1>
      <div className="flex-grow flex flex-col">
        <div className="relative w-full h-0 pb-[56.25%] md:pb-[56.25%] bg-gray-100 rounded-lg overflow-hidden mb-6">
          <iframe 
            className="absolute inset-0 w-full h-full"
            src={videoUrl}
            title="Learning Module Introduction"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
        <div className="mt-auto flex justify-between">
          {onPrevious ? (
            <Button 
              onClick={onPrevious}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : <div></div>}
          
          <Button 
            onClick={onNext}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
