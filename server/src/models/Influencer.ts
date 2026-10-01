import mongoose, { Schema } from 'mongoose';
import { IInfluencer } from '../types';

const InfluencerSchema = new Schema<IInfluencer>(
  {
    name: { type: String, required: true, trim: true },
    platform: {
      type: String,
      enum: ['Instagram', 'YouTube', 'TikTok', 'Other'],
      required: true,
    },
    profileUrl: { type: String, required: true, trim: true },
    followerCount: { type: Number, default: null },
    engagementRate: { type: Number, default: null },
    niche: { type: String, required: true, trim: true, lowercase: true },
    contentThemes: { type: [String], default: [] },
    contentDescription: { type: String, default: null },
    contactEmail: { type: String, default: null, lowercase: true, trim: true },
    website: { type: String, default: null },
    audienceAge: { type: String, default: null },
    audienceGender: { type: String, default: null },
    audienceGeography: { type: String, default: null },
    source: { type: String, required: true, default: 'manual' },
    sourceUrl: { type: String, default: null },
    filterStatus: {
      type: String,
      enum: ['pending', 'qualified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },
    enrichmentStatus: {
      type: String,
      enum: ['pending', 'completed', 'partial'],
      default: 'pending',
    },
    personalizationStatus: {
      type: String,
      enum: ['pending', 'generated', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Indexes
InfluencerSchema.index({ profileUrl: 1 }, { unique: true });
InfluencerSchema.index({ contactEmail: 1 }, { sparse: true });
InfluencerSchema.index({ platform: 1 });
InfluencerSchema.index({ niche: 1 });
InfluencerSchema.index({ filterStatus: 1 });
InfluencerSchema.index({ name: 'text', niche: 'text' });

export const Influencer = mongoose.model<IInfluencer>('Influencer', InfluencerSchema);
