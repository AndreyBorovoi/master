import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type AIServiceDocument = AIService & Document;

@Schema({ timestamps: true })
export class AIService {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ required: true, unique: true })
  modelId: string;

  @Prop({ required: true, unique: false })
  model: Buffer;

  @Prop()
  description: string;
}

export const AIServiceSchema = SchemaFactory.createForClass(AIService);
