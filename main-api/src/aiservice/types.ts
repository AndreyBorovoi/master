import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from '../schemas/user.schema';

export type ResponseFromService = {
  prediction?: any[];
  error?: string;
  time?: number;
  status?: 'ok' | 'error' | 'internal_error';
};

export type ResponseToClient = {
  data: any[];
  response?: any;
  error?: string;
  time?: number;
  status: HttpStatus;
};

export type RequestWithUser = Request & { user: UserDocument };
