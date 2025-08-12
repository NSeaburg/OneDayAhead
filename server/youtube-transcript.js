import axios from 'axios';

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Function to get YouTube transcript
async function getYouTubeTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  
  if (!videoId) {
    return {
      success: false,
      transcript: null,
      error: 'Invalid YouTube URL'
    };
  }

  const options = {
    method: 'GET',
    url: 'https://youtube-transcriptor.p.rapidapi.com/transcript',
    params: {
      video_id: videoId,
      lang: 'en'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'youtube-transcriptor.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    
    console.log(`🎥 RAPIDAPI - Response status: ${response.status}`);
    
    // Check if we got a valid response with video data
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const videoData = response.data[0];
      
      // Check if transcription exists
      if (videoData.transcription && Array.isArray(videoData.transcription)) {
        // Convert RapidAPI format to our expected format
        const transcript = videoData.transcription.map(segment => ({
          text: segment.subtitle,
          start: segment.start,
          duration: segment.dur
        }));
        
        console.log(`🎥 RAPIDAPI - Success! Retrieved ${transcript.length} transcript segments`);
        
        return {
          success: true,
          transcript: transcript,
          error: null
        };
      } else if (videoData.transcriptionAsText) {
        // If no segment data but we have full text, create a single segment
        console.log(`🎥 RAPIDAPI - Using transcriptionAsText fallback`);
        
        return {
          success: true,
          transcript: [{
            text: videoData.transcriptionAsText,
            start: 0,
            duration: 0
          }],
          error: null
        };
      } else {
        throw new Error('No transcript data found in response');
      }
    } else {
      throw new Error('Empty or invalid response from API');
    }
  } catch (error) {
    console.error('🎥 RAPIDAPI - Error fetching transcript:', error.response?.data || error.message);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to fetch transcript';
    
    if (error.response?.status === 401) {
      errorMessage = 'Invalid API key - please check RAPIDAPI_KEY configuration';
    } else if (error.response?.status === 403) {
      errorMessage = 'API access forbidden - check subscription and quotas';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded - too many requests';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      transcript: null,
      error: errorMessage
    };
  }
}

export { getYouTubeTranscript };