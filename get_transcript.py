#!/usr/bin/env python3
"""
YouTube Transcript Extractor using youtube-transcript-api
This script provides a robust method for extracting YouTube video transcripts
with comprehensive error handling and multiple language support.
"""

import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter


def extract_video_id(url):
    """
    Extract video ID from various YouTube URL formats.
    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://www.youtube.com/v/VIDEO_ID
    - YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
    """
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # If it's already just a video ID
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return url
        
    return None


def get_transcript(video_url, preferred_languages=None):
    """
    Extract transcript from YouTube video with multiple language fallbacks.
    
    Args:
        video_url (str): YouTube video URL or video ID
        preferred_languages (list): List of language codes to try in order
    
    Returns:
        dict: Response with success status, transcript data, and error info
    """
    if preferred_languages is None:
        preferred_languages = ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU']
    
    # Extract video ID
    video_id = extract_video_id(video_url)
    if not video_id:
        return {
            "success": False,
            "transcript": None,
            "error": "Invalid YouTube URL or video ID",
            "video_id": None
        }
    
    try:
        # Try to get transcript with preferred languages
        transcript_data = None
        language_used = None
        is_generated = False
        
        # Try preferred languages first
        for lang in preferred_languages:
            try:
                transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
                language_used = lang
                break
            except Exception as lang_error:
                continue
        
        # If no preferred language worked, try getting any available transcript
        if transcript_data is None:
            try:
                transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
                language_used = "auto-detected"
            except Exception as auto_error:
                # Try to get the transcript list to see what languages are available
                try:
                    available_transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
                    # Try the first available transcript
                    for transcript in available_transcripts:
                        try:
                            transcript_data = transcript.fetch()
                            language_used = transcript.language_code
                            is_generated = transcript.is_generated
                            break
                        except:
                            continue
                except:
                    pass
        
        # Check if we got any transcript data
        if transcript_data is None:
            return {
                "success": False,
                "transcript": None,
                "error": "No transcripts available for this video",
                "video_id": video_id
            }
        
        # Format the transcript
        formatted_transcript = []
        for entry in transcript_data:
            formatted_transcript.append({
                "text": entry.get('text', '').strip(),
                "start": float(entry.get('start', 0)),
                "duration": float(entry.get('duration', 0))
            })
        
        return {
            "success": True,
            "transcript": formatted_transcript,
            "error": None,
            "video_id": video_id,
            "language": language_used,
            "is_generated": is_generated,
            "total_entries": len(formatted_transcript)
        }
        
    except Exception as e:
        error_msg = str(e)
        
        # Provide more specific error messages
        if "No transcript" in error_msg or "Transcript" in error_msg and "disabled" in error_msg:
            error_msg = "Transcripts are disabled for this video"
        elif "Video unavailable" in error_msg:
            error_msg = "Video is unavailable or private"
        elif "not available" in error_msg:
            error_msg = "No transcript available for this video"
        
        return {
            "success": False,
            "transcript": None,
            "error": error_msg,
            "video_id": video_id
        }


def test_transcript_extraction():
    """Test function to verify the transcript extraction is working."""
    # Test with a known video that should have transcripts
    test_urls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Roll - usually has transcripts
        "lT50ZJATsFM",  # Lord of the Flies video from your test
    ]
    
    print("Testing YouTube Transcript Extraction...")
    for url in test_urls:
        print(f"\nTesting: {url}")
        result = get_transcript(url)
        print(f"Success: {result['success']}")
        if result['success']:
            print(f"Language: {result['language']}")
            print(f"Generated: {result['is_generated']}")
            print(f"Entries: {result['total_entries']}")
            if result['transcript']:
                print(f"First entry: {result['transcript'][0]['text'][:100]}...")
        else:
            print(f"Error: {result['error']}")


if __name__ == "__main__":
    # If called with arguments, process the video URL
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            test_transcript_extraction()
        else:
            video_url = sys.argv[1]
            result = get_transcript(video_url)
            print(json.dumps(result, indent=2))
    else:
        # Interactive mode
        print("YouTube Transcript Extractor")
        print("Enter 'test' to run tests, or paste a YouTube URL:")
        user_input = input().strip()
        
        if user_input.lower() == "test":
            test_transcript_extraction()
        else:
            result = get_transcript(user_input)
            print(json.dumps(result, indent=2))