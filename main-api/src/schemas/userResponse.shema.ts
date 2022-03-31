import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';

import { Document } from 'mongoose';

export type UserResponseDocument = UserResponse & Document;

@Schema()
export class UserResponse {
  @Prop({ required: true })
  modelId: string;

  @Prop({ required: true })
  data: any[];

  @Prop({ required: false })
  response?: any[];

  @Prop({ required: false })
  time?: number;

  @Prop({ required: false })
  error?: string;

  @Prop()
  status: HttpStatus;
}

export const UserResponseSchema = SchemaFactory.createForClass(UserResponse);
