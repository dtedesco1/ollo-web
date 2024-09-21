import { Digest } from '../types/digest';

export const fetchClips = async (inputText: string): Promise<Digest[]> => {
    const apiUrl = "/api/search";
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: inputText, top_k: "10", alpha: "0.6" })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const clips: Digest[] = await response.json();
            if (!Array.isArray(clips)) {
                throw new Error('Invalid response format');
            }
            return clips;
        } catch (error) {
            retries++;
            if (retries === maxRetries) {
                console.error('Failed to get clips after retries:', error);
                throw error;
            }
        }
    }

    return [];
};