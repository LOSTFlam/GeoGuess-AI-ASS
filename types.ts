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

export interface Coordinates {
  lat: number;
  lng: number;
  locationName: string;
}

export interface AnalysisResult {
  text: string;
  groundingChunks: GroundingChunk[];
  coordinates?: Coordinates;
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

export type Language = 'ru' | 'en';

export const TRANSLATIONS = {
  ru: {
    title: "GeoGuessr AI Assistant",
    uploadTitle: "Загрузка скриншота",
    dragDrop: "Нажмите, перетащите или Ctrl+V",
    formats: "PNG, JPG, WEBP (макс. 10MB)",
    analyzeBtn: "Анализировать локацию",
    analyzingBtn: "Анализирую признаки...",
    tipsTitle: "Советы по съемке",
    tips: [
      "Захватите дорожные знаки крупным планом",
      "Покажите разметку дороги и бордюры",
      "Включите в кадр столбы ЛЭП и архитектуру",
      "Солнце и тени помогают определить полушарие"
    ],
    waitingTitle: "Ожидание загрузки",
    waitingDesc: "Загрузите скриншот из игры, чтобы ИИ определил ваше местоположение на основе визуальных данных.",
    pasteHint: "Поддерживается Ctrl+V",
    analyzingTitle: "Изучаю местность...",
    analyzingDesc: "Смотрю на знаки, растительность и архитектуру",
    mapVis: "Визуализация на карте",
    analysisHeader: "Анализ GeoGuessr",
    linksHeader: "Ссылки на найденные места",
    error: "Не удалось проанализировать изображение. Проверьте API ключ и попробуйте снова.",
    unknown: "Неизвестное место",
    openMaps: "Открыть в Google Maps",
    delete: "Удалить фото",
    created: "Создано"
  },
  en: {
    title: "GeoGuessr AI Assistant",
    uploadTitle: "Upload Screenshot",
    dragDrop: "Click, drag & drop or Ctrl+V",
    formats: "PNG, JPG, WEBP (max 10MB)",
    analyzeBtn: "Analyze Location",
    analyzingBtn: "Analyzing features...",
    tipsTitle: "Pro Tips",
    tips: [
      "Capture road signs up close",
      "Show road markings and curbs",
      "Include utility poles and architecture",
      "Sun and shadows help determine hemisphere"
    ],
    waitingTitle: "Waiting for Upload",
    waitingDesc: "Upload a screenshot from the game to let AI pinpoint your location based on visual clues.",
    pasteHint: "Ctrl+V Supported",
    analyzingTitle: "Scanning area...",
    analyzingDesc: "Looking at signs, vegetation, and architecture",
    mapVis: "Map Visualization",
    analysisHeader: "GeoGuessr Analysis",
    linksHeader: "Location Links",
    error: "Failed to analyze image. Check API key and try again.",
    unknown: "Unknown Location",
    openMaps: "Open in Google Maps",
    delete: "Remove photo",
    created: "Created by"
  }
};