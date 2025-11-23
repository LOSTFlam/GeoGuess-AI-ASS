import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, GroundingChunk } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLocation = async (
  base64Image: string,
  mimeType: string
): Promise<AnalysisResult> => {
  try {
    // Determine model. gemini-2.5-flash supports googleMaps grounding tool and is fast.
    const modelId = "gemini-2.5-flash";

    const prompt = `
      Ты профессиональный игрок в GeoGuessr. Проанализируй это изображение, чтобы определить точное местоположение.
      
      Ищи следующие подсказки:
      1. Дорожная разметка, сторона движения.
      2. Дорожные знаки (шрифты, цвета, форма, обратная сторона).
      3. Язык и письменность.
      4. Архитектура, столбы ЛЭП, болларды (столбики).
      5. Растительность, почва, климат.
      6. "Google Car meta" (если видно части машины).
      
      Сначала дай краткий вывод: Страна, Регион, Город (если возможно).
      Затем подробно опиши найденные подсказки.
      В конце дай координаты или ссылку на карту через Google Maps grounding.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Enable Google Maps grounding to find real places
        tools: [{ googleMaps: {} }],
        temperature: 0.4, // Lower temperature for more analytical/factual responses
      },
    });

    const text = response.text || "Не удалось получить текстовый ответ.";
    
    // Extract grounding chunks if available
    const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];

    return {
      text,
      groundingChunks,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Не удалось проанализировать изображение. Проверьте API ключ и попробуйте снова.");
  }
};