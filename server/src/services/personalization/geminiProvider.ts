import { GoogleGenerativeAI } from '@google/generative-ai';
import { IInfluencer, PersonalizationResult } from '../../types';
import { LLMProvider } from './llmProvider';
import { wordCount } from '../../utils/helpers';

const PERSONALIZATION_PROMPT = (inf: IInfluencer, seed: number) => `
You are an expert influencer marketing strategist.

Generate a personalized outreach email and Instagram DM for the following influencer.

INFLUENCER PROFILE:
- Name: ${inf.name}
- Platform: ${inf.platform}
- Niche: ${inf.niche}
- Followers: ${inf.followerCount ?? 'Unknown'}
- Engagement Rate: ${inf.engagementRate ? inf.engagementRate + '%' : 'Unknown'}
- Content Themes: ${inf.contentThemes.length > 0 ? inf.contentThemes.join(', ') : 'Not specified'}
- Content Description: ${inf.contentDescription ?? 'Not available'}
- Profile URL: ${inf.profileUrl}

VARIATION SEED / REGENERATION ATTEMPT: #${seed}
Try a fresh, creative outreach angle (e.g. UGC Review, Sponsored Reel, Ambassador Program, or Exclusive Audience Giveaway).

STRICT RULES:
1. NEVER invent facts or recent posts not in the profile above.
2. Email body: MUST be between 60 and 90 words.
3. Instagram DM: MUST be between 15 and 30 words.
4. Personalize naturally using the actual niche, themes, and tone.
5. Avoid exaggerated compliments ("amazing", "incredible", "love your content so much").
6. Write in a professional but conversational tone.
7. List 3 specific personalization signals used.

Return ONLY valid JSON matching this exact schema:
{
  "emailSubject": "string",
  "emailBody": "string",
  "instagramDM": "string",
  "personalizationSignals": ["signal 1", "signal 2", "signal 3"]
}
`;

export class GeminiProvider implements LLMProvider {
  readonly name = 'GeminiProvider';
  private client: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.9 }, // Higher temperature for creative variations on regeneration
    });
  }

  private async generateJSON<T>(prompt: string): Promise<T> {
    const result = await this.model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');
    return JSON.parse(cleaned) as T;
  }

  async generatePersonalization(influencer: IInfluencer): Promise<PersonalizationResult> {
    const seed = Math.floor(Math.random() * 1000);
    const result = await this.generateJSON<PersonalizationResult>(
      PERSONALIZATION_PROMPT(influencer, seed)
    );

    const emailWords = wordCount(result.emailBody);
    const dmWords = wordCount(result.instagramDM);

    if (emailWords < 50 || emailWords > 100) {
      console.warn(`[Gemini] Email word count: ${emailWords} words for ${influencer.name}`);
    }
    if (dmWords < 10 || dmWords > 40) {
      console.warn(`[Gemini] DM word count: ${dmWords} words for ${influencer.name}`);
    }

    return result;
  }

  async analyzeContent(influencer: IInfluencer) {
    return this.generateJSON<{
      contentThemes: string[];
      tone: string;
      audience: string;
      collaborationAngles: string[];
    }>(`Analyze content for influencer: ${influencer.name}, Niche: ${influencer.niche}. Return JSON with contentThemes, tone, audience, collaborationAngles.`);
  }
}
