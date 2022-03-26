export type ResponseFromService = {
  prediclion?: any;
  error?: string;
  time: number;
  status?: 'ok' | 'error' | 'internal_error';
};
