import { Digest } from '@/types/digest';

interface SearchResponse {
    results: Digest[];
    hasMore: boolean;
    total: number;
}

export const fetchPodcastShowClips = async (showTitle: string): Promise<SearchResponse> => {
    const apiUrl = "/api/podcast-shows/search";
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: showTitle })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data.results)) {
                throw new Error('Invalid response format');
            }

            return {
                results: data.results,
                hasMore: data.hasMore || false,
                total: data.total || data.results.length
            };
        } catch (error) {
            retries++;
            if (retries === maxRetries) {
                throw error;
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
    }

    throw new Error('Max retries exceeded');
}
