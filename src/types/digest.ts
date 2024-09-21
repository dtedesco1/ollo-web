export type Digest = {
    clipId: string;
    clipSummary: string;
    clipTitle: string;
    clipTranscript: string;
    episodeAudioGsUrl: string;
    episodeId: string;
    episodeTitle: string;
    episodeStartIndex: number;
    firebaseAudioStoragePath: string;
    firebaseAudioTokenUrl: string;
    indexed: boolean;
    podcastShowThumbnailColors: string[];
    podcastShowThumbnailFirebaseUrl: string;
    podcastShowTitle: string;
    podcastShowId: string;
    indexed_timestamp?: string;
};