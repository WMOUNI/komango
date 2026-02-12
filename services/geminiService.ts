
import { GoogleGenAI, Type } from "@google/genai";
import { UnifiedManga, MangaStatus, MangaSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class MangaService {
  /**
   * Generates a unique set of manga based on a prompt.
   */
  private static async fetchFromAI(prompt: string): Promise<UnifiedManga[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                author: { type: Type.STRING },
                description: { type: Type.STRING },
                status: { type: Type.STRING, enum: Object.values(MangaStatus) },
                rating: { type: Type.NUMBER },
                genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                lastUpdated: { type: Type.STRING },
                sources: { type: Type.ARRAY, items: { type: Type.STRING, enum: Object.values(MangaSource) } },
                chapters: {
                   type: Type.ARRAY,
                   items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        number: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        releaseDate: { type: Type.STRING },
                        source: { type: Type.STRING }
                      }
                   }
                }
              },
              required: ["id", "title", "author", "description", "status", "rating", "genres", "sources"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      return data.map((m: any) => ({
        ...m,
        coverImage: `https://picsum.photos/seed/${m.id}/400/600`,
        bannerImage: `https://picsum.photos/seed/banner_${m.id}/800/400`,
        chapters: (m.chapters || []).map((c: any) => ({
          ...c,
          pages: Array.from({ length: 15 }, (_, i) => `https://picsum.photos/seed/${c.id}_${i}/600/900`)
        }))
      }));
    } catch (error) {
      console.error("Error fetching from AI:", error);
      return [];
    }
  }

  static async getPopularManga(): Promise<UnifiedManga[]> {
    return this.fetchFromAI("Generate a list of 8 popular fictional manhwas with detailed metadata. Diverse genres like Action, Murim, Fantasy, and Romance.");
  }

  static async searchManga(query: string): Promise<UnifiedManga[]> {
    return this.fetchFromAI(`Search results for a manhwa called "${query}". Return 6 fictional but realistic manhwa results that match this theme.`);
  }

  static async getRecommendations(genres: string[]): Promise<UnifiedManga[]> {
    return this.fetchFromAI(`Generate 4 manhwa recommendations based on these genres: ${genres.join(', ')}.`);
  }
}
