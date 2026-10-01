import { Request, Response, NextFunction } from 'express';
import { Influencer } from '../models/Influencer';
import { Outreach } from '../models/Outreach';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalInfluencers,
      qualified,
      rejected,
      pending,
      emailsGenerated,
      emailsSent,
      emailsSimulated,
      emailsFailed,
      byPlatform,
      byNiche,
    ] = await Promise.all([
      Influencer.countDocuments(),
      Influencer.countDocuments({ filterStatus: 'qualified' }),
      Influencer.countDocuments({ filterStatus: 'rejected' }),
      Influencer.countDocuments({ filterStatus: 'pending' }),
      Outreach.countDocuments(),
      Outreach.countDocuments({ status: 'sent' }),
      Outreach.countDocuments({ status: 'simulated' }),
      Outreach.countDocuments({ status: 'failed' }),
      Influencer.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Influencer.aggregate([
        { $group: { _id: '$niche', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const outreachByStatus = await Outreach.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        influencers: { total: totalInfluencers, qualified, rejected, pending },
        outreach: {
          total: emailsGenerated,
          sent: emailsSent,
          simulated: emailsSimulated,
          failed: emailsFailed,
          byStatus: outreachByStatus.map((s) => ({ status: s._id, count: s.count })),
        },
        charts: {
          byPlatform: byPlatform.map((p) => ({ platform: p._id, count: p.count })),
          byNiche: byNiche.map((n) => ({ niche: n._id, count: n.count })),
          filterStatus: [
            { status: 'qualified', count: qualified },
            { status: 'rejected', count: rejected },
            { status: 'pending', count: pending },
          ],
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
