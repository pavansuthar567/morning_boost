import mongoose, { Schema, Document } from 'mongoose';

export interface ISurvey extends Document {
  name: string;
  phone: string;
  area: string;
  society: string;
  interestedProducts: string[];
  frequency: string;
  createdAt: Date;
}

const SurveySchema = new Schema<ISurvey>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String, required: true },
    society: { type: String, required: true },
    interestedProducts: [{ type: String }],
    frequency: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Survey || mongoose.model<ISurvey>('Survey', SurveySchema);
