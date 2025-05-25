import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import YouTubePlayer from "./YouTubePlayer";

interface VideoScreenProps {
  videoUrl: string;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function VideoScreen({ videoUrl, onNext, onPrevious }: VideoScreenProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerReady = useRef<boolean>(false);

  useEffect(() => {
    // YouTube API event handler
    const handleYouTubeMessages = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'onReady') {
          // Set player as ready to receive commands
          playerReady.current = true;
        }
      } catch (e) {
        // Ignore parsing errors from other postMessage events
      }
    };

    // Add event listener for YouTube iframe API events
    window.addEventListener('message', handleYouTubeMessages);

    return () => {
      // Clean up the event listener when component unmounts or video URL changes
      window.removeEventListener('message', handleYouTubeMessages);
      
      // Attempt to pause the video when navigating away
      pauseVideo();
    };
  }, [videoUrl]);

  // Function to pause the YouTube video
  const pauseVideo = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // For YouTube videos
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          // Try both formats of the pause command
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo' }),
            '*'
          );
          
          // Alternative format
          iframeRef.current.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
          
          // Make sure URL is changed to stop audio
          if (iframeRef.current.src.includes('autoplay=1')) {
            iframeRef.current.src = iframeRef.current.src.replace('autoplay=1', 'autoplay=0');
          }
        }
      }
    } catch (error) {
      console.log("Failed to pause video:", error);
    }
  };

  // Function to handle next button click
  const handleNext = () => {
    pauseVideo();
    onNext();
  };

  // Add YouTube API parameters to the URL if it's a YouTube video
  // Add cache-busting parameter for YouTube to force thumbnail refresh
  const timestamp = new Date().getTime();
  const enhancedVideoUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') 
    ? videoUrl + (videoUrl.includes('?') ? '&' : '?') + 'enablejsapi=1&origin=' + window.location.origin + '&nocache=' + timestamp
    : videoUrl;

  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Social Studies Sample</h1>
      <div className="flex-grow flex flex-col">
        <div className="relative w-full h-0 pb-[56.25%] md:pb-[56.25%] bg-gray-100 rounded-lg overflow-hidden mb-6">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            // Extract YouTube video ID from URL
            <YouTubePlayer 
              videoId={videoUrl.includes('embed/') 
                ? videoUrl.split('embed/')[1].split('?')[0] 
                : videoUrl.includes('youtu.be/') 
                  ? videoUrl.split('youtu.be/')[1].split('?')[0]
                  : videoUrl.includes('v=') 
                    ? videoUrl.split('v=')[1].split('&')[0] 
                    : ''}
            />
          ) : (
            <iframe 
              ref={iframeRef}
              className="absolute inset-0 w-full h-full"
              src={enhancedVideoUrl}
              title="The Three Branches of Government"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          )}
          
        </div>
        
        {/* Navigation buttons positioned below video container */}
        <div className="mt-2 flex justify-between">
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
            onClick={handleNext}
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
