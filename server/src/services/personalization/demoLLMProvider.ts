import { IInfluencer, PersonalizationResult } from '../../types';
import { LLMProvider } from './llmProvider';
import { wordCount } from '../../utils/helpers';

export class DemoLLMProvider implements LLMProvider {
  readonly name = 'DemoLLMProvider (Dynamic Simulated)';
  private static callCounter = 0;

  async generatePersonalization(influencer: IInfluencer): Promise<PersonalizationResult> {
    const niche = influencer.niche || 'lifestyle';
    const themes = influencer.contentThemes.slice(0, 2).join(' and ') || `${niche} content`;
    const followerStr = influencer.followerCount
      ? influencer.followerCount.toLocaleString()
      : 'your engaged';

    // Cycle through 4 distinct collaboration angles on regeneration
    DemoLLMProvider.callCounter++;
    const angleIndex = DemoLLMProvider.callCounter % 4;

    const angles = [
      {
        angle: 'UGC & Authentic Product Review',
        subject: `Partnership Idea for ${influencer.name} × Organic Skincare`,
        hook: `Loving your authentic approach to ${niche} on ${influencer.platform}!`,
        body: `Hi ${influencer.name},\n\nI was browsing your ${influencer.platform} feed and really admire how you create engaging ${niche} content around ${themes}. Your audience of ${followerStr} followers clearly values your genuine recommendations.\n\nWe would love to send you our new hydration serum for an unboxing and honest UGC review. No rigid script — just your real thoughts!\n\nWould you be open to collaborating on this?\n\nBest,\nThe Partnerships Team`,
        dm: `Hi ${influencer.name}! Obsessed with your ${niche} content! We'd love to gift you our new product line for a quick review reel — open to details?`,
        signals: [`niche: ${niche}`, `angle: UGC Product Review`, `followers: ${followerStr}`],
      },
      {
        angle: 'Sponsored Reel & Story Showcase',
        subject: `Sponsored Campaign Invitation: ${influencer.name} × Brand Co.`,
        hook: `Your recent posts on ${themes} caught our team's attention!`,
        body: `Hi ${influencer.name},\n\nOur marketing team has been following your ${influencer.platform} channel and we love your creative style in ${niche}. We are launching an exclusive seasonal campaign and want to feature creator partners with high engagement like yours.\n\nWe are proposing a paid sponsored Reel + 2 Story frames with full creative control for you.\n\nLet us know if you're accepting new brand briefs this month!\n\nCheers,\nOutreach Manager`,
        dm: `Hey ${influencer.name}! We have a paid sponsored Reel campaign launching for ${niche} creators. Your style is a perfect fit — can I send over the brief?`,
        signals: [`niche: ${niche}`, `angle: Paid Reel Campaign`, `platform: ${influencer.platform}`],
      },
      {
        angle: 'Long-term Brand Ambassador Program',
        subject: `Exclusive Brand Ambassador Role for ${influencer.name}`,
        hook: `Building long-term partnerships with top ${niche} creators!`,
        body: `Hi ${influencer.name},\n\nWe’re big fans of your work on ${influencer.platform}, particularly your focus on ${themes}. Rather than a one-off post, we’re looking for ambassador partners to represent our brand over the next 6 months.\n\nThis includes a monthly product package, guaranteed stipend, and custom affiliate commission for your ${followerStr} followers.\n\nWould you be interested in learning more about the ambassador tier?\n\nWarmly,\nHead of Creator Relations`,
        dm: `Hi ${influencer.name}! We're selecting 5 ambassador partners in ${niche} for a 6-month stipend + product package. Would love to invite you!`,
        signals: [`niche: ${niche}`, `angle: 6-Month Ambassador`, `engagement: ${influencer.engagementRate || 'High'}%`],
      },
      {
        angle: 'VIP Audience Giveaway & Promo Code',
        subject: `Exclusive Perk for ${influencer.name}'s Community!`,
        hook: `Special audience giveaway for your ${followerStr} followers!`,
        body: `Hi ${influencer.name},\n\nYour dedication to ${niche} content really stands out on ${influencer.platform}. We want to treat your community to an exclusive giveaway bundle valued at $300 + a dedicated 20% discount code for your followers.\n\nWe handle all shipping and prize fulfillment directly so there is zero hassle for you.\n\nInterested in co-hosting this giveaway next week?\n\nBest regards,\nCommunity Team`,
        dm: `Hey ${influencer.name}! Want to co-host a $300 product giveaway for your ${niche} audience? We cover all shipping & prize costs!`,
        signals: [`niche: ${niche}`, `angle: VIP Audience Giveaway`, `community: ${influencer.audienceGeography || 'Global'}`],
      },
    ];

    const chosen = angles[angleIndex];

    console.log(`[DemoLLM Dynamic] Selected Angle ${angleIndex + 1}: ${chosen.angle} for ${influencer.name}`);

    return {
      emailSubject: chosen.subject,
      emailBody: chosen.body,
      instagramDM: chosen.dm,
      personalizationSignals: chosen.signals,
    };
  }

  async analyzeContent(influencer: IInfluencer) {
    const niche = influencer.niche || 'general';
    return {
      contentThemes: influencer.contentThemes.length > 0
        ? influencer.contentThemes
        : [`${niche} tips`, `${niche} lifestyle`],
      tone: 'Educational and motivating',
      audience: `${niche} enthusiasts`,
      collaborationAngles: ['UGC Review', 'Sponsored Reel', 'Brand Ambassador', 'Audience Giveaway'],
    };
  }
}
