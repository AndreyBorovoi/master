import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
	client: RedisClientType;

	constructor (){
		this.client = createClient()
		this.client.on('error', (err) => console.log('Redis Client Error', err));

		this.client.connect();
	}

	async set(key: any, value: any) {
		return this.client.set(key, value);
	}

	async get(key: any) {
		return this.client.get(key);
	}
}
