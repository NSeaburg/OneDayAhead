/**
 * Embedding utility to support iframe communication
 * This file provides functions to communicate with a parent window
 * when the application is embedded in an iframe
 */

/**
 * Send a message to the parent window if the app is in an iframe
 * @param type Message type identifier 
 * @param data Data to send with the message
 */
export function sendMessageToParent(type: string, data: any = {}) {
  // Check if the app is running in an iframe
  const isInIframe = window.self !== window.top;
  
  if (isInIframe && window.parent) {
    try {
      // Create a consistent message format
      const message = {
        type,
        data,
        timestamp: new Date().toISOString(),
        source: 'learning-platform'
      };
      
      // Send the message to the parent window
      window.parent.postMessage(message, '*');
      console.log(`Message sent to parent: ${type}`);
    } catch (error) {
      console.error('Error sending message to parent:', error);
    }
  }
}

/**
 * Available message types that the app can send to parent windows
 */
export const EMBED_MESSAGES = {
  // Navigation events
  SCREEN_CHANGE: 'screen_change',
  
  // Progress events
  VIDEO_WATCHED: 'video_watched',
  ARTICLE_READ: 'article_read',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  TEACHING_COMPLETED: 'teaching_completed',
  
  // Completion event
  COURSE_COMPLETED: 'course_completed',
  
  // Feedback data
  FEEDBACK_RECEIVED: 'feedback_received'
};

/**
 * Send screen change notification to parent window
 * @param screenName Name of the current screen
 * @param screenIndex Index of the current screen
 */
export function notifyScreenChange(screenName: string, screenIndex: number) {
  // Check if the app is running in an iframe
  const isInIframe = window.self !== window.top;
  
  if (isInIframe && window.parent) {
    try {
      // Get content based on screen
      let content = '';
      switch (screenIndex) {
        case 1:
          content = 'Your video content';
          break;
        case 2:
          content = 'Your written content';
          break;
        case 3:
          content = 'Assessment in progress';
          break;
        case 4:
          content = 'Teaching bot interaction';
          break;
        case 5:
          content = 'Feedback and completion';
          break;
        default:
          content = 'Learning content';
      }

      // Send message in the exact format requested
      window.parent.postMessage({
        type: 'SCREEN_CHANGE',
        data: {
          screen: screenIndex,
          screenName: screenName,
          content: content
        }
      }, '*');
      
      console.log(`Message sent to parent: screen_change`);
    } catch (error) {
      console.error('Error sending message to parent:', error);
    }
  }
}

/**
 * Send feedback data to parent window
 * @param feedbackData Feedback data received from N8N
 */
export function notifyFeedbackReceived(feedbackData: any) {
  sendMessageToParent(EMBED_MESSAGES.FEEDBACK_RECEIVED, feedbackData);
}

/**
 * Send course completion notification to parent window
 * @param feedbackData Optional feedback data to include
 */
export function notifyCourseCompleted(feedbackData?: any) {
  sendMessageToParent(EMBED_MESSAGES.COURSE_COMPLETED, { 
    completed: true,
    timestamp: new Date().toISOString(),
    feedbackData
  });
}