import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AssistantConfig {
  assistantId: string;
}

export function useAssistantConfig() {
  const [assistantId, setAssistantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistantConfig = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/assistant-config');
        const data = await response.json() as AssistantConfig;
        setAssistantId(data.assistantId);
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

  return { assistantId, isLoading, error };
}