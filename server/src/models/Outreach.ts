import mongoose, { Schema, Types } from 'mongoose';
import { IOutreach } from '../types';

const OutreachSchema = new Schema<IOutreach>(
  {
    influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    emailSubject: { type: String, required: true },
    emailMessage: { type: String, required: true },
    instagramDM: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'approved', 'sent', 'simulated', 'failed'],
      default: 'draft',
    },
    sentAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    messageHash: { type: String, required: true },
    personalizationSignals: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Prevent duplicate outreach: one outreach record per influencer+hash combo
OutreachSchema.index({ influencerId: 1, messageHash: 1 }, { unique: true });
OutreachSchema.index({ influencerId: 1 });
OutreachSchema.index({ status: 1 });
OutreachSchema.index({ email: 1 });

export const Outreach = mongoose.model<IOutreach>('Outreach', OutreachSchema);
