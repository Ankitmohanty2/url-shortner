import { UrlModel } from '../models/url.model.js';
import { UrlDocument, UrlListQuery, UrlListResponseInternal } from '../types/index.js';
import mongoose from 'mongoose';

interface LeanUrlDoc {
  _id: mongoose.Types.ObjectId | string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  expiresAt?: Date;
  clickCount: number;
  isActive: boolean;
  lastAccessedAt?: Date;
}

function mapLeanDoc(doc: unknown): LeanUrlDoc {
  return doc as LeanUrlDoc;
}

export class UrlRepository {
  async findByShortCode(shortCode: string): Promise<UrlDocument | null> {
    const doc = await UrlModel.findOne({ shortCode, isActive: true }).lean().exec();
    return doc ? this.mapToUrlDocument(mapLeanDoc(doc)) : null;
  }

  async findByOriginalUrl(originalUrl: string): Promise<UrlDocument | null> {
    const doc = await UrlModel.findOne({ originalUrl, isActive: true }).lean().exec();
    return doc ? this.mapToUrlDocument(mapLeanDoc(doc)) : null;
  }

  async findById(id: string): Promise<UrlDocument | null> {
    const doc = await UrlModel.findById(id).lean().exec();
    return doc ? this.mapToUrlDocument(mapLeanDoc(doc)) : null;
  }

  async create(urlData: Partial<UrlDocument>): Promise<UrlDocument> {
    const doc = await UrlModel.create(urlData);
    return this.mapToUrlDocument(mapLeanDoc(doc.toObject()));
  }

  async incrementClickCount(shortCode: string): Promise<void> {
    await UrlModel.updateOne(
      { shortCode },
      {
        $inc: { clickCount: 1 },
        $set: { lastAccessedAt: new Date() },
      }
    ).exec();
  }

  async findAll(query: UrlListQuery): Promise<UrlListResponseInternal> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
    } = query;

    const filter: Record<string, unknown> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (search) {
      filter.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      UrlModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      UrlModel.countDocuments(filter).exec(),
    ]);

    return {
      urls: urls.map((doc) => this.mapToUrlDocument(mapLeanDoc(doc))),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async softDelete(shortCode: string): Promise<boolean> {
    const result = await UrlModel.updateOne(
      { shortCode },
      { $set: { isActive: false } }
    ).exec();
    return result.modifiedCount > 0;
  }

  async hardDelete(shortCode: string): Promise<boolean> {
    const result = await UrlModel.deleteOne({ shortCode }).exec();
    return result.deletedCount > 0;
  }

  async updateExpiration(shortCode: string, expiresAt: Date | null): Promise<boolean> {
    const result = await UrlModel.updateOne(
      { shortCode },
      { $set: { expiresAt } }
    ).exec();
    return result.modifiedCount > 0;
  }

  private mapToUrlDocument(doc: LeanUrlDoc): UrlDocument {
    return {
      _id: doc._id.toString(),
      originalUrl: doc.originalUrl,
      shortCode: doc.shortCode,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
      clickCount: doc.clickCount,
      isActive: doc.isActive,
      lastAccessedAt: doc.lastAccessedAt,
    };
  }
}

export const urlRepository = new UrlRepository();