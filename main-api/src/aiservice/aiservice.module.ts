import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIService, AIServiceSchema } from '../schemas/aiservice.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  UserResponse,
  UserResponseSchema,
} from '../schemas/userResponse.shema';
import { AiserviceController } from './aiservice.controller';
import { AiserviceService } from './aiservice.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AIService.name, schema: AIServiceSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: UserResponse.name, schema: UserResponseSchema },
    ]),
    RedisModule,
  ],
  controllers: [AiserviceController],
  providers: [AiserviceService],
})
export class AiserviceModule {}
