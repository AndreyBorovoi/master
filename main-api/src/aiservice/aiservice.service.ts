import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AIService, AIServiceDocument } from '../schemas/aiservice.schema';
import { User, UserDocument } from '../schemas/user.schema';
import * as randomstring from 'randomstring';
import * as fetch from 'node-fetch';
import { K8sApi } from './K8sApi';

function randomPort() {
  let rand = 1 + Math.random() * 65535;
  return Math.round(rand);
}

@Injectable()
export class AiserviceService {
  k8sApi: K8sApi;

  constructor(
    @InjectModel(AIService.name)
    private aiServiceModel: Model<AIServiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.k8sApi = new K8sApi();
  }

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

  async create(token: string, model: Buffer, description?: string) {
    const user = await this.getUserByToken(token);
    this.checkUser(user);
    const modelId = await this.generateModelId();
    const port = randomPort();

    const aiservice = new this.aiServiceModel({
      owner: user,
      model: model,
      modelId,
      description: description || '',
      port,
    });

    await aiservice.save();

    const { deployment, service } = await this.k8sApi.createAIService(
      modelId,
      port,
    );

    return {
      modelId: aiservice.modelId,
      port,
      deployment,
      service,
    };
  }

  async getAIServices(token: string) {
    const user = await this.getUserByToken(token);
    this.checkUser(user);
    const services = await this.aiServiceModel.find({ owner: user }).exec();
    return services.map((service: AIService) => {
      return {
        modelId: service.modelId,
        description: service.description,
      };
    });
  }

  // async loadModel(modelId: string, token: string, file: Buffer) {
  //   writeFileSync('model', file)
  // }

  async request(modelId: string) {
    const aiService = await this.getAIServiceByModelId(modelId);
    const port = aiService.port;

    const response = await (await fetch(`http://127.0.0.1:${port}`)).json();
    return response;
  }

  async start(modelId: string, token: string) {}

  async stop(modelId: string, token: string) {}

  async delete(modelId: string, token: string) {}

  private checkUser(user?: User) {
    //TODO: Вынести в guard
    if (!user) {
      throw new HttpException({ text: 'Wrong token' }, HttpStatus.UNAUTHORIZED);
    }
  }

  private async getUserByToken(token: string) {
    return await this.userModel.findOne({ token: token });
  }

  private async getAIServiceByModelId(modelId: string) {
    return await this.aiServiceModel.findOne({ modelId: modelId });
  }
}
