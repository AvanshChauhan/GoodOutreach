import { Request, Response, NextFunction } from 'express';
import { Outreach } from '../models/Outreach';
import { Influencer } from '../models/Influencer';
import { sendOutreach, approveOutreach } from '../services/outreach/outreachService';
import { AppError } from '../middleware/errorHandler';

export async function getOutreach(req: Request, res: Response, next: NextFunction) {
  try {
    const statusFilter = req.query.status as string | undefined;
    const filter: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'all') filter.status = statusFilter;

    const outreachList = await Outreach.find(filter)
      .populate('influencerId', 'name platform profileUrl followerCount engagementRate niche')
      .sort({ createdAt: -1 });

    const [total, draft, approved, sent, simulated, failed] = await Promise.all([
      Outreach.countDocuments(),
      Outreach.countDocuments({ status: 'draft' }),
      Outreach.countDocuments({ status: 'approved' }),
      Outreach.countDocuments({ status: 'sent' }),
      Outreach.countDocuments({ status: 'simulated' }),
      Outreach.countDocuments({ status: 'failed' }),
    ]);

    res.json({
      success: true,
      data: {
        outreach: outreachList,
        summary: { total, draft, approved, sent, simulated, failed },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOutreachById(req: Request, res: Response, next: NextFunction) {
  try {
    const outreach = await Outreach.findById(req.params.id).populate('influencerId');
    if (!outreach) throw new AppError('Outreach not found', 404);
    res.json({ success: true, data: outreach });
  } catch (err) {
    next(err);
  }
}

export async function approveOutreachController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const outreach = await approveOutreach(id);
    res.json({ success: true, data: outreach });
  } catch (err) {
    next(err);
  }
}

export async function sendOutreachController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await sendOutreach(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function simulateOutreachController(req: Request, res: Response, next: NextFunction) {
  try {
    // Force simulation mode for this endpoint regardless of env
    const outreach = await Outreach.findById(req.params.id);
    if (!outreach) throw new AppError('Outreach not found', 404);
    if (outreach.status === 'sent' || outreach.status === 'simulated') {
      throw new AppError(`Already contacted (status: ${outreach.status})`, 409);
    }
    outreach.status = 'simulated';
    outreach.sentAt = new Date();
    await outreach.save();
    const influencer = await Influencer.findById(outreach.influencerId);
    res.json({
      success: true,
      data: {
        mode: 'simulated',
        influencerName: influencer?.name,
        email: outreach.email,
        message: 'Simulated successfully — no real email was sent',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOutreachController(req: Request, res: Response, next: NextFunction) {
  try {
    const outreach = await Outreach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!outreach) throw new AppError('Outreach not found', 404);
    res.json({ success: true, data: outreach });
  } catch (err) {
    next(err);
  }
}
