import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AssistantConfig {
  discussionAssistantId: string;
  assessmentAssistantId: string;
}

export function useAssistantConfig() {
  const [discussionAssistantId, setDiscussionAssistantId] = useState<string>('');
  const [assessmentAssistantId, setAssessmentAssistantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistantConfig = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest<AssistantConfig>('GET', '/api/assistant-config');
        setDiscussionAssistantId(data.discussionAssistantId);
        setAssessmentAssistantId(data.assessmentAssistantId);
        setError(null);
      } catch (err) {
        console.error('Error fetching assistant config:', err);
        setError('Failed to load assistant configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistantConfig();
  }, []);

  return { 
    discussionAssistantId, 
    assessmentAssistantId, 
    isLoading, 
    error 
  };
}