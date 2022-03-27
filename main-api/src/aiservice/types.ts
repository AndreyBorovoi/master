import { HttpStatus } from '@nestjs/common';

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
