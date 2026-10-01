import nodemailer from 'nodemailer';
import { config } from '../../config';
import { Influencer } from '../../models/Influencer';
import { Outreach } from '../../models/Outreach';
import { AppError } from '../../middleware/errorHandler';

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
}

export interface SendResult {
  outreachId: string;
  influencerName: string;
  email: string;
  mode: 'sent' | 'simulated' | 'failed';
  error?: string;
}

/**
 * Send (or simulate) an outreach email for a given outreach document.
 * Duplicate protection: will not send if status is already 'sent' or 'simulated'.
 */
export async function sendOutreach(outreachId: string): Promise<SendResult> {
  const outreach = await Outreach.findById(outreachId).populate('influencerId');
  if (!outreach) throw new AppError('Outreach record not found', 404);

  const influencer = await Influencer.findById(outreach.influencerId);
  if (!influencer) throw new AppError('Influencer not found', 404);

  // Duplicate protection
  if (outreach.status === 'sent' || outreach.status === 'simulated') {
    throw new AppError(
      `Already contacted: ${influencer.name} (status: ${outreach.status})`,
      409
    );
  }

  if (outreach.status !== 'approved') {
    throw new AppError(
      `Outreach must be approved before sending (current status: ${outreach.status})`,
      400
    );
  }

  if (!outreach.email) {
    outreach.status = 'failed';
    outreach.errorMessage = 'No email address available';
    await outreach.save();
    return {
      outreachId,
      influencerName: influencer.name,
      email: '',
      mode: 'failed',
      error: 'No email address available',
    };
  }

  // Simulation mode — safe development guard
  if (config.emailMode === 'simulation') {
    outreach.status = 'simulated';
    outreach.sentAt = new Date();
    outreach.errorMessage = null;
    await outreach.save();

    console.log(
      `[Email] SIMULATED send to ${outreach.email} for ${influencer.name}`
    );

    return {
      outreachId,
      influencerName: influencer.name,
      email: outreach.email,
      mode: 'simulated',
    };
  }

  // Real email send
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: config.smtp.user,
      to: outreach.email,
      subject: outreach.emailSubject,
      text: outreach.emailMessage,
    });

    outreach.status = 'sent';
    outreach.sentAt = new Date();
    outreach.errorMessage = null;
    await outreach.save();

    return {
      outreachId,
      influencerName: influencer.name,
      email: outreach.email,
      mode: 'sent',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    outreach.status = 'failed';
    outreach.errorMessage = message;
    await outreach.save();

    return {
      outreachId,
      influencerName: influencer.name,
      email: outreach.email,
      mode: 'failed',
      error: message,
    };
  }
}

/** Approve an outreach record */
export async function approveOutreach(outreachId: string) {
  const outreach = await Outreach.findById(outreachId);
  if (!outreach) throw new AppError('Outreach record not found', 404);
  if (outreach.status !== 'draft') {
    throw new AppError(`Cannot approve outreach with status: ${outreach.status}`, 400);
  }
  outreach.status = 'approved';
  await outreach.save();
  return outreach;
}
