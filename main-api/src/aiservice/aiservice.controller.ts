import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RequestDto } from './dto/aisecvice.dto';
import { AiserviceService } from './aiservice.service';
import { TokenAuthorizationGuard } from 'src/token-authorization.guard';

import { RequestWithUser } from './types';

@Controller('aiservice')
export class AiserviceController {
  constructor(private aiserviceService: AiserviceService) {}

  @Get('test')
  async test() {
    return this.aiserviceService.test();
  }

  @Post('create/:token')
  @UseInterceptors(FileInterceptor('model'))
  @UseGuards(TokenAuthorizationGuard)
  async create(
    @Param('token') token: string,
    @UploadedFile() model: Express.Multer.File,
    @Req() { user }: RequestWithUser,
  ) {
    if (!model) {
      throw new BadRequestException({ text: 'add model' });
    }

    const modelData = await this.aiserviceService.create(model.buffer, user);
    return { ...modelData, status: HttpStatus.CREATED };
  }

  @Get('get_services/:token')
  @UseGuards(TokenAuthorizationGuard)
  async getServices(
    @Param('token') token: string,
    @Req() { user }: RequestWithUser,
  ) {
    const services = await this.aiserviceService.getAIServices(user);
    return { services, status: HttpStatus.OK };
  }

  @Get('request/:modelId')
  async request(
    @Param('modelId') modelId: string,
    @Body() { data }: RequestDto,
  ) {
    const response = await this.aiserviceService.request(modelId, data);

    return response;
  }

  @Post('start/:modelId/:token')
  @UseGuards(TokenAuthorizationGuard)
  async start(
    @Param('modelId') modelId: string,
    @Param('token') token: string,
    @Req() { user }: RequestWithUser,
  ) {
    const modelData = await this.aiserviceService.start(modelId, user);
    return { ...modelData, status: HttpStatus.ACCEPTED };
  }

  @Post('stop/:modelId/:token')
  @UseGuards(TokenAuthorizationGuard)
  async stop(
    @Param('modelId') modelId: string,
    @Param('token') token: string,
    @Req() { user }: RequestWithUser,
  ) {
    const modelData = await this.aiserviceService.stop(modelId, user);
    return { ...modelData, status: HttpStatus.ACCEPTED };
  }

  @Post('delete/:modelId/:token')
  @UseGuards(TokenAuthorizationGuard)
  async delete(
    @Param('modelId') modelId: string,
    @Param('token') token: string,
    @Req() { user }: RequestWithUser,
  ) {
    const modelData = await this.aiserviceService.delete(modelId, user);
    return { ...modelData, status: HttpStatus.ACCEPTED };
  }

  @Get('status/:modelId/:token')
  @UseGuards(TokenAuthorizationGuard)
  async status(
    @Param('modelId') modelId: string,
    @Param('token') token: string,
    @Req() { user }: RequestWithUser,
  ) {
    const modelData = await this.aiserviceService.status(modelId, user);
    return { ...modelData, status: HttpStatus.OK };
  }
}
