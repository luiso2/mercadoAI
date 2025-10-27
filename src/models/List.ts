import { Schema, model, Document, Types } from 'mongoose';

export interface IItem {
  _id?: Types.ObjectId;
  name: string;
  qty: number;
  unit: string;
  notes?: string;
  status: 'pending' | 'bought' | 'skipped';
  category?: string;
  storeHint?: string;
  price?: number;
}

export interface IList extends Document {
  userId: string;
  title: string;
  items: IItem[];
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    qty: { type: Number, default: 1 },
    unit: { type: String, default: 'unit' },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'bought', 'skipped'], default: 'pending' },
    category: { type: String },
    storeHint: { type: String },
    price: { type: Number },
  },
  { _id: true }
);

const listSchema = new Schema<IList>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Shopping List' },
    items: { type: [itemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const List = model<IList>('List', listSchema);
