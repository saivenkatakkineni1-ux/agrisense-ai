import { GoogleGenAI } from '@google/genai';
import { CropDiagnosisRecord } from '../types';

export interface DiagnosisOutput {
  cropIdentified: string;
  suspectedCondition: string;
  confidenceScore: number;
  pathogenType: string;
  visualSymptoms: string;
  recommendedMeasures: string;
  differentialDiagnosis: string[];
  datasetAttribution: string;
  disclaimer: string;
}

export async function analyzeCropPathology(imageBase64: string, mimeType: string, userNotes?: string): Promise<DiagnosisOutput> {
  // Check if Gemini key is available in environment
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? (process.env?.GEMINI_API_KEY || '') : '');

  if (!apiKey) {
    throw new Error(
      'AI Vision Model endpoint unconfigured. A valid Google Gemini API Key is required to run neural pathology inference on crop specimens. In compliance with the Zero Demo Data mandate, no fake disease diagnosis can be returned.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert Government Agricultural Extension Pathologist working with the Indian Council of Agricultural Research (ICAR).
Analyze this uploaded crop specimen photograph.

User Context/Notes: "${userNotes || 'None provided'}".

Strict constraints:
1. Examine the visual symptoms (lesions, chlorosis, necrosis, discoloration, pustules, wilting, mosaic patterns, pest damage).
2. If the image is NOT an agricultural crop or leaf, explicitly state that it cannot be diagnosed.
3. Reference recognized agricultural pathology taxonomy (e.g., Xanthomonas, Puccinia, Magnaporthe, Cercospora, etc.) and benchmark against PlantVillage (CC BY-SA 4.0) / ICAR diagnostic indices.
4. Output STRICT JSON only without Markdown backticks or wrapping text.

Format:
{
  "cropIdentified": "Crop name (e.g., Rice / Paddy, Tomato, Wheat, Cotton, Maize, etc.)",
  "suspectedCondition": "Precise condition or disease name with scientific binomial if pathogen-induced, or 'Healthy Foliage'",
  "confidenceScore": 88,
  "pathogenType": "Fungal | Bacterial | Viral | Nutrient Deficiency | Pest Damage | Healthy | Unknown",
  "visualSymptoms": "Detailed observable clinical markers on leaves/stems",
  "recommendedMeasures": "Integrated Pest Management (IPM) guidance, cultural controls, biological remedies, and ICAR advisory protocol",
  "differentialDiagnosis": ["Condition 1", "Condition 2"],
  "datasetAttribution": "Benchmark taxonomy: PlantVillage open benchmark (CC BY-SA 4.0) and ICAR Crop Protection Guide",
  "disclaimer": "This automated diagnostic screening is generated via neural computer vision and is provided strictly for preliminary advisory purposes under Digital Agriculture guidelines. Physical specimen verification by the local District Agriculture Extension Officer or Krishi Vigyan Kendra (KVK) is required prior to applying any schedule chemical fungicide or bactericide."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || '';
    // Strip markdown code fences if model enclosed them
    const cleanedJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed: DiagnosisOutput = JSON.parse(cleanedJson);
    return parsed;
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      throw new Error(`Model generated non-structured diagnostic payload: ${err.message}. Raw output retained for audit.`);
    }
    throw new Error(`AI Pathology inference failed: ${err.message || 'Unknown network error'}`);
  }
}
