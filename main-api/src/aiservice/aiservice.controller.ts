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
import { TokenGuard } from 'src/token.guard';
import { TokenWithModelIDGuard } from 'src/token-with-model-id.guard';

import { RequestWithUser, RequestWithUserAndService } from './types';

@Controller('aiservice')
export class AiserviceController {
  constructor(private aiserviceService: AiserviceService) {}

  @Get('test')
  async test() {
    return this.aiserviceService.test();
  }

  @Post('create/:token')
  @UseInterceptors(FileInterceptor('model'))
  @UseGuards(TokenGuard)
  async create(
    @UploadedFile() model: Express.Multer.File,
    @Req() { user }: RequestWithUser,
  ) {
    if (!model) {
      throw new BadRequestException({ text: 'add model' });
    }

    const serviceData = await this.aiserviceService.create(model.buffer, user);
    return { ...serviceData, status: HttpStatus.CREATED };
  }

  @Get('get_services/:token')
  @UseGuards(TokenGuard)
  async getServices(
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
  @UseGuards(TokenWithModelIDGuard)
  async start(
    @Req() { user, service }: RequestWithUserAndService,
  ) {
    const serviceData = await this.aiserviceService.start(service, user);
    return { ...serviceData, status: HttpStatus.ACCEPTED };
  }

  @Post('stop/:modelId/:token')
  @UseGuards(TokenWithModelIDGuard)
  async stop(
    @Req() { user, service }: RequestWithUserAndService,
  ) {
    const serviceData = await this.aiserviceService.stop(service, user);
    return { ...serviceData, status: HttpStatus.ACCEPTED };
  }

  @Post('delete/:modelId/:token')
  @UseGuards(TokenWithModelIDGuard)
  async delete(
    @Req() { user, service }: RequestWithUserAndService,
  ) {
    const response = await this.aiserviceService.delete(service, user);
    return { ...response, status: HttpStatus.ACCEPTED };
  }

  @Get('status/:modelId/:token')
  @UseGuards(TokenWithModelIDGuard)
  async status(
    @Req() { user, service }: RequestWithUserAndService,
  ) {
    await this.aiserviceService.status(service, user);
    return { status: HttpStatus.OK };
  }
}
