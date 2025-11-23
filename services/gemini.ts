import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, GroundingChunk, Language, Coordinates } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLocation = async (
  base64Image: string,
  mimeType: string,
  language: Language
): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash";

    const langInstruction = language === 'ru' 
      ? "Отвечай на РУССКОМ языке." 
      : "Answer in ENGLISH.";

    const prompt = `
      You are a professional GeoGuessr player. Analyze this image to determine the exact location.
      ${langInstruction}
      
      Look for these specific clues:
      1. Road markings, driving side.
      2. Road signs (fonts, colors, shapes, reverse side).
      3. Language and scripts.
      4. Architecture, utility poles (holy poles), bollards.
      5. Vegetation, soil color, climate.
      6. "Google Car meta" (if visible).
      
      First, provide a structured analysis.
      
      CRITICAL: At the very end of your response, you MUST provide a JSON block with the estimated best guess coordinates. 
      Format:
      \`\`\`json
      {
        "lat": 12.3456,
        "lng": -65.4321,
        "locationName": "City, Country"
      }
      \`\`\`
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
        temperature: 0.4, 
      },
    });

    let text = response.text || "";
    
    // Extract JSON coordinates from text if present
    let coordinates: Coordinates | undefined;
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        coordinates = JSON.parse(jsonMatch[1]);
        // Remove the JSON block from the display text to keep it clean
        text = text.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse coordinates JSON", e);
      }
    }

    // Extract grounding chunks
    const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];

    return {
      text,
      groundingChunks,
      coordinates
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("API Error");
  }
};