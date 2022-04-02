import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIService, AIServiceSchema } from '../schemas/aiservice.schema';
import {
  UserResponse,
  UserResponseSchema,
} from '../schemas/userResponse.shema';
import { AiserviceController } from './aiservice.controller';
import { AiserviceService } from './aiservice.service';
import { RedisModule } from '../redis/redis.module';
import { K8sApiModule } from '../k8s-api/k8s-api.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AIService.name, schema: AIServiceSchema },
    ]),
    MongooseModule.forFeature([
      { name: UserResponse.name, schema: UserResponseSchema },
    ]),
    RedisModule,
    K8sApiModule,
    UserModule,
  ],
  controllers: [AiserviceController],
  providers: [AiserviceService],
})
export class AiserviceModule {}
