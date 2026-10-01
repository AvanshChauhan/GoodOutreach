import { IInfluencer, PersonalizationResult } from '../../types';

/** Abstract LLM provider interface */
export interface LLMProvider {
  readonly name: string;
  generatePersonalization(influencer: IInfluencer): Promise<PersonalizationResult>;
  analyzeContent(influencer: IInfluencer): Promise<{
    contentThemes: string[];
    tone: string;
    audience: string;
    collaborationAngles: string[];
  }>;
}
