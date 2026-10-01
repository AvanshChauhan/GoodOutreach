import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { Influencer } from '../models/Influencer';
import { AppError } from '../middleware/errorHandler';
import { sanitizeString, parseNumber, parseArray, isValidEmail, isValidUrl } from '../utils/helpers';
import { ImportSummary } from '../types';

const InfluencerRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  platform: z.enum(['Instagram', 'YouTube', 'TikTok', 'Other']),
  profileUrl: z.string().url('Invalid profile URL'),
  followerCount: z.coerce.number().nullable().optional(),
  engagementRate: z.coerce.number().nullable().optional(),
  niche: z.string().min(1, 'Niche is required'),
  contentThemes: z.string().optional(),
  contentDescription: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  audienceAge: z.string().nullable().optional(),
  audienceGender: z.string().nullable().optional(),
  audienceGeography: z.string().nullable().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().nullable().optional(),
});

export async function getInfluencers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.filterStatus) filter.filterStatus = req.query.filterStatus;
    if (req.query.platform) filter.platform = req.query.platform;
    if (req.query.niche) filter.niche = { $regex: req.query.niche, $options: 'i' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { niche: { $regex: req.query.search, $options: 'i' } },
        { contactEmail: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [influencers, total] = await Promise.all([
      Influencer.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Influencer.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        influencers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getInfluencerById(req: Request, res: Response, next: NextFunction) {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) throw new AppError('Influencer not found', 404);
    res.json({ success: true, data: influencer });
  } catch (err) {
    next(err);
  }
}

export async function createInfluencer(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await Influencer.findOne({ profileUrl: req.body.profileUrl });
    if (existing) throw new AppError('Influencer with this profile URL already exists', 409);

    const influencer = new Influencer({
      ...req.body,
      niche: (req.body.niche || '').toLowerCase(),
      contentThemes: parseArray(req.body.contentThemes),
    });
    await influencer.save();
    res.status(201).json({ success: true, data: influencer });
  } catch (err) {
    next(err);
  }
}

export async function updateInfluencer(req: Request, res: Response, next: NextFunction) {
  try {
    const influencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!influencer) throw new AppError('Influencer not found', 404);
    res.json({ success: true, data: influencer });
  } catch (err) {
    next(err);
  }
}

export async function deleteInfluencer(req: Request, res: Response, next: NextFunction) {
  try {
    const influencer = await Influencer.findByIdAndDelete(req.params.id);
    if (!influencer) throw new AppError('Influencer not found', 404);
    res.json({ success: true, message: 'Influencer deleted' });
  } catch (err) {
    next(err);
  }
}

export async function importInfluencers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError('No CSV file uploaded', 400);

    const csvText = req.file.buffer.toString('utf-8');
    let records: Record<string, string>[];

    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new AppError('Invalid CSV format', 400);
    }

    const summary: ImportSummary = {
      total: records.length,
      imported: 0,
      skipped: 0,
      invalid: 0,
      duplicates: 0,
      errors: [],
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // header is row 1

      // Validate
      const parsed = InfluencerRowSchema.safeParse(row);
      if (!parsed.success) {
        summary.invalid++;
        summary.errors.push({
          row: rowNum,
          reason: parsed.error.errors.map((e) => `${e.path}: ${e.message}`).join(', '),
        });
        continue;
      }

      const data = parsed.data;

      // Duplicate check
      const existing = await Influencer.findOne({ profileUrl: data.profileUrl });
      if (existing) {
        summary.duplicates++;
        summary.skipped++;
        summary.errors.push({ row: rowNum, reason: `Duplicate profileUrl: ${data.profileUrl}` });
        continue;
      }

      // Email check
      const email = sanitizeString(data.contactEmail);
      const validEmail = email && isValidEmail(email) ? email : null;

      try {
        await Influencer.create({
          name: data.name,
          platform: data.platform,
          profileUrl: data.profileUrl,
          followerCount: parseNumber(data.followerCount),
          engagementRate: parseNumber(data.engagementRate),
          niche: (data.niche || '').toLowerCase().trim(),
          contentThemes: parseArray(data.contentThemes),
          contentDescription: sanitizeString(data.contentDescription),
          contactEmail: validEmail,
          website: sanitizeString(data.website),
          audienceAge: sanitizeString(data.audienceAge),
          audienceGender: sanitizeString(data.audienceGender),
          audienceGeography: sanitizeString(data.audienceGeography),
          source: data.source || 'csv-import',
          sourceUrl: sanitizeString(data.sourceUrl),
        });
        summary.imported++;
      } catch (dbErr) {
        summary.invalid++;
        summary.errors.push({
          row: rowNum,
          reason: dbErr instanceof Error ? dbErr.message : 'Database error',
        });
      }
    }

    summary.skipped = summary.total - summary.imported - summary.invalid;

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}
