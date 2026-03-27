import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PredictionResult {
  topic: string;
  prediction: string;
  reasoning: string;
  confidence: number;
  sources: { title: string; uri: string }[];
}

export async function predictFuture(topic: string): Promise<PredictionResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the latest data, discussions, and historical patterns to predict the future for this topic: "${topic}". 
    Provide a specific prediction, detailed reasoning, and a confidence percentage (0-100).`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prediction: { type: Type.STRING, description: "The specific prediction." },
          reasoning: { type: Type.STRING, description: "The reasoning based on data and patterns." },
          confidence: { type: Type.NUMBER, description: "Confidence percentage (0-100)." },
        },
        required: ["prediction", "reasoning", "confidence"],
      },
    },
  });

  const text = response.text;
  const data = JSON.parse(text);
  
  // Extract sources from grounding metadata
  const sources: { title: string; uri: string }[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

  return {
    topic,
    ...data,
    sources: sources.slice(0, 5), // Limit to top 5 sources
  };
}
