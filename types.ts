export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    }[];
  };
}

export interface AnalysisResult {
  text: string;
  groundingChunks: GroundingChunk[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface MapLocation {
  lat: number;
  lng: number;
  title: string;
  uri?: string;
}