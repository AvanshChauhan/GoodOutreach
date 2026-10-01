import { config } from '../../config';
import { LLMProvider } from './llmProvider';
import { GeminiProvider } from './geminiProvider';
import { DemoLLMProvider } from './demoLLMProvider';
import { IInfluencer, PersonalizationResult } from '../../types';
import { Influencer } from '../../models/Influencer';
import { Outreach } from '../../models/Outreach';
import { hashString, wordCount } from '../../utils/helpers';

/** Returns the appropriate LLM provider based on current environment key */
function getLLMProvider(): LLMProvider {
  const apiKey = process.env.GEMINI_API_KEY || config.geminiApiKey;
  if (apiKey && apiKey.trim().length > 0) {
    return new GeminiProvider(apiKey.trim());
  }
  return new DemoLLMProvider();
}

export function getActiveProviderName(): string {
  const provider = getLLMProvider();
  return provider.name;
}

export interface PersonalizationRunResult {
  influencerId: string;
  name: string;
  status: 'generated' | 'failed';
  error?: string;
  emailWords?: number;
  dmWords?: number;
  providerUsed?: string;
}

/**
 * Generate personalized outreach messages for one influencer.
 * Creates or updates the Outreach document.
 * Validates word counts and marks influencer.personalizationStatus accordingly.
 */
export async function generatePersonalization(
  influencerId: string
): Promise<PersonalizationRunResult> {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error(`Influencer ${influencerId} not found`);

  let provider = getLLMProvider();
  let result: PersonalizationResult;

  try {
    try {
      result = await provider.generatePersonalization(influencer);
    } catch (llmErr) {
      console.warn(`[Personalization] ${provider.name} failed (${llmErr instanceof Error ? llmErr.message : llmErr}). Falling back to DemoLLMProvider...`);
      // Fallback to Demo provider if primary provider fails (e.g. invalid API key or rate limit)
      provider = new DemoLLMProvider();
      result = await provider.generatePersonalization(influencer);
    }

    // Validate output
    if (!result.emailSubject || !result.emailBody || !result.instagramDM) {
      throw new Error('LLM returned incomplete personalization data');
    }

    const emailWords = wordCount(result.emailBody);
    const dmWords = wordCount(result.instagramDM);

    // Generate message hash for duplicate prevention
    const messageHash = hashString(
      `${influencerId}:${result.emailSubject}:${result.emailBody}`
    );

    const email = influencer.contactEmail || '';

    // Upsert: update existing draft or create new
    await Outreach.findOneAndUpdate(
      { influencerId: influencer._id },
      {
        influencerId: influencer._id,
        email,
        emailSubject: result.emailSubject,
        emailMessage: result.emailBody,
        instagramDM: result.instagramDM,
        personalizationSignals: result.personalizationSignals || [],
        messageHash,
        status: 'draft',
        sentAt: null,
        errorMessage: null,
      },
      { upsert: true, new: true }
    );

    influencer.personalizationStatus = 'generated';
    await influencer.save();

    return {
      influencerId,
      name: influencer.name,
      status: 'generated',
      emailWords,
      dmWords,
      providerUsed: provider.name,
    };
  } catch (err) {
    influencer.personalizationStatus = 'failed';
    await influencer.save();

    return {
      influencerId,
      name: influencer.name,
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Run content analysis for one influencer and update contentThemes */
export async function analyzeInfluencerContent(influencerId: string) {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error(`Influencer ${influencerId} not found`);

  const provider = getLLMProvider();
  const analysis = await provider.analyzeContent(influencer);

  // Only update themes if they were empty
  if (influencer.contentThemes.length === 0 && analysis.contentThemes.length > 0) {
    influencer.contentThemes = analysis.contentThemes;
  }
  influencer.enrichmentStatus = 'completed';
  await influencer.save();

  return analysis;
}
