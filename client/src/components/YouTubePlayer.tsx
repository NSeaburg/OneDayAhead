import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
}

export default function YouTubePlayer({ videoId, onReady }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  useEffect(() => {
    // Only create the iframe if the container exists
    if (!containerRef.current) return;
    
    // Clear any existing content
    containerRef.current.innerHTML = '';
    
    // Create a new iframe element
    const iframe = document.createElement('iframe');
    iframeRef.current = iframe;
    
    // Add a timestamp to force refresh
    const timestamp = new Date().getTime();
    
    // Set necessary attributes
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&t=${timestamp}`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.title = "YouTube video player";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    
    // Add the iframe to the container
    containerRef.current.appendChild(iframe);
    
    // Notify parent component when ready
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'onReady') {
          if (onReady) onReady();
        }
      } catch (e) {
        // Ignore parsing errors from other postMessage events
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup function to stop video and remove iframe
    return () => {
      window.removeEventListener('message', handleMessage);
      
      // Forcefully stop the video by changing the src and removing iframe
      if (iframeRef.current) {
        try {
          // First try to stop the video
          if (iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              '{"event":"command","func":"stopVideo","args":""}',
              '*'
            );
          }
          
          // Force stop by clearing the src
          iframeRef.current.src = 'about:blank';
          
          // Remove the iframe after a brief delay
          setTimeout(() => {
            if (iframeRef.current && iframeRef.current.parentNode) {
              iframeRef.current.parentNode.removeChild(iframeRef.current);
            }
          }, 100);
        } catch (e) {
          // Ignore errors if iframe is already gone
        }
      }
      
      // Clear the container
      if (containerRef.current) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        }, 200);
      }
      
      iframeRef.current = null;
    };
  }, [videoId, onReady]);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
    ></div>
  );
}