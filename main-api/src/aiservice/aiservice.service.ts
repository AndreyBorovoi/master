import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { AIService, AIServiceDocument } from '../schemas/aiservice.schema';
import { UserDocument } from '../schemas/user.schema';
import {
  UserResponse,
  UserResponseDocument,
} from '../schemas/userResponse.shema';

import { RedisService } from '../redis/redis.service';
import { K8sApiService } from '../k8s-api/k8s-api.service';

import * as randomstring from 'randomstring';

import { ResponseFromService, ResponseToClient } from './types';

@Injectable()
export class AiserviceService {
  constructor(
    @InjectModel(AIService.name)
    private aiServiceModel: Model<AIServiceDocument>,
    @InjectModel(UserResponse.name)
    private userResponseModel: Model<UserResponseDocument>,
    private redisService: RedisService,
    private k8sApiService: K8sApiService,
  ) {}

  async test() {}

  private async generateModelId() {
    let modelId: string;
    do {
      modelId = randomstring.generate({
        capitalization: 'lowercase',
        length: 10,
        charset: 'alphabetic',
      });
    } while (await this.getAIServiceByModelId(modelId));

    return modelId;
  }

  async create(model: Buffer, user: UserDocument) {
    const modelId = await this.generateModelId();
    const aiservice = new this.aiServiceModel({
      owner: user,
      model: model,
      modelId,
    });
    await aiservice.save();

    return {
      modelId: aiservice.modelId,
    };
  }

  async getAIServices(user: UserDocument) {
    const services = await this.aiServiceModel.find({ owner: user }).exec();
    return services.map((service: AIService) => {
      return {
        modelId: service.modelId,
      };
    });
  }

  async request(modelId: string, data: any[]) {
    const requestId = randomstring.generate({
      capitalization: 'lowercase',
      length: 10,
      charset: 'alphabetic',
    });

    console.log(`requests-${modelId}`, `request-${requestId}-${modelId}`);

    await this.redisService.addToList(`requests-${modelId}`, requestId);
    await this.redisService.addToList(
      `request-${requestId}-${modelId}`,
      JSON.stringify(data),
    );

    let responseFromService = await this.redisService.popFromList(
      `response-${requestId}-${modelId}`,
      20,
    );

    let element: ResponseFromService;

    if (responseFromService === null) {
      element = { status: 'internal_error' };
    } else {
      element = JSON.parse(responseFromService.element);
    }

    let clientResponce: ResponseToClient;

    switch (element.status) {
      case 'ok':
        clientResponce = {
          data,
          response: element.prediction,
          time: element.time,
          status: HttpStatus.OK,
        };
        break;

      case 'error':
        clientResponce = {
          data,
          error: element.error,
          time: element.time,
          status: HttpStatus.BAD_REQUEST,
        };
        break;

      case 'internal_error':
        clientResponce = {
          data,
          error: 'internal error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
        break;

      default:
        throw InternalServerErrorException;
    }

    // const userResponse = new this.userResponseModel({
    //   modelId,
    //   ...clientResponce,
    // });
    // userResponse.save();

    return clientResponce;
  }

  async start(service: AIServiceDocument, user: UserDocument) {
    const { deployment } = await this.k8sApiService.createAIService(service.modelId);
    return { deployment };
  }

  async stop(service: AIServiceDocument, user: UserDocument) {
    const response = await this.k8sApiService.deleteDeployment(service.modelId);
    return response;
  }

  async delete(service: AIServiceDocument, user: UserDocument) {
    return await service.deleteOne();
  }

  async status(service: AIServiceDocument, user: UserDocument) {
    const response = await this.k8sApiService.getDeploymentStatus(service.modelId);
    return response;
  }

  async getAIServiceByModelId(modelId: string) {
    return await this.aiServiceModel.findOne({ modelId: modelId });
  }
}
