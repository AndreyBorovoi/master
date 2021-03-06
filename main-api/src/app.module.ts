import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AiserviceModule } from './aiservice/aiservice.module';
import { RedisModule } from './redis/redis.module';

const mongoConnectionString =
  process.env.MONGODB ||
  'mongodb+srv://testuser:testuser@cluster0.og9pt.mongodb.net/MainApi?retryWrites=true&w=majority';

@Module({
  imports: [
    MongooseModule.forRoot(mongoConnectionString),
    UserModule,
    AiserviceModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
