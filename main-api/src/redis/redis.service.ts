import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

const redisHost = process.env.REDIS_SERVICE_SERVICE_HOST || 'localhost';
const redisPort = process.env.REDIS_SERVICE_SERVICE_PORT || '6379';

@Injectable()
export class RedisService {
  client: RedisClientType;

  constructor() {
    console.log(`redis ${redisHost}:${redisPort}`);
    this.client = createClient({
      url: `redis://${redisHost}:${redisPort}`,
    });

    this.client.on('error', (err) => console.log('Redis Client Error', err));

    this.client.connect();
  }

  async set(key: string, value: any) {
    return this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async addToList(name: string, data: string) {
    return this.client.LPUSH(name, data);
  }

  async popFromList(name: string, timeout: number = 0) {
    return this.client.BRPOP(name, timeout);
  }
}
