import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AssistantConfig {
  discussionAssistantId: string;
  assessmentAssistantId: string;
  contentPackage?: any;
}

export function useAssistantConfig(experience?: string | null) {
  const [discussionAssistantId, setDiscussionAssistantId] = useState<string>('');
  const [assessmentAssistantId, setAssessmentAssistantId] = useState<string>('');
  const [contentPackage, setContentPackage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistantConfig = async () => {
      try {
        setIsLoading(true);
        const url = experience ? `/api/assistant-config?experience=${encodeURIComponent(experience)}` : '/api/assistant-config';
        const response = await apiRequest('GET', url);
        const data = await response.json() as AssistantConfig;
        setDiscussionAssistantId(data.discussionAssistantId);
        setAssessmentAssistantId(data.assessmentAssistantId);
        setContentPackage(data.contentPackage);
        setError(null);
      } catch (err) {
        console.error('Error fetching assistant config:', err);
        setError('Failed to load assistant configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistantConfig();
  }, [experience]);

  return { 
    discussionAssistantId, 
    assessmentAssistantId, 
    contentPackage,
    isLoading, 
    error 
  };
}