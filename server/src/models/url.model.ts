import mongoose, { Document, Schema, Types } from 'mongoose';
import { UrlDocument } from '../types/index.js';

export interface UrlModelDocument extends Omit<UrlDocument, '_id'>, Document {
  _id: Types.ObjectId;
}

const urlSchema = new Schema<UrlModelDocument>(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

urlSchema.index({ originalUrl: 1 });
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
urlSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UrlModel = mongoose.model<UrlModelDocument>('Url', urlSchema);