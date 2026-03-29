import { useState, useCallback } from 'react';

interface InfographicResult {
  imageBase64: string;
  mimeType: string;
  caption?: string;
}

interface UseInfographicReturn {
  generate: (type: 'fire' | 'portfolio' | 'tax', data: Record<string, unknown>) => Promise<void>;
  image: InfographicResult | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook to generate Nano Banana 2 infographic via the backend API.
 */
export function useInfographic(): UseInfographicReturn {
  const [image, setImage] = useState<InfographicResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (type: 'fire' | 'portfolio' | 'tax', data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    setImage(null);

    try {
      const res = await fetch('/api/v2/generate-infographic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const result: InfographicResult = await res.json();
      setImage(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { generate, image, isLoading, error, reset };
}
