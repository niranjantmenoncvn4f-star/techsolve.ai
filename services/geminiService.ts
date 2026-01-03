
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, GroundingChunk } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async troubleshoot(
    history: Message[],
    currentMessage: string,
    image?: string,
    category?: string
  ): Promise<{ text: string; groundingLinks: GroundingChunk[] }> {
    try {
      const contents: any[] = history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const parts: any[] = [{ text: currentMessage }];
      
      if (image) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: image.split(',')[1]
          }
        });
      }

      contents.push({ role: 'user', parts });

      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: contents,
        config: {
          systemInstruction: `You are a world-class Senior Technical Support Engineer specializing in ${category || 'general tech'}. 
          Your goal is to troubleshoot hardware, software, and AI-related issues. 
          1. Provide step-by-step diagnostics.
          2. Explain 'why' something might be happening (reasoning).
          3. Suggest the most likely solution first.
          4. Include terminal commands or BIOS paths if relevant.
          5. Use professional, clear, and structured formatting (Markdown).
          6. If an image is provided, analyze the visual cues (error messages, physical damage, wiring).`,
          thinkingConfig: { thinkingBudget: 2000 },
          tools: [{ googleSearch: {} }]
        },
      });

      const text = response.text || "I apologize, but I couldn't generate a solution. Please try rephrasing.";
      const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];

      return { text, groundingLinks: groundingChunks };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
